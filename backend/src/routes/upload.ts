import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';
import { checkUploadLimit, checkStorageLimit } from '../middleware/planLimits';

const router = Router();

const UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('[Uploads] Failed to create uploads directory:', err);
  }
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter
}).single('file');

// @route   POST /api/upload
// @desc    Upload fabric image
router.post('/', authenticateToken as any, checkUploadLimit as any, checkStorageLimit as any, (req: AuthRequest, res: Response) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
         res.status(400).json({ error: 'File size limit exceeded. Max is 5MB.' });
         return;
      }
       res.status(400).json({ error: `Multer upload error: ${err.message}` });
       return;
    } else if (err) {
       res.status(400).json({ error: err.message });
       return;
    }

    if (!req.file) {
       res.status(400).json({ error: 'No file uploaded.' });
       return;
    }

    try {
      // Read file and convert to Base64 data URL
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

      // Clean up the temporary file from disk immediately
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('[Upload] Failed to delete temporary file:', unlinkErr);
      }

      // Create upload in db with base64 dataUrl
      const uploadRecord = await db.createUpload(
        req.user!.id,
        req.file.filename,
        req.file.originalname,
        req.file.size,
        dataUrl
      );

      res.status(201).json({
        message: 'Image uploaded successfully.',
        upload: uploadRecord
      });
    } catch (dbErr: any) {
      console.error('Database save error after upload:', dbErr);
      res.status(500).json({ error: 'Failed to record upload in database.' });
    }
  });
});

// @route   GET /api/upload/raw/:id
// @desc    Get raw uploaded image (handles both disk and KV store fallback)
router.get('/raw/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const uploadRecord = await db.getUploadById(id);
    if (!uploadRecord) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // 1. Check if it's already a base64 dataUrl
    if (uploadRecord.file_path.startsWith('data:')) {
      const match = uploadRecord.file_path.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', contentType);
        res.send(buffer);
        return;
      }
    }

    // 2. Check if file exists on local disk
    const diskPath = path.join(UPLOADS_DIR, uploadRecord.filename);
    if (fs.existsSync(diskPath)) {
      res.sendFile(diskPath);
      return;
    }

    // 3. Fallback: Fetch from KV store
    const KV_IMG_URL = `https://kvdb.io/tcdakshbucket92929292/img_${id}`;
    try {
      const kvRes = await fetch(KV_IMG_URL);
      if (kvRes.ok) {
        const dataUrl = await kvRes.text();
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          const buffer = Buffer.from(match[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.send(buffer);
          return;
        }
      }
    } catch (kvErr) {
      console.error('[Upload Route] Failed to fetch image from KV fallback:', kvErr);
    }

    // 4. Second fallback: check sample images in read-only dir
    const samplePath = path.join(__dirname, '..', '..', 'uploads', uploadRecord.filename);
    if (fs.existsSync(samplePath)) {
      res.sendFile(samplePath);
      return;
    }

    res.status(404).json({ error: 'Image not found' });
  } catch (err) {
    console.error('[Upload Route] Error retrieving image:', err);
    res.status(500).json({ error: 'Error retrieving image' });
  }
});

export default router;
