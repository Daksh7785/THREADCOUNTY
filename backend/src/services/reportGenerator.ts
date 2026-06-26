import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Report, Upload } from '../models/db';

const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    } catch {
      // Serverless — will use /tmp
    }
  }
}

export class ReportGenerator {
  private outputDir: string;

  constructor() {
    ensureReportsDir();
    this.outputDir = fs.existsSync(REPORTS_DIR) ? REPORTS_DIR : '/tmp';
  }

  /**
   * Generate a PDF report and return the path to the saved file.
   */
  async generate(report: Report, upload: Upload): Promise<string> {
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
        .text(new Date().toLocaleString(), { align: 'right' })
        .moveDown(0);

      // ── Metadata ─────────────────────────────────────────────────────────────
      doc.fillColor('#1e293b').moveDown(2);

      doc.fontSize(13).font('Helvetica-Bold').text('Report Details', 50);
      doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.4);

      const metaRows = [
        ['Report ID', report.id],
        ['Filename', upload.original_name],
        ['File Size', `${(upload.file_size / 1024).toFixed(1)} KB`],
        ['Analysis Date', new Date(report.created_at).toLocaleString()],
      ];

      doc.fontSize(10).font('Helvetica');
      for (const [label, value] of metaRows) {
        doc
          .fillColor('#64748b')
          .text(label + ':', 50, doc.y, { continued: true, width: 150 })
          .fillColor('#0f172a')
          .text(value, { indent: 10 });
      }

      doc.moveDown(1);

      // ── Analysis Results ─────────────────────────────────────────────────────
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

      doc.y = rowY + 10;
      doc.moveDown(1);

      // ── AI Suggestions ───────────────────────────────────────────────────────
      if (report.suggestions && report.suggestions.length > 0) {
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#1e293b')
          .text('AI Quality Control Recommendations', 50);
        doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').stroke();
        doc.moveDown(0.5);

        report.suggestions.forEach((s, i) => {
          // Bullet marker
          doc
            .circle(60, doc.y + 5, 3)
            .fill('#4f46e5');

          doc
            .fillColor('#334155')
            .font('Helvetica')
            .fontSize(10)
            .text(`${i + 1}. ${s}`, 72, doc.y - 8, { width: 468 });

          doc.moveDown(0.4);
        });
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
