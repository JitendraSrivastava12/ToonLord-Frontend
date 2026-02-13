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
  const navigate = useNavigate();

  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';

  const toonCoins = user?.wallet?.toonCoins ?? 0;
  const withdrawable = user?.wallet?.creatorEarnings?.pendingBalance ?? 0;
  const transactions = user?.transactions || [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-12 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Wallet</h1>
            <p className="opacity-40 text-[11px] font-bold uppercase tracking-widest mt-2">
              Account Balance & Activity
            </p>
          </div>
          <WalletIcon size={34} className={accentText} />
        </div>

        {/* BALANCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BalanceCard 
            label="ToonCoins Balance" 
            amount={toonCoins} 
            icon={<Coins size={22}/>} 
            color="yellow" 
          />

          {user?.role === 'author' && (
            <BalanceCard 
              label="Withdrawable Earnings" 
              amount={withdrawable} 
              icon={<TrendingUp size={22}/>} 
              color="green" 
              isMoney 
            />
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-yellow-500/40 transition-all">
            <PlayCircle size={18} className="text-yellow-500" />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Watch Ad (+5 Coins)
            </span>
          </button>

          <button 
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl ${accentBg} text-white shadow-lg hover:scale-[1.02] transition-all`}
            onClick={() => navigate('/shop')}
          >
            <PlusCircle size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Buy Coins
            </span>
          </button>
        </div>

        {/* TRANSACTIONS */}
        <div className="p-8 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter">Transaction History</h2>
            <History size={20} className="opacity-20" />
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((tx, i) => {
              const isIn = tx.direction === 'in';
              const amount = Number(tx.amount || 0);

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] hover:border-[var(--text-dim)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isIn ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isIn ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">
                        {tx.type?.replace(/_/g, ' ') || 'Transaction'}
                      </p>
                      <p className="text-[9px] opacity-40 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-black font-mono ${isIn ? 'text-green-500' : 'text-red-500'}`}>
                      {isIn ? '+' : '-'}{amount}
                    </p>
                    <p className="text-[8px] opacity-40 uppercase font-black tracking-widest">
                      {tx.currency === 'toonCoins' ? 'TC' : tx.currency}
                    </p>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
                No transactions yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* BALANCE CARD */
const BalanceCard = ({ label, amount, icon, color, isMoney }) => {
  const formatted = isMoney
    ? `₹${Number(amount).toFixed(2)}`
    : Number(amount).toLocaleString();

  return (
    <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col justify-between h-40 relative overflow-hidden group">
      
      <div className={`absolute -right-4 -bottom-4 p-12 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:-rotate-12 text-${color}-500`}>
        {icon}
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
          {icon}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
          {label}
        </p>
      </div>

      <div>
        <p className="text-4xl font-black font-mono tracking-tighter">
          {formatted}
        </p>
        {isMoney && (
          <p className="text-[8px] font-bold uppercase opacity-30 mt-1">
            Available for withdrawal
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
