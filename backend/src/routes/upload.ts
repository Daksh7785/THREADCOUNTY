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

export default router;
