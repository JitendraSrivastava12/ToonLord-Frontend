import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LuCheckCircle2, LuLoader, LuTrophy, LuCrown, LuArrowRight } from 'react-icons/lu';
import { AppContext } from '../UserContext';
import { getHeaders } from '../getItems/getAuthItems';

export default function PaymentSuccessSubscription() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, isRedMode } = useContext(AppContext);
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [details, setDetails] = useState(null);

  const sessionId = searchParams.get('session_id');
  const mode = searchParams.get('mode'); // 'coins' or 'vip'

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(
          `${API_URL}/api/payments/verify/${sessionId}`,
          getHeaders()
        );

        if (res.data.success) {
          // Update the global user state with the new balance/VIP status
          // If your backend returns the whole user object, use it here
          // Otherwise, trigger a profile fetch
          setDetails(res.data);
          setStatus('success');
        }
      } catch (err) {
        console.error("Verification failed", err);
        setStatus('error');
      }
    };

    verify();
  }, [sessionId]);

  const themeClass = isRedMode ? 'text-red-500' : 'text-emerald-500';
  const btnClass = isRedMode ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600';

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        <LuLoader className={`animate-spin ${themeClass}`} size={48} />
        <p className="mt-4   font-semibold uppercase tracking-widest opacity-50">Syncing with Stripe...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-center px-4">
        <h1 className="text-2xl   font-semibold uppercase text-red-500">Transaction Ambiguity</h1>
        <p className="opacity-60 max-w-sm mt-2">We couldn't verify your payment. If you were charged, your vault will update within 10 minutes.</p>
        <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 border border-[var(--border)] rounded-xl font-bold uppercase text-xs">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-10 text-center shadow-2xl">
        <div className={`inline-flex p-4 rounded-full bg-opacity-10 mb-6 ${isRedMode ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {mode === 'vip' ? <LuCrown className={themeClass} size={40} /> : <LuTrophy className={themeClass} size={40} />}
        </div>

        <h1 className="text-3xl   font-semibold uppercase   tracking-tighter mb-2">
          {mode === 'vip' ? 'VIP Protocol Active' : 'Vault Replenished'}
        </h1>
        
        <p className="text-sm font-bold opacity-60 mb-8 leading-relaxed">
          {mode === 'vip' 
            ? "Your account has been upgraded to Elite status. Enjoy your ad-free experience and exclusive discounts."
            : `Success! Your ToonCoins have been added to your wallet. You are ready to unlock more chapters.`}
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/library')} 
            className={`w-full py-4 rounded-2xl text-white   font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 ${btnClass}`}
          >
            Start Reading <LuArrowRight size={16} />
          </button>
          
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-main)]   font-semibold uppercase tracking-widest text-[10px]"
          >
            View My Vault
          </button>
        </div>
      </div>
    </div>
  );
}