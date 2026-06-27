import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Report, Upload } from '../models/db';

const REPORTS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'reports')
  : path.join(__dirname, '..', '..', 'reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    } catch (err) {
      console.warn('[ReportGenerator] Failed to create reports directory:', err);
    }
  }
}

export class ReportGenerator {
  private outputDir: string;

  constructor() {
    ensureReportsDir();
    this.outputDir = REPORTS_DIR;
  }

  /**
   * Generate a PDF report and return the path to the saved file.
   */
  async generate(report: Report, upload: Upload): Promise<string> {
    ensureReportsDir();
    const outputPath = path.join(this.outputDir, `report-${report.id}.pdf`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // ── Header ──────────────────────────────────────────────────────────────
      doc
        .rect(0, 0, doc.page.width, 80)
        .fill('#4f46e5');

      doc
        .fillColor('white')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('ThreadCounty', 50, 22, { align: 'left' });

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('AI-Powered Fabric Analysis Report', 50, 48, { align: 'left' });

      doc
        .fontSize(10)
        .text(new Date().toLocaleString(), 50, 48, { align: 'right', width: 495 });

      // ── Metadata & Image Side-by-Side ─────────────────────────────────────────
      doc.fillColor('#1e293b').y = 110;
      const metaY = doc.y;

      // Left Column: Details Header & Metadata
      doc.fontSize(13).font('Helvetica-Bold').text('Report Details', 50, metaY);
      doc.moveTo(50, metaY + 18).lineTo(320, metaY + 18).strokeColor('#e2e8f0').stroke();
      
      const metaRows = [
        ['Report ID', report.id],
        ['Filename', upload.original_name],
        ['File Size', `${(upload.file_size / 1024).toFixed(1)} KB`],
        ['Analysis Date', new Date(report.created_at).toLocaleString()],
      ];

      let currentMetaY = metaY + 28;
      doc.fontSize(10);
      for (const [label, value] of metaRows) {
        doc
          .fillColor('#64748b')
          .font('Helvetica-Bold')
          .text(label + ':', 50, currentMetaY, { width: 100 });
        doc
          .fillColor('#0f172a')
          .font('Helvetica')
          .text(value, 150, currentMetaY, { width: 170 });
        currentMetaY += 18;
      }

      // Right Column: Image Preview
      const possibleImagePaths = [
        path.resolve(upload.file_path),
        path.join(__dirname, '..', '..', upload.file_path),
        path.join(__dirname, '..', '..', 'uploads', path.basename(upload.file_path)),
      ];
      let imagePathToUse = '';
      for (const p of possibleImagePaths) {
        if (fs.existsSync(p)) {
          imagePathToUse = p;
          break;
        }
      }

      if (imagePathToUse) {
        try {
          doc.image(imagePathToUse, 360, metaY, {
            fit: [185, 110],
            align: 'center',
            valign: 'center'
          });
          // Draw a light border around the image
          doc
            .rect(360, metaY, 185, 110)
            .strokeColor('#cbd5e1')
            .lineWidth(1)
            .stroke();
        } catch (imgErr) {
          console.error('[ReportGenerator] Failed to embed image in PDF:', imgErr);
        }
      } else {
        // Fallback placeholder box
        doc
          .rect(360, metaY, 185, 110)
          .fillAndStroke('#f8fafc', '#cbd5e1');
        doc
          .fillColor('#94a3b8')
          .font('Helvetica')
          .fontSize(9)
          .text('Image Preview Unavailable', 360, metaY + 48, { width: 185, align: 'center' });
      }

      // Advance cursor below metadata and image block
      doc.y = metaY + 130;

      // ── Analysis Results Table ───────────────────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e293b').text('Analysis Results', 50);
      doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);

      const resultRows: [string, string, string][] = [
        ['Metric', 'Value', ''],
        ['Fabric Type', report.fabric_type, ''],
        ['Warp Thread Count', `${report.warp_count}`, 'threads/inch'],
        ['Weft Thread Count', `${report.weft_count}`, 'threads/inch'],
        ['Total Thread Density', `${report.thread_density}`, 'threads/inch²'],
        ['AI Confidence Score', `${(report.confidence * 100).toFixed(1)}%`, ''],
      ];

      const colX = [50, 280, 430];
      const rowH = 22;
      let rowY = doc.y;

      for (let i = 0; i < resultRows.length; i++) {
        const [label, value, unit] = resultRows[i];
        const isHeader = i === 0;

        if (isHeader) {
          doc.rect(50, rowY, 495, rowH).fill('#f1f5f9');
          doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9);
        } else {
          doc.fillColor(i % 2 === 0 ? '#f8fafc' : 'white').rect(50, rowY, 495, rowH).fill();
          doc.fillColor('#1e293b').font('Helvetica').fontSize(10);
        }

        doc
          .fillColor(isHeader ? '#475569' : '#1e293b')
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isHeader ? 9 : 10)
          .text(label, colX[0] + 5, rowY + 6, { width: 220, lineBreak: false });

        if (!isHeader) {
          doc
            .fillColor('#4f46e5')
            .font('Helvetica-Bold')
            .text(value, colX[1], rowY + 6, { width: 140, lineBreak: false });

          if (unit) {
            doc
              .fillColor('#94a3b8')
              .font('Helvetica')
              .fontSize(8)
              .text(unit, colX[2], rowY + 8, { lineBreak: false });
          }
        } else {
          doc.text(value, colX[1], rowY + 6, { width: 140, lineBreak: false });
        }

        rowY += rowH;
      }

      doc.y = rowY + 15;

      // ── AI Suggestions ───────────────────────────────────────────────────────
      if (report.suggestions && report.suggestions.length > 0) {
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#1e293b')
          .text('AI Quality Control Recommendations', 50);
        doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').stroke();
        doc.moveDown(0.6);

        let currentSuggestionY = doc.y;
        report.suggestions.forEach((s, i) => {
          doc
            .circle(60, currentSuggestionY + 6, 3.5)
            .fill('#4f46e5');

          doc
            .fillColor('#334155')
            .font('Helvetica')
            .fontSize(10)
            .text(`${s}`, 72, currentSuggestionY, { width: 468 });

          const textHeight = doc.heightOfString(s, { width: 468 });
          currentSuggestionY += Math.max(textHeight + 12, 22);
        });
        doc.y = currentSuggestionY;
      }

      // ── OCR Detected Text Section ────────────────────────────────────────────
      if (report.ocr_text && report.ocr_text.trim()) {
        doc.moveDown(1.5);
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#1e293b')
          .text('OCR Detected Text', 50);
        doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').stroke();
        doc.moveDown(0.6);

        doc
          .fillColor('#475569')
          .font('Courier')
          .fontSize(9.5)
          .text(report.ocr_text.trim(), 60, doc.y, { width: 480, lineGap: 2 });
      }

      // ── Footer ───────────────────────────────────────────────────────────────
      const footerY = doc.page.height - 50;
      doc
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .strokeColor('#e2e8f0')
        .stroke();

      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .font('Helvetica')
        .text(
          'ThreadCounty — AI-Powered Textile Analysis Platform. This report is generated automatically.',
          50,
          footerY + 8,
          { align: 'center', width: 495 }
        );

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }
}
