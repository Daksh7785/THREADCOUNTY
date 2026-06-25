import { Router, Request, Response } from 'express';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// ─── Gemini API Call ──────────────────────────────────────────────────────────
async function callGemini(userMessage: string, history: ChatMessage[]): Promise<string> {
  const systemContext = `You are ThreadCounty AI, an expert textile engineering assistant built into the ThreadCounty fabric analysis platform. 
You specialize in:
- Fabric structure analysis (warp/weft counts, thread density in TPI)
- Weave classification (Plain, Twill/Denim, Satin, Canvas/Basket, Linen)
- Yarn quality assessment and defect detection
- Textile manufacturing recommendations
- Account and subscription management for ThreadCounty platform

ThreadCounty platform details:
- Plans: Free (3 uploads, 10MB storage), Student ($15/mo, 25 uploads, 50MB), Professional ($49/mo, 200 uploads, 250MB), Enterprise ($149/mo, unlimited)
- Features: AI fabric image analysis, thread density reports, warp/weft counting, PDF report export, side-by-side comparison
- Supported image formats: JPEG, PNG (up to 50MB on Pro plan)

Be concise, professional, and helpful. Keep responses under 150 words.`;

  // Build contents: inject system context as the first user turn for v1 compatibility
  const firstUserMessage = history.length === 0
    ? `[System context: ${systemContext}]\n\nUser: ${userMessage}`
    : userMessage;

  const contents = [
    // If there's history, inject system as a preamble in the very first message
    ...(history.length > 0
      ? [{
          role: 'user' as const,
          parts: [{ text: `[System context: ${systemContext}]\n\nUser: ${history[0].content}` }]
        },
        ...history.slice(1).map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content }]
        }))]
      : []),
    {
      role: 'user' as const,
      parts: [{ text: firstUserMessage }]
    }
  ];

  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
      topP: 0.9
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data: any = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text in Gemini response');
  return text.trim();
}

// ─── Intelligent Rule-Based Fallback ─────────────────────────────────────────
function getRuleBasedResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return "Hello! I'm ThreadCounty AI — your textile analysis expert. I can help you understand fabric structure, thread density, weave types, or your account. What would you like to know?";
  }
  if (lower.includes('tpi') || lower.includes('thread count') || lower.includes('density')) {
    return "Thread density (TPI) is calculated as Warp Threads/Inch + Weft Threads/Inch. Higher TPI means finer, stronger fabric. ThreadCounty's AI detects individual yarn crossings in your uploaded image to calculate this automatically. Upload a JPEG or PNG to get started!";
  }
  if (lower.includes('warp') || lower.includes('weft')) {
    return "Warp threads run vertically (lengthwise) on the loom, while weft threads run horizontally (crosswise). The ratio of warp to weft determines fabric strength, drape, and elasticity. ThreadCounty reports both counts separately for full quality control insight.";
  }
  if (lower.includes('plain weave') || lower.includes('twill') || lower.includes('satin') || lower.includes('canvas') || lower.includes('weave') || lower.includes('pattern')) {
    return "ThreadCounty detects 5 major weave structures: (1) Plain Weave – 1:1 interlacing, balanced. (2) Twill/Denim – diagonal pattern, strong. (3) Satin Weave – long floats, lustrous. (4) Canvas/Basket – 2×2 double thread, heavy-duty. (5) Linen Plain – slub texture, breathable. Visit the Compare page to contrast two fabric swatches!";
  }
  if (lower.includes('denim') || lower.includes('jeans')) {
    return "Denim is a Twill Weave fabric typically with 60–80 warp TPI and 50–65 weft TPI, giving it that characteristic diagonal rib. Our AI checks for warp tension consistency and weft alignment, flagging any production inconsistencies for 12oz–16oz denim manufacturing.";
  }
  if (lower.includes('silk') || lower.includes('satin')) {
    return "Silk Satin fabrics typically have 120–160+ warp TPI with a 5-harness float structure creating the signature luster. ThreadCounty's analysis checks float length consistency and surface snag risks. Confidence scores above 95% are common for premium mulberry silk samples.";
  }
  if (lower.includes('linen')) {
    return "Linen fabric features a characteristic slub texture from thick-and-thin yarn irregularities. Expected thread counts are 35–50 TPI for both warp and weft. ThreadCounty's AI accounts for these natural variations and doesn't flag them as defects — it's part of the linen aesthetic!";
  }
  if (lower.includes('cotton')) {
    return "Cotton in a Plain Weave (1:1 interlacing) typically yields 80–100+ TPI for shirting quality. ThreadCounty looks for weft crimp percentage within 4% tolerance and checks for broken picks or mispicks in the scanned region. High-quality combed cotton scores 97%+ confidence.";
  }
  if (lower.includes('wool')) {
    return "Wool and Merino blends in a Twill structure typically have 28–40 TPI — lower than cotton due to the thicker fiber diameter. ThreadCounty's analysis checks pilling risk based on fiber surface density and recommends appropriate downstream finishing treatments.";
  }
  if (lower.includes('upload') || lower.includes('analyze') || lower.includes('analysis')) {
    return "To analyze fabric: go to Upload page → select a JPEG/PNG microscope image of your fabric → click 'Analyze'. Results arrive in seconds — warp count, weft count, total thread density, weave classification, and AI quality recommendations. Reports can be downloaded as JSON or HTML/PDF.";
  }
  if (lower.includes('download') || lower.includes('pdf') || lower.includes('export') || lower.includes('report')) {
    return "From the History page or any Report detail page, click 'Download' to export your analysis. Two formats available: (1) JSON – structured data for integration with QC systems. (2) HTML/Print – browser-printable report with all metrics and AI recommendations, ideal for sharing with clients.";
  }
  if (lower.includes('compare') || lower.includes('side by side') || lower.includes('comparison')) {
    return "The Compare feature (sidebar → Compare) lets you select two analysis reports and view them side-by-side — fabric type, warp/weft counts, thread density, confidence, and suggestions. Perfect for A/B testing yarn batches or verifying fabric consistency across production runs.";
  }
  if (lower.includes('plan') || lower.includes('price') || lower.includes('pricing') || lower.includes('upgrade') || lower.includes('subscribe') || lower.includes('free') || lower.includes('student') || lower.includes('professional') || lower.includes('enterprise')) {
    return "ThreadCounty has 4 plans: 🆓 Free – 3 uploads, 10MB | 📚 Student $15/mo – 25 uploads, 50MB | ⚡ Professional $49/mo – 200 uploads, 250MB | 🏢 Enterprise $149/mo – unlimited uploads, 2GB. Upgrade any time from the Pricing page. All plans include full AI analysis and report downloads.";
  }
  if (lower.includes('storage') || lower.includes('limit') || lower.includes('quota')) {
    return "Storage limits per plan: Free → 10MB, Student → 50MB, Professional → 250MB, Enterprise → 2GB. Your current usage is shown on the Dashboard as a progress bar. Once you approach the limit, older analyses can be deleted from the History page to free up space.";
  }
  if (lower.includes('confidence') || lower.includes('accuracy') || lower.includes('ai')) {
    return "ThreadCounty reports a confidence score (0–100%) with every analysis. This reflects how clearly the AI could detect the thread grid in your image. For best accuracy: use a macro/microscope lens, ensure even lighting with no glare, keep fabric flat and taut, and capture at 200–500x magnification.";
  }
  if (lower.includes('image') || lower.includes('photo') || lower.includes('camera') || lower.includes('microscope') || lower.includes('lens')) {
    return "For optimal analysis results, use a USB digital microscope (100x–500x) or a smartphone macro lens attachment. Image should be: minimum 800×800px, good contrast, even diffuse lighting, fabric perfectly flat. JPEG or PNG accepted. Blurry or low-contrast images will give lower confidence scores.";
  }
  if (lower.includes('delete') || lower.includes('remove')) {
    return "To delete a report: go to History → find the report → click the 'Delete' (trash) icon. This permanently removes both the analysis report and the associated uploaded image file. This action cannot be undone. Storage quota is automatically recalculated after deletion.";
  }
  if (lower.includes('account') || lower.includes('profile') || lower.includes('settings')) {
    return "Manage your account from the Profile page (sidebar avatar → Profile). You can update your name, company, avatar, and change your password. Account deletion is available at the bottom of the profile page. Google-authenticated accounts don't need a separate password.";
  }
  if (lower.includes('password') || lower.includes('forgot') || lower.includes('reset')) {
    return "To reset your password: go to Login page → click 'Forgot password?' → enter your email → you'll receive a 6-digit OTP code → enter the code and set a new password. Google sign-in users don't use passwords — simply continue signing in with Google.";
  }
  if (lower.includes('google') || lower.includes('sign in') || lower.includes('login') || lower.includes('oauth')) {
    return "ThreadCounty supports Google Sign-In for quick, passwordless authentication. Click 'Continue with Google' on the login or signup page. Your Google account name and avatar are automatically imported. Google sessions last 30 days by default.";
  }
  if (lower.includes('api') || lower.includes('integration') || lower.includes('webhook')) {
    return "Enterprise plan users get access to the ThreadCounty REST API for direct integration into automated inspection lines. API authentication uses JWT Bearer tokens. Contact our team via the Contact page for API documentation, webhook setup, and custom SLA agreements.";
  }
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('great') || lower.includes('perfect') || lower.includes('awesome')) {
    return "You're very welcome! If you need any more help with fabric analysis, thread counting, or your account, just ask. Happy analyzing! 🧵";
  }

  return "I'm ThreadCounty AI — specialized in textile analysis, fabric structure, and platform features. Could you ask about: thread density (TPI), weave types (Plain/Twill/Satin), fabric upload & analysis, plan pricing, or report downloads? I'm here to help!";
}

// ─── Route: POST /api/chat ────────────────────────────────────────────────────
// @desc    AI chat endpoint — uses Gemini if configured, smart fallback otherwise
// @access  Public (no auth required for demo accessibility)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const trimmedMessage = message.trim().substring(0, 500); // cap input length

    // Validate history format
    const validHistory: ChatMessage[] = Array.isArray(history)
      ? history
          .filter((m: any) => m && (m.role === 'user' || m.role === 'model') && typeof m.content === 'string')
          .slice(-10) // keep last 10 messages for context
      : [];

    let reply: string;
    let source: 'gemini' | 'fallback';

    if (GEMINI_API_KEY) {
      try {
        reply = await callGemini(trimmedMessage, validHistory);
        source = 'gemini';
      } catch (geminiErr: any) {
        console.error('[Chat] Gemini API error, using fallback:', geminiErr.message);
        reply = getRuleBasedResponse(trimmedMessage);
        source = 'fallback';
      }
    } else {
      reply = getRuleBasedResponse(trimmedMessage);
      source = 'fallback';
    }

    res.json({ reply, source });
  } catch (error: any) {
    console.error('[Chat] Unexpected error:', error);
    res.status(500).json({ error: 'Chat service temporarily unavailable.' });
  }
});

export default router;
