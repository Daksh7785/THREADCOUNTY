/**
 * emailService.ts
 * Sends transactional emails via Resend API.
 * Falls back to console logging in dev if RESEND_API_KEY is not set.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@threadcounty.app';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@threadcounty.app';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — logging email instead of sending:');
    console.log(`  TO: ${payload.to}`);
    console.log(`  SUBJECT: ${payload.subject}`);
    return true; // Pretend success in dev mode
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `ThreadCounty <${FROM_EMAIL}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email] Resend API error:', err);
      return false;
    }

    const data = await res.json();
    console.log('[Email] Sent successfully, id:', (data as any).id);
    return true;
  } catch (err: any) {
    console.error('[Email] Failed to send email:', err.message);
    return false;
  }
}

// ── Email Templates ────────────────────────────────────────────────────────────

export async function sendPasswordResetOTP(to: string, name: string, otp: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset — ThreadCounty</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🧵 ThreadCounty</div>
              <div style="font-size:13px;color:#c4b5fd;margin-top:4px;">AI-Powered Fabric Intelligence</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 8px;font-weight:700;">Password Reset Request</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">
                Hi ${name}, we received a request to reset the password for your ThreadCounty account. Use the verification code below — it expires in <strong style="color:#f1f5f9;">15 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#0f172a;border:2px solid #4f46e5;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6366f1;margin-bottom:12px;font-weight:600;">Your verification code</div>
                <div style="font-size:40px;font-weight:900;color:#fff;letter-spacing:12px;font-family:monospace;">${otp}</div>
              </div>

              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <div style="border-top:1px solid #334155;padding-top:20px;margin-top:20px;">
                <p style="color:#64748b;font-size:12px;margin:0;">
                  Need help? Contact us at 
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#6366f1;text-decoration:none;">${SUPPORT_EMAIL}</a>
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#334155;font-size:11px;margin:0;">© ${new Date().getFullYear()} ThreadCounty. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to,
    subject: `${otp} is your ThreadCounty verification code`,
    html
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Welcome to ThreadCounty</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#fff;">🧵 ThreadCounty</div>
              <div style="font-size:13px;color:#c4b5fd;margin-top:4px;">AI-Powered Fabric Intelligence</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 8px;">Welcome, ${name}! 🎉</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Your ThreadCounty account is ready. Start analyzing fabric structure with AI-powered thread counting and weave detection.
              </p>
              <div style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="color:#c4b5fd;font-size:13px;font-weight:600;margin-bottom:12px;">✨ What you can do:</div>
                <ul style="color:#94a3b8;font-size:13px;line-height:2;margin:0;padding-left:20px;">
                  <li>Upload fabric microscope images for AI analysis</li>
                  <li>Get instant warp &amp; weft thread count reports</li>
                  <li>Detect weave patterns (Plain, Twill, Satin, Canvas)</li>
                  <li>Download PDF quality control reports</li>
                  <li>Compare two fabric samples side-by-side</li>
                </ul>
              </div>
              <a href="http://localhost:5173/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
                Go to Dashboard →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#334155;font-size:11px;margin:0;">© ${new Date().getFullYear()} ThreadCounty. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({ to, subject: 'Welcome to ThreadCounty! 🧵', html });
}

export default { sendPasswordResetOTP, sendWelcomeEmail };
