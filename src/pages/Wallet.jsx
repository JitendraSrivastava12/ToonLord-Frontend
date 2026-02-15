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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-12 py-4 md:py-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              View your balance and recent activity
            </p>
          </div>
          <WalletIcon size={32} className={accentText} />
        </div>

        {/* BALANCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BalanceCard 
            label="ToonCoins Balance" 
            amount={toonCoins} 
            icon={<Coins size={22}/>} 
            color="yellow" 
            description="Used for in-app purchases"
          />

          {user?.role === 'author' && (
            <BalanceCard 
              label="Available Earnings" 
              amount={withdrawable} 
              icon={<TrendingUp size={22}/>} 
              color="green" 
              isMoney 
              description="Eligible for withdrawal"
            />
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-yellow-500/40 transition">
            <PlayCircle size={18} className="text-yellow-500" />
            <span className="text-sm font-semibold">
              Watch Ad & Earn Coins
            </span>
          </button>

          <button 
            className={`flex items-center justify-center gap-3 p-4 rounded-xl ${accentBg} text-white shadow hover:scale-[1.02] transition`}
            onClick={() => navigate('/shop')}
          >
            <PlusCircle size={18} />
            <span className="text-sm font-semibold">
              Purchase Coins
            </span>
          </button>
        </div>

        {/* TRANSACTIONS */}
        <div className="p-8 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <History size={18} className="opacity-30" />
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((tx, i) => {
              const isIn = tx.direction === 'in';
              const amount = Number(tx.amount || 0);

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] hover:border-[var(--text-dim)] transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isIn ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isIn ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {tx.type?.replace(/_/g, ' ') || 'Transaction'}
                      </p>
                      <p className="text-xs text-[var(--text-dim)]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-bold ${isIn ? 'text-green-500' : 'text-red-500'}`}>
                      {isIn ? '+' : '-'}{amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--text-dim)]">
                      {tx.currency === 'toonCoins' ? 'TC' : tx.currency}
                    </p>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="py-16 text-center text-sm text-[var(--text-dim)]">
                No transactions available
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* BALANCE CARD */
const BalanceCard = ({ label, amount, icon, color, isMoney, description }) => {
  const formatted = isMoney
    ? `₹${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : Number(amount).toLocaleString();

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col justify-between h-40 relative overflow-hidden">
      
      <div className={`absolute -right-4 -bottom-4 p-12 opacity-[0.03] text-${color}-500`}>
        {icon}
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {label}
          </p>
          <p className="text-xs text-[var(--text-dim)]">
            {description}
          </p>
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold font-mono">
          {formatted}
        </p>
        {isMoney && (
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Ready for withdrawal
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
