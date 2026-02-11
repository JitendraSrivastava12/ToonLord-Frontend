import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, Coins, TrendingUp, 
  History, ArrowDownLeft, ArrowUpRight, PlayCircle, PlusCircle
} from 'lucide-react';
import { AppContext } from "../UserContext";
import { useNavigate } from 'react-router-dom';

const WalletPage = () => {
    
  const { isRedMode, user } = useContext(AppContext);
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-12 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Financial Core</h1>
            <p className="opacity-40 text-[10px] font-bold uppercase tracking-widest mt-2 text-blue-500">
              Unified Currency Protocol v2.0
            </p>
          </div>
          <WalletIcon size={32} className={accentText} />
        </div>

        {/* ASSET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Currency: toonCoins */}
          <BalanceCard 
            label="ToonCoins Balance" 
            amount={user?.wallet?.toonCoins} 
            icon={<Coins size={22}/>} 
            color="yellow" 
          />

          {/* Author Earnings */}
          {user?.role === 'author' && (
            <BalanceCard 
              label="Withdrawable Revenue" 
              amount={user?.wallet?.creatorEarnings?.withdrawableBalance} 
              icon={<TrendingUp size={22}/>} 
              color="green" 
              isMoney 
            />
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
           <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-yellow-500/50 transition-all group">
              <PlayCircle size={18} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Watch Ad (+5)</span>
           </button>
           <button className={`flex items-center justify-center gap-3 p-4 rounded-2xl ${accentBg} text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all`}onClick={() => navigate('/shop')}>
              <PlusCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Buy Coins</span>
           </button>
        </div>

        {/* TRANSACTION LEDGER */}
        <div className="p-8 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter">Transaction Log</h2>
            <History size={20} className="opacity-20" />
          </div>

          <div className="space-y-3">
            {user?.transactions?.length > 0 ? user.transactions.map((tx, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="flex items-center justify-between p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] group hover:border-[var(--text-dim)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.direction === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.direction === 'in' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                  </div>
                  <div>
                    {/* Cleaned up display of transaction types */}
                    <p className="text-xs font-bold uppercase tracking-tight">
                        {tx.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[9px] opacity-40 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black font-mono ${tx.direction === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.direction === 'in' ? '+' : '-'}{tx.amount}
                  </p>
                  <p className="text-[8px] opacity-40 uppercase font-black tracking-widest">
                    {tx.currency === 'toonCoins' ? 'TC' : tx.currency}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
                No Data Flow Detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* MINI COMPONENT */
const BalanceCard = ({ label, amount, icon, color, isMoney }) => (
  <div className={`p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col justify-between h-40 relative overflow-hidden group`}>
    {/* Decorative Background Icon */}
    <div className={`absolute -right-4 -bottom-4 p-12 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:-rotate-12 text-${color}-500`}>
      {icon}
    </div>
    
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        {icon}
      </div>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-50`}>{label}</p>
    </div>

    <div>
      <p className="text-4xl font-black font-mono tracking-tighter">
        {isMoney ? `₹${amount?.toFixed(2) || "0.00"}` : amount || 0}
      </p>
      {isMoney && <p className="text-[8px] font-bold uppercase opacity-30 mt-1">Available for payout</p>}
    </div>
  </div>
);

export default WalletPage;