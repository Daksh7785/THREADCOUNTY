import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Download
} from 'lucide-react';

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLANS: Record<string, { label: string; price: number; billing: string; features: string[]; color: string }> = {
  Free: {
    label: 'Free Plan',
    price: 0,
    billing: 'Forever free',
    features: ['3 fabric uploads/month', '5 MB storage', 'Basic analysis report'],
    color: 'slate'
  },
  Student: {
    label: 'Student Plan',
    price: 9.99,
    billing: 'per month',
    features: ['25 fabric uploads/month', '500 MB storage', 'Full AI analysis', 'PDF report export'],
    color: 'indigo'
  },
  Professional: {
    label: 'Professional Plan',
    price: 29.99,
    billing: 'per month',
    features: ['Unlimited uploads', '10 GB storage', 'Priority AI processing', 'Team sharing', 'API access'],
    color: 'violet'
  },
  Enterprise: {
    label: 'Enterprise Plan',
    price: 99.99,
    billing: 'per month',
    features: ['Unlimited everything', 'SLA guarantee', 'Custom integrations', 'Dedicated support', 'White-label export'],
    color: 'emerald'
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCard(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

// ─── Simple confetti canvas burst ────────────────────────────────────────────
function triggerConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 200,
    r: 4 + Math.random() * 6,
    d: 3 + Math.random() * 5,
    color: ['#4f46e5', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltAngleIncrement: Math.random() * 0.07 + 0.05
  }));

  let frame: number;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d;
      p.x += Math.sin(p.tiltAngle) * 2;
      p.tiltAngle += p.tiltAngleIncrement;
    });
    if (particles.some(p => p.y < canvas.height + 20)) {
      frame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CheckoutPage: React.FC = () => {
  const { plan } = useParams<{ plan: string }>();
  const navigate = useNavigate();
  const { token, updateUser, user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const planInfo = PLANS[plan || ''] || null;

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvc, setCvc]               = useState('');
  const [cardName, setCardName]     = useState('');
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // Flow state
  const [stage, setStage]     = useState<'form' | 'processing' | 'success'>('form');
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (!planInfo) navigate('/pricing');
  }, [planInfo]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) errs.cardNumber = 'Card number must be 16 digits.';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) errs.expiry = 'Use MM/YY format.';
    if (cvc.replace(/\D/g, '').length < 3) errs.cvc = 'CVC must be 3–4 digits.';
    if (!cardName.trim()) errs.cardName = 'Name on card is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (planInfo!.price === 0) {
      // Free plan — just update immediately
      await processPayment();
      return;
    }
    if (!validate()) return;
    await processPayment();
  };

  const processPayment = async () => {
    setStage('processing');
    try {
      // Simulate 2s processing delay
      await new Promise(r => setTimeout(r, 2000));

      // MOCK PAYMENT — NOT REAL — calls backend to update plan + generate invoice
      const res = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan, cardName })
      });

      if (!res.ok) throw new Error('Payment failed');
      const data = await res.json();
      setInvoice(data.invoice);

      // Update local user plan
      updateUser({ plan: plan as any });

      setStage('success');
      setTimeout(() => {
        if (canvasRef.current) triggerConfetti(canvasRef.current);
      }, 100);
    } catch (err) {
      setStage('form');
      setErrors({ submit: 'Payment processing failed. Please try again.' });
    }
  };

  if (!planInfo) return null;

  const isCurrentPlan = user?.plan === plan;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start justify-center px-4 py-12">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      <div className="w-full max-w-5xl">
        {/* Back link */}
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>

        {stage === 'success' ? (
          // ── Success State ───────────────────────────────────────────────
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl max-w-lg mx-auto space-y-6">
            <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                You're on {planInfo.label}! 🎉
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Your subscription is active. Invoice <strong>#{invoice?.id}</strong> has been generated.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-sm space-y-2 text-left border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-bold text-slate-800 dark:text-white">{planInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-600">{planInfo.price === 0 ? 'FREE' : `$${planInfo.price.toFixed(2)}/mo`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">Paid</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {invoice && (
                <a
                  href={`http://localhost:5000/api/checkout/invoice/${invoice.id}/download?token=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold hover:border-indigo-400 transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </a>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>

        ) : (
          // ── Form / Processing State ────────────────────────────────────
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Order Summary — Left */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Order Summary</p>
                <h2 className="text-xl font-extrabold">{planInfo.label}</h2>
                <p className="text-sm text-slate-500">{planInfo.billing}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                {planInfo.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Total Due Today</span>
                  <span className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">
                    {planInfo.price === 0 ? 'FREE' : `$${planInfo.price.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {planInfo.price === 0 ? 'No credit card required.' : 'Billed monthly. Cancel anytime.'}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>256-bit TLS encryption · SOC 2 compliant</span>
              </div>
            </div>

            {/* Card Form — Right */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-base">
                  {planInfo.price === 0 ? 'Confirm Free Plan' : 'Payment Information'}
                </h2>
                <Lock className="h-3.5 w-3.5 text-slate-400 ml-auto" />
              </div>

              {/* MOCK NOTICE */}
              <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 flex-shrink-0" />
                <span>DEMO MODE — This is a mock checkout. No real payment is processed. Enter any test values.</span>
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                  {errors.submit}
                </div>
              )}

              {isCurrentPlan ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">You're already on this plan!</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {planInfo.price > 0 && (
                    <>
                      {/* Card Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCard(e.target.value))}
                          className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors ${
                            errors.cardNumber ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {errors.cardNumber && <p className="text-rose-500 text-[10px]">{errors.cardNumber}</p>}
                      </div>

                      {/* Expiry + CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 block">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={e => setExpiry(formatExpiry(e.target.value))}
                            className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors ${
                              errors.expiry ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {errors.expiry && <p className="text-rose-500 text-[10px]">{errors.expiry}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 block">CVC</label>
                          <input
                            type="text"
                            placeholder="•••"
                            maxLength={4}
                            value={cvc}
                            onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                            className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors ${
                              errors.cvc ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {errors.cvc && <p className="text-rose-500 text-[10px]">{errors.cvc}</p>}
                        </div>
                      </div>

                      {/* Name on Card */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">Name on Card</label>
                        <input
                          type="text"
                          placeholder="Full name as on card"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                            errors.cardName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {errors.cardName && <p className="text-rose-500 text-[10px]">{errors.cardName}</p>}
                      </div>
                    </>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={stage === 'processing'}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg mt-2 ${
                      stage === 'processing'
                        ? 'bg-indigo-400 cursor-wait text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {stage === 'processing' ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing payment…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {planInfo.price === 0
                          ? 'Activate Free Plan'
                          : `Pay $${planInfo.price.toFixed(2)} Securely`}
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    By clicking {planInfo.price === 0 ? 'Activate' : 'Pay'}, you agree to our{' '}
                    <Link to="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link> and{' '}
                    <Link to="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
