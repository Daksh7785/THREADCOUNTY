import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';

const router = Router();

router.use(authenticateToken as any);

// Helper list of mock fabric suggestions based on type
const FABRIC_SUGGESTIONS: { [key: string]: string[] } = {
  'Denim / Twill Weave': [
    'Warp yarn count is optimal for 12oz denim production.',
    'Warp tension is slightly high; consider backing off warp beam by 1.5% to mitigate edge curling.',
    'Weft density is highly consistent. Structural integrity meets grade-A standards.',
    'Slight hairiness detected in weft yarns. Inspect spinning ring frame travelers.'
  ],
  'Cotton / Plain Weave': [
    'Plain 1:1 interlacing pattern verified with 98% clarity.',
    'Thread count is perfectly aligned with commercial shirting standards (80x80 carded cotton).',
    'Weft crimp percentage is within 4% tolerance. Fabric hand feel will meet soft finish criteria.',
    'No broken picks or mispicks detected in this section.'
  ],
  'Linen / Plain Weave': [
    'Characteristic thick-and-thin slub effect detected in both warp and weft.',
    'Weft density shows a standard 3% spacing fluctuation, which is normal for linen aesthetic.',
    'Tensile strength estimate is high. Recommended for premium home textiles or summer apparel.',
    'Moisture-wicking porosity is calculated at an excellent 28% rating.'
  ],
  'Silk / Satin Weave': [
    'Satin weave pattern (5-harness float) verified. High luster rating.',
    'Float length consistency is 99%. No snagging risks detected.',
    'Warp thread count is extremely high (150 TPI). Ideal for premium bridalwear.',
    'Ensure low-friction tension bars are used in downstream processing.'
  ],
  'Canvas / Basket Weave': [
    'Double-thread basket weave (2x2) identified.',
    'Extreme density detected. Ideal for heavy-duty sailcloth or luggage applications.',
    'Warp and weft alignment matches 90-degree orthogonal target perfectly.',
    'Inspect temple rolls on loom to prevent minor width shrinkages.'
  ]
};

// @route   POST /api/report/analyze
// @desc    Analyze uploaded image & generate report
router.post('/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const { uploadId } = req.body;
    if (!uploadId) {
       res.status(400).json({ error: 'Upload ID is required.' });
       return;
    }

    const upload = await db.getUploadById(uploadId);
    if (!upload || upload.user_id !== req.user!.id) {
       res.status(404).json({ error: 'Upload not found or access denied.' });
       return;
    }

    // Check if report already exists for this upload
    const existingReport = await db.getReportByUploadId(uploadId);
    if (existingReport) {
       res.json({
        message: 'Report already exists.',
        report: existingReport,
        upload
      });
       return;
    }

    // Simulate AI Computer Vision processing (take 1.5 seconds)
    // We determine results based on the original file name
    const nameLower = upload.original_name.toLowerCase();
    let fabricType = 'Cotton / Plain Weave';
    let warp = 50;
    let weft = 50;
    let confidence = 0.95;

    if (nameLower.includes('denim') || nameLower.includes('twill') || nameLower.includes('jeans')) {
      fabricType = 'Denim / Twill Weave';
      warp = 64 + Math.floor(Math.random() * 8); // 64 - 72
      weft = 54 + Math.floor(Math.random() * 8); // 54 - 62
      confidence = 0.96 + Math.random() * 0.03; // 0.96 - 0.99
    } else if (nameLower.includes('linen') || nameLower.includes('slub')) {
      fabricType = 'Linen / Plain Weave';
      warp = 38 + Math.floor(Math.random() * 6); // 38 - 44
      weft = 36 + Math.floor(Math.random() * 6); // 36 - 42
      confidence = 0.92 + Math.random() * 0.04;
    } else if (nameLower.includes('silk') || nameLower.includes('satin')) {
      fabricType = 'Silk / Satin Weave';
      warp = 140 + Math.floor(Math.random() * 20); // 140 - 160
      weft = 110 + Math.floor(Math.random() * 20); // 110 - 130
      confidence = 0.95 + Math.random() * 0.04;
    } else if (nameLower.includes('canvas') || nameLower.includes('heavy') || nameLower.includes('basket')) {
      fabricType = 'Canvas / Basket Weave';
      warp = 28 + Math.floor(Math.random() * 6); // 28 - 34
      weft = 26 + Math.floor(Math.random() * 6); // 26 - 32
      confidence = 0.94 + Math.random() * 0.04;
    } else {
      // General random selection
      const types = Object.keys(FABRIC_SUGGESTIONS);
      fabricType = types[Math.floor(Math.random() * types.length)];
      if (fabricType === 'Denim / Twill Weave') {
        warp = 66; weft = 56;
      } else if (fabricType === 'Linen / Plain Weave') {
        warp = 40; weft = 38;
      } else if (fabricType === 'Silk / Satin Weave') {
        warp = 148; weft = 120;
      } else if (fabricType === 'Canvas / Basket Weave') {
        warp = 30; weft = 28;
      } else {
        warp = 48 + Math.floor(Math.random() * 12);
        weft = 46 + Math.floor(Math.random() * 12);
      }
      confidence = 0.91 + Math.random() * 0.07;
    }

    const suggestions = FABRIC_SUGGESTIONS[fabricType] || [
      'Fabric structure shows standard interlacing patterns.',
      'Yarn density is consistent throughout the analyzed region.',
      'Recommended for standard apparel production lines.'
    ];

    // Create report in db
    const report = await db.createReport(
      uploadId,
      req.user!.id,
      warp,
      weft,
      fabricType,
      parseFloat(confidence.toFixed(3)),
      suggestions
    );

    // Create system notification
    await db.createNotification(
      req.user!.id,
      'Fabric Analysis Complete',
      `Analysis for ${upload.original_name} finished. Fabric Type: ${fabricType}.`
    );

    res.status(201).json({
      message: 'Analysis completed successfully.',
      report,
      upload
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to complete fabric image analysis.' });
  }
});

// @route   GET /api/report/list
// @desc    Get all reports for the user
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    const reports = await db.getReportsByUser(req.user!.id);
    const uploads = await db.getUploadsByUser(req.user!.id);

    // Combine reports and uploads metadata
    const enrichedReports = reports.map(r => {
      const u = uploads.find(up => up.id === r.upload_id);
      return {
        ...r,
        upload: u || null
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(enrichedReports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reports list.' });
  }
});

// @route   GET /api/report/:id
// @desc    Get detailed report by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const report = await db.getReportById(req.params.id);
    if (!report) {
       res.status(404).json({ error: 'Report not found.' });
       return;
    }

    if (report.user_id !== req.user!.id && req.user!.role !== 'admin') {
       res.status(403).json({ error: 'Access denied.' });
       return;
    }

    const upload = await db.getUploadById(report.upload_id);
    res.json({
      report,
      upload
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve report.' });
  }
});

// @route   DELETE /api/report/:id
// @desc    Delete report & associated files
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const success = await db.deleteReport(req.params.id, req.user!.id, req.user!.role === 'admin');
    if (success) {
      res.json({ message: 'Report and image file deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Report not found or authorization failed.' });
    }
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

// @route   GET /api/report/:id/download
// @desc    Download report data (JSON or HTML print layout)
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  try {
    const report = await db.getReportById(req.params.id);
    if (!report) {
       res.status(404).json({ error: 'Report not found.' });
       return;
    }

    if (report.user_id !== req.user!.id && req.user!.role !== 'admin') {
       res.status(403).json({ error: 'Access denied.' });
       return;
    }

    const upload = await db.getUploadById(report.upload_id);
    const format = req.query.format || 'json';

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=threadcounty-report-${report.id}.json`);
      res.send(JSON.stringify({ report, upload }, null, 2));
      return;
    }

    // HTML beautiful print-friendly template
    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ThreadCounty Analysis Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; color: #4f46e5; font-weight: bold; }
          .meta-info { margin-bottom: 30px; font-size: 14px; color: #64748b; line-height: 1.5; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: #f8fafc; }
          .card-title { font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; font-weight: 600; }
          .card-value { font-size: 28px; font-weight: bold; color: #0f172a; }
          .highlight { color: #4f46e5; }
          .suggestions { margin-top: 30px; }
          .suggestions h3 { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
          .suggestions li { margin-bottom: 10px; line-height: 1.4; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ThreadCounty AI</div>
            <div>Fabric Structure Analysis Report</div>
          </div>
          <div class="no-print">
            <button onclick="window.print()" style="background:#4f46e5;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600;">Print Report</button>
          </div>
        </div>
        
        <div class="meta-info">
          <div><strong>Report ID:</strong> ${report.id}</div>
          <div><strong>Date Generated:</strong> ${new Date(report.created_at).toLocaleString()}</div>
          <div><strong>Original File:</strong> ${upload ? upload.original_name : 'N/A'}</div>
          <div><strong>File Size:</strong> ${upload ? (upload.file_size / 1024).toFixed(1) + ' KB' : 'N/A'}</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Fabric Type</div>
            <div class="card-value highlight">${report.fabric_type}</div>
          </div>
          <div class="card">
            <div class="card-title">AI Confidence</div>
            <div class="card-value">${(report.confidence * 100).toFixed(1)}%</div>
          </div>
          <div class="card">
            <div class="card-title">Warp Thread Count</div>
            <div class="card-value">${report.warp_count} <span style="font-size:16px;font-weight:normal;color:#64748b">Threads/Inch</span></div>
          </div>
          <div class="card">
            <div class="card-title">Weft Thread Count</div>
            <div class="card-value">${report.weft_count} <span style="font-size:16px;font-weight:normal;color:#64748b">Threads/Inch</span></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:30px">
          <div class="card-title">Total Thread Density</div>
          <div class="card-value" style="font-size:36px;color:#4f46e5">${report.thread_density} <span style="font-size:18px;font-weight:normal;color:#64748b">Total Threads / Inch²</span></div>
        </div>

        <div class="suggestions">
          <h3>AI Quality Control Recommendations</h3>
          <ul>
            ${report.suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          ThreadCounty Hackathon Project 2026. Automated fabric structure verification powered by Artificial Intelligence & Computer Vision.
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlReport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate download.' });
  }
});

export default router;
