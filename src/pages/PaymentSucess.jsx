import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from "../UserContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle, ArrowRight, Download, ShieldCheck, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const { setUser, isRedMode } = useContext(AppContext);
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  // Theme-based styling (Matches your ProfilePage logic)
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';
  const accentBorder = isRedMode ? 'border-red-500/20' : 'border-[var(--accent)]/20';

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/payments/verify/${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentData(data);
          setUser(prev => ({
            ...prev,
            wallet: { ...prev.wallet, toonCoins: data.coins }
          }));
          // Satisfying delay for vault sync animation
          setTimeout(() => setStatus('success'), 2000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
    confirmPayment();
  }, [sessionId, setUser]);

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("TOONLORD TREASURY", 14, 22);
    autoTable(doc, {
      startY: 50,
      head: [['Description', 'Quantity', 'Status']],
      body: [['ToonCoins Purchase', `${paymentData?.coinsPurchased || 'N/A'} Coins`, 'Success']],
      headStyles: { fillColor: isRedMode ? [220, 38, 38] : [59, 130, 246] }
    });
    doc.save(`ToonLord_Receipt_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background Glow - Theme Responsive */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full transition-colors duration-1000 opacity-10 ${
        status === 'success' ? 'bg-green-500' : isRedMode ? 'bg-red-600' : 'bg-blue-600'
      }`} />

      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              <Loader2 className={`animate-spin ${accentText}`} size={50} strokeWidth={1.5} />
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }} 
                transition={{ repeat: Infinity, duration: 2 }} 
                className={`absolute inset-0 blur-2xl rounded-full ${accentBg} opacity-20`} 
              />
            </div>
            <h2 className={`text-xl font-black uppercase italic tracking-[0.3em] ${accentText}`}>Synchronizing</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-2">Accessing Treasury Vault</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            key="success" 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="relative z-10 w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] p-10 shadow-2xl text-center"
          >
            {/* SUCCESS TICK ANIMATION */}
            <div className="relative mb-8 flex justify-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1.5, opacity: 0 }} 
                transition={{ duration: 1.5, repeat: Infinity }} 
                className="absolute w-20 h-20 border-2 border-green-500/50 rounded-full" 
              />
              <motion.div 
                initial={{ scale: 0, rotate: -45 }} 
                animate={{ scale: 1, rotate: 0 }} 
                transition={{ type: "spring", damping: 12 }}
                className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]"
              >
                <motion.svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path 
                    initial={{ pathLength: 0 }} 
                    animate={{ pathLength: 1 }} 
                    transition={{ delay: 0.2, duration: 0.5 }} 
                    d="M20 6L9 17L4 12" 
                  />
                </motion.svg>
              </motion.div>
            </div>

            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Vault <span className="text-green-500">Synced</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mb-10">Identity Credits Updated</p>
            
            <div className="space-y-3 mb-8">
              <button 
                onClick={generateInvoice} 
                className="w-full flex items-center justify-between p-5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl hover:bg-[var(--border)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-green-500 group-hover:animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Download Receipt</span>
                </div>
                <ShieldCheck size={16} className="opacity-20" />
              </button>

              <button 
                onClick={() => navigate('/wallet')} 
                className={`w-full group flex items-center justify-center gap-3 py-5 rounded-2xl ${accentBg} text-white text-xs font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all`}
              >
                Return to Wallet <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 opacity-10 text-[8px] font-black uppercase tracking-[0.3em]">
              <Activity size={12} />
              Verified Transaction Log
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="relative z-10 text-center bg-[var(--bg-secondary)] p-12 rounded-[3rem] border border-red-500/20 max-w-sm shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-red-500 text-center">Protocol Error</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed mb-8">Verification failed. If funds were deducted, please contact support.</p>
            <button 
              onClick={() => navigate('/coin-shop')} 
              className="w-full py-4 rounded-xl border border-red-500/50 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Retry Connection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSuccess;