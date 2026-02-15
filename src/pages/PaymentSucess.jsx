import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from "../UserContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle, ArrowRight, Download, ShieldCheck, Activity, Crown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const API_URL = import.meta.env.VITE_API_URL;
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const { setUser, isRedMode } = useContext(AppContext);
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const mode = searchParams.get('mode'); // 'vip' or 'coins'

  const accentBg = isRedMode ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-900 hover:bg-zinc-800';
  const accentText = isRedMode ? 'text-red-600' : 'text-zinc-900';

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/payments/verify/${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentData(data);
          setUser(prev => {
            const updated = { ...prev };
            if (mode === 'vip') {
              updated.vipStatus = data.vip;
            } else {
              updated.wallet = { ...prev.wallet, toonCoins: data.coins };
            }
            return updated;
          });
          setTimeout(() => setStatus('success'), 2000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
    confirmPayment();
  }, [sessionId, setUser, mode]);

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("TOONLORD OFFICIAL RECEIPT", 14, 22);
    const body = mode === 'vip' 
      ? [['VIP Membership Activation', '1 Plan', 'Active']]
      : [['ToonCoins Purchase', `${paymentData?.coins || 'N/A'} TC`, 'Deposited']];

    autoTable(doc, {
      startY: 30,
      head: [['Item Description', 'Quantity', 'Status']],
      body: body,
      headStyles: { fillColor: isRedMode ? [220, 38, 38] : [24, 24, 27] }
    });
    doc.save(`ToonLord_Vault_Record.pdf`);
  };

  return (
    /* Key Fixes for Mobile:
       1. pt-28: Ensures the card doesn't hide under your navbar.
       2. overflow-x-hidden: Prevents side-scrolling/zooming issues.
       3. h-auto: Better than min-h-screen for mobile keyboard/browser UI shifts.
    */
    <div className="relative w-full h-auto min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] overflow-x-hidden">
      
      {/* Container to handle centering and Navbar clearance */}
      <div className="flex flex-col items-center justify-start pt-28 pb-12 px-5 sm:px-6">
        
        {/* Background Glow - Constrained to prevent navbar stretching */}
        <div className={`pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] blur-[100px] rounded-full transition-colors duration-1000 opacity-[0.05] z-0 ${
          status === 'success' ? 'bg-emerald-500' : isRedMode ? 'bg-red-600' : 'bg-zinc-900'
        }`} />

        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center z-10 py-20">
              <Loader2 className={`animate-spin ${accentText} mb-6`} size={40} />
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Syncing Vault</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mt-2">Accessing Neural Net...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success" 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="w-full max-w-[360px] sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl z-10 text-center"
            >
              <div className="flex justify-center mb-6 sm:mb-8">
                 <div className={`p-4 sm:p-5 rounded-full ${isRedMode ? 'bg-red-50' : 'bg-zinc-50'} border border-zinc-100`}>
                    {mode === 'vip' ? <Crown className="text-amber-500" size={28} /> : <ShieldCheck className="text-emerald-500" size={28} />}
                 </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter mb-2">
                Sync <span className={mode === 'vip' ? 'text-amber-500' : 'text-emerald-500'}>Complete</span>
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 sm:mb-10">Data Written to Ledger</p>
              
              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={generateInvoice} 
                  className="w-full flex items-center justify-between p-4 sm:p-5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl hover:bg-zinc-100/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Download size={16} className="text-zinc-500 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Save Receipt</span>
                  </div>
                  <Activity size={12} className="opacity-20" />
                </button>

                <button 
                  onClick={() => navigate(mode === 'vip' ? '/profile' : '/wallet')} 
                  className={`w-full group flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl ${accentBg} text-white text-[11px] font-black uppercase tracking-widest transition-all active:scale-95`}
                >
                  Confirm & Exit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)] opacity-10">
                 <p className="text-[8px] font-bold uppercase tracking-[0.2em]">Transaction Verfied // 0x{sessionId.substring(0,8)}</p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error" 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="w-full max-w-[340px] bg-[var(--bg-secondary)] p-10 rounded-[2.5rem] border border-red-500/20 shadow-2xl z-10 text-center"
            >
              <XCircle className="text-red-500 mx-auto mb-6" size={42} />
              <h1 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-red-600">Verification Failed</h1>
              <p className="text-[10px] font-bold uppercase opacity-40 leading-relaxed mb-8">
                The vault could not be synchronized. Please check your bank and try again.
              </p>
              <button 
                onClick={() => navigate('/shop')} 
                className="w-full py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest"
              >
                Return to Shop
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentSuccess;