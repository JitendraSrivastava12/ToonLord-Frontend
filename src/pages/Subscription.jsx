import axios from 'axios';
import React, { useState, useContext } from 'react';
import { LuCheck, LuZap, LuShieldCheck, LuCrown, LuInfo, LuLoader } from "react-icons/lu";
import { AppContext } from "../UserContext";

export default function Subscription() {
  const { isRedMode, currentTheme, user } = useContext(AppContext);
  const [processingId, setProcessingId] = useState(null);

  // --- INTERNAL HEADER HELPER ---
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  // Theme configuration derived from AppContext
  const theme = {
    primary: isRedMode ? 'bg-red-500' : 'bg-emerald-500',
    text: isRedMode ? 'text-red-500' : 'text-emerald-500',
    accent: isRedMode ? '#ef4444' : '#10b981', 
    button: isRedMode ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
    badge: isRedMode ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "4.99",
      period: "per month",
      savings: null,
      features: ["60% Discount on all purchases", "Completely Ad-free", "Early access to releases"],
      recommended: false
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: "12.99",
      period: "every 3 months",
      savings: "Save 15%",
      features: ["60% Discount on all purchases", "Completely Ad-free", "Early access to releases", "Exclusive member badge"],
      recommended: false
    },
    {
      id: "half-yearly",
      name: "Semi-Annual",
      price: "24.99",
      period: "every 6 months",
      savings: "Save 20%",
      features: ["60% Discount on all purchases", "Completely Ad-free", "Early access to releases", "Priority Support"],
      recommended: false
    },
    {
      id: "yearly",
      name: "Annual",
      price: "39.99",
      period: "per year",
      savings: "Save 40%",
      features: ["60% Discount on all purchases", "Completely Ad-free", "Early access to releases", "Full premium perks", "2 Bonus series included"],
      recommended: true
    }
  ];

  const handleSubscription = async (planId) => {
    if (!user) {
      alert("Please login to initialize VIP protocol.");
      return;
    }

    try {
      setProcessingId(planId);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const res = await axios.post(
        `${API_URL}/api/payments/subscription`,
        { 
            plan: planId,
            userId: user._id 
        },
        getHeaders() // Calling the internal helper
      );
      
      if (res.data.url) {
        localStorage.setItem("origin", "/subscription");
        window.location.href = res.data.url;
      }
    } catch (e) {
      console.error("Subscription Error:", e);
      alert("Neural link failed. Please try again.");
      setProcessingId(null);
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] py-4 px-4 md:px-8 theme-${currentTheme}`}>
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* --- PAGE HEADER --- */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${theme.badge}`}>
            <LuCrown size={14} />
            <span className="text-[10px]   font-semibold uppercase tracking-wider">Premium Access</span>
          </div>
          <h1 className="text-4xl   font-semibold uppercase italic tracking-tighter">Upgrade Your Experience</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold leading-relaxed opacity-70">
            Join our elite community for a <span className={`${theme.text}`}>60% discount</span> on all purchases and an ad-free interface.
          </p>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-[var(--card-bg)] border ${
                plan.recommended 
                  ? `${isRedMode ? 'border-red-500 shadow-red-500/20' : 'border-emerald-500 shadow-emerald-500/20'} shadow-2xl scale-[1.05] z-10` 
                  : 'border-[var(--text-main)]/10 shadow-sm'
              } rounded-[2rem] p-8 transition-all hover:scale-[1.02]`}
            >
              {plan.recommended && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.primary} text-white px-4 py-1 rounded-full text-[9px]   font-semibold uppercase tracking-widest shadow-lg`}>
                  Best Protocol
                </div>
              )}

              <div className="space-y-1 mb-8 text-left">
                <h3 className="text-[10px]   font-semibold uppercase opacity-50 tracking-widest">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl   font-semibold italic tracking-tighter">${plan.price}</span>
                  <span className="text-[10px] font-bold opacity-40 uppercase">{plan.period}</span>
                </div>
                {plan.savings && (
                  <span className={`inline-block text-[9px]   font-semibold px-2 py-0.5 rounded border uppercase mt-2 ${theme.badge}`}>
                    {plan.savings}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <LuCheck className={`${theme.text} mt-0.5 shrink-0`} size={16} />
                    <span className="text-xs font-bold opacity-70 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={processingId !== null}
                onClick={() => handleSubscription(plan.id)} 
                className={`w-full py-4 rounded-2xl text-[11px]   font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  plan.recommended 
                  ? `${theme.button} text-white shadow-xl active:scale-95` 
                  : 'bg-[var(--text-main)]/[0.05] border border-[var(--text-main)]/10 text-[var(--text-main)] hover:bg-[var(--text-main)]/[0.1]'
                } disabled:opacity-50`}
              >
                {processingId === plan.id ? (
                  <LuLoader className="animate-spin" size={14} />
                ) : (
                  'Initialize Plan'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* --- TRUST FOOTER --- */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[var(--text-main)]/10`}>
          <TrustItem icon={<LuShieldCheck size={20} />} title="Secure Payment" desc="Encrypted via Stripe Gateway" theme={theme} />
          <TrustItem icon={<LuZap size={20} />} title="Instant Access" desc="Neural link active immediately" theme={theme} />
          <TrustItem icon={<LuInfo size={20} />} title="Flexible Billing" desc="Cancel subscription at any time" theme={theme} />
        </div>
      </div>
    </div>
  );
}

const TrustItem = ({ icon, title, desc, theme }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--text-main)]/[0.02]">
    <div className={theme.text}>{icon}</div>
    <div className="text-left">
      <p className="text-[10px]   font-semibold uppercase tracking-widest">{title}</p>
      <p className="text-[11px] font-bold opacity-40">{desc}</p>
    </div>
  </div>
);