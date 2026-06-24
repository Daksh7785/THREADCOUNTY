import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Ideal for basic structural tests and individual students.',
      features: [
        '3 fabric scans per month',
        'Warp & Weft density calculation',
        'Standard plain weave classification',
        'Download JSON report files',
        '10 MB cloud storage quota'
      ],
      cta: 'Current Plan',
      popular: false,
      color: 'indigo'
    },
    {
      name: 'Student',
      price: '$9',
      description: 'Perfect for textile students and researchers.',
      features: [
        '25 fabric scans per month',
        'Plain & Twill weave identification',
        'AI manufacturing suggestions',
        'Interactive orthogonal overlays',
        'Download print-friendly reports',
        '50 MB cloud storage quota'
      ],
      cta: 'Upgrade to Student',
      popular: false,
      color: 'violet'
    },
    {
      name: 'Professional',
      price: '$49',
      description: 'Designed for quality control managers and laboratories.',
      features: [
        'Unlimited fabric scans',
        'All weave types supported (Satin, Basket)',
        'Advanced anomaly & pick defect detection',
        'Batch uploading support',
        'Priority AI server processing',
        '250 MB cloud storage quota',
        'Email customer support'
      ],
      cta: 'Go Professional',
      popular: true,
      color: 'pink'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Built for industrial mills operating automated inspection lines.',
      features: [
        'Dedicated custom AI model training',
        'On-premise factory camera integrations',
        'Automated REST API access keys',
        'Admin dashboards & team seats',
        '2 GB cloud storage quota',
        '24/7 dedicated support SLA',
        'Custom contract invoicing'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'emerald'
    }
  ];

  const handleUpgrade = (planName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.plan === planName) return;
    if (planName === 'Enterprise') {
      navigate('/contact');
      return;
    }
    // Navigate to the checkout flow (mock payment)
    navigate(`/checkout/${planName}`);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">Choose Your ThreadCounty Plan</h2>
        <p className="text-slate-500 text-sm">
          Simple, transparent pricing to power your textile research, design, and manufacturing lines.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isActive = user?.plan === plan.name;
          const cardColorClass = plan.popular 
            ? 'ring-2 ring-indigo-500 scale-[1.03] shadow-lg dark:bg-indigo-950/20' 
            : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40';

          return (
            <div 
              key={plan.name}
              className={`glass-panel border rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${cardColorClass}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="font-extrabold text-xl font-heading">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-slate-500 text-xs">/ month</span>}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  {plan.features.map((feat) => (
                    <li key={feat} className="text-xs flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isActive || loadingPlan !== null}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] ${
                    isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default' 
                      : plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {loadingPlan === plan.name ? (
                    <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : isActive ? (
                    'Active Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PricingPage;
