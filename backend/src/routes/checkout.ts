import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';
import { logger } from '../middleware/logger';

const router = Router();

// Prices per plan (in USD cents for display purposes — mock only)
const PLAN_PRICES: Record<string, { price: number; label: string }> = {
  Free:         { price: 0,    label: 'Free Plan' },
  Student:      { price: 999,  label: 'Student Plan' },
  Professional: { price: 2999, label: 'Professional Plan' },
  Enterprise:   { price: 9999, label: 'Enterprise Plan' }
};

// In-memory mock invoices store (for this session)
const mockInvoices: Record<string, any> = {};

// @route  POST /api/checkout
// @desc   Mock checkout — validates plan, upgrades user, creates fake invoice
// @access Protected
router.post('/', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, cardName } = req.body;

    if (!plan || !PLAN_PRICES[plan]) {
      res.status(400).json({ error: 'Invalid plan selected.' });
      return;
    }

    const planInfo = PLAN_PRICES[plan];

    // Simulate payment processing delay (handled on frontend, not here)
    // Update user's plan in DB
    await db.updateProfile(req.user!.id, { plan: plan as any });

    // Generate a mock invoice record
    const invoiceId = 'inv-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const invoice = {
      id: invoiceId,
      user_id: req.user!.id,
      plan,
      amount: planInfo.price,
      label: planInfo.label,
      status: 'paid',
      created_at: new Date().toISOString()
    };
    mockInvoices[invoiceId] = invoice;

    // Create a notification for the user
    await db.createNotification(
      req.user!.id,
      'Plan Upgraded 🎉',
      `Your subscription has been upgraded to the ${planInfo.label}. Enjoy your new features!`
    );

    logger.info('Checkout completed', { userId: req.user!.id, plan, invoiceId });

    res.status(201).json({
      message: 'Payment processed successfully.',
      invoice,
      plan
    });
  } catch (error: any) {
    logger.error('Checkout error', { error: error.message });
    res.status(500).json({ error: 'Failed to process checkout.' });
  }
});

// @route  GET /api/checkout/invoices
// @desc   List all invoices for the current user
// @access Protected
router.get('/invoices', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const userInvoices = Object.values(mockInvoices)
      .filter((inv: any) => inv.user_id === req.user!.id)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(userInvoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
});

// @route  GET /api/checkout/invoice/:id/download
// @desc   Download a mock invoice as a print-ready HTML page
// @access Protected
router.get('/invoice/:id/download', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = mockInvoices[req.params.id];
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    if (invoice.user_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const profile = await db.getProfileById(invoice.user_id);
    const formattedAmount = invoice.amount === 0 ? 'FREE' : `$${(invoice.amount / 100).toFixed(2)}`;
    const formattedDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const htmlInvoice = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ThreadCounty Invoice ${invoice.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 60px 40px; max-width: 720px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 24px; margin-bottom: 40px; }
          .brand { font-size: 22px; font-weight: 800; color: #4f46e5; }
          .brand span { color: #1e293b; }
          .invoice-title { font-size: 14px; color: #64748b; margin-top: 4px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
          .section-value { font-size: 16px; font-weight: 600; color: #0f172a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .line-items { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .line-items th { text-align: left; padding: 10px 12px; background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          .line-items td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .total-row td { font-weight: 800; font-size: 18px; color: #4f46e5; background: #f0f0ff; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #16a34a; }
          .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
          .no-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-bottom: 30px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

        <div class="header">
          <div>
            <div class="brand">Thread<span>County</span></div>
            <div class="invoice-title">AI-Powered Textile Platform</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px">Invoice</div>
            <div style="font-size:20px;font-weight:800;color:#0f172a">#${invoice.id}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">${formattedDate}</div>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="section-title">Billed To</div>
            <div class="section-value">${profile?.name || 'Account Holder'}</div>
            <div style="font-size:13px;color:#64748b;margin-top:4px">${profile?.email || ''}</div>
            ${profile?.company ? `<div style="font-size:13px;color:#64748b;">${profile.company}</div>` : ''}
          </div>
          <div class="section">
            <div class="section-title">Payment Status</div>
            <div style="margin-top:4px"><span class="badge">✓ Paid</span></div>
            <div style="font-size:12px;color:#64748b;margin-top:8px">Transaction ID: MOCK-${invoice.id}</div>
          </div>
        </div>

        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Billing Cycle</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${invoice.label}</strong><br><span style="font-size:12px;color:#64748b">ThreadCounty Subscription — Full Platform Access</span></td>
              <td>Monthly</td>
              <td style="text-align:right;font-weight:600">${formattedAmount}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2"><strong>Total Charged</strong></td>
              <td style="text-align:right">${formattedAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>ThreadCounty Hackathon Project 2026 · This is a <strong>MOCK INVOICE</strong> for demonstration purposes only — no real payment was charged.</p>
          <p style="margin-top:6px">Questions? Contact <a href="mailto:support@threadcounty.app">support@threadcounty.app</a></p>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice.' });
  }
});

export default router;
