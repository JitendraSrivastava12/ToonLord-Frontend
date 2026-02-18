import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Star, Crown, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../UserContext";
import { useAlert } from '../context/AlertContext';
const OFFERS = [
  { id: 'starter', coins: 100, price: 99, bonus: 0, icon: <Zap />, tag: 'Starter' },
  { id: 'popular', coins: 500, price: 449, bonus: 50, icon: <Star />, tag: 'Most Popular', highlight: true },
  { id: 'pro', coins: 1200, price: 999, bonus: 200, icon: <Crown />, tag: 'Best Value' },
];
const API_URL = import.meta.env.VITE_API_URL;
const CoinShopPage = () => {
  const navigate = useNavigate();
  const { isRedMode, user } = useContext(AppContext);
  const [loadingId, setLoadingId] = useState(null);
  const {showAlert}=useAlert();
  const accentText = isRedMode ? 'text-red-500' : 'text-blue-500';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-blue-600';
  const accentBorder = isRedMode ? 'border-red-500/50' : 'border-blue-500/50';
  const accentShadow = isRedMode ? 'shadow-red-500/20' : 'shadow-blue-500/20';

  // UPDATED HANDLER: Points to your new Controller-based Router
  const handleCheckout = async (offer) => {
    setLoadingId(offer.id);
    try {
      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceAmount: offer.price,
          coins: offer.coins + offer.bonus, // Total coins including bonus
          userId: user?._id
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirecting directly to the Stripe-hosted URL
        window.location.href = data.url;
      } else {
        console.error("Session creation failed", data);
        showAlert(data.error || "Payment failed to initialize.",'error');
      }
    } catch (err) {
      console.error("Backend connection failed:", err);
      showAlert("Vault connection offline. Please try again later.",'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 py-4 md:py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] hover:scale-110 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl  font-semibold   tracking-tighter">
              Coin <span className={accentText}>Treasury</span>
            </h1>
            <p className="opacity-40 text-[10px] font-bold   tracking-[0.2em]">Fuel your reading experience</p>
          </div>
        </div>

        {/* OFFERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <motion.div
              key={offer.id}
              whileHover={{ y: -5 }}
              className={`relative p-8 rounded-[2.5rem] border ${offer.highlight ? `${accentBorder} bg-opacity-5 ${isRedMode ? 'bg-red-500' : 'bg-blue-500'}` : 'border-[var(--border)] bg-[var(--bg-secondary)]'} flex flex-col items-center text-center space-y-4`}
            >
              {offer.highlight && (
                <span className={`absolute -top-3 px-4 py-1 rounded-full ${accentBg} text-[8px]  font-semibold   tracking-widest text-white shadow-lg`}>
                  {offer.tag}
                </span>
              )}
              
              <div className={`p-4 rounded-2xl ${offer.highlight ? `bg-opacity-20 ${isRedMode ? 'bg-red-500 text-red-500' : 'bg-blue-500 text-blue-500'}` : 'bg-[var(--bg-primary)] text-yellow-500'}`}>
                {offer.icon}
              </div>

              <div>
                <h3 className="text-4xl  font-semibold font-mono tracking-tighter">{offer.coins}</h3>
                <p className="text-[10px] font-bold opacity-40   tracking-widest">ToonCoins</p>
                {offer.bonus > 0 && (
                  <p className="text-[10px]  font-semibold text-green-500   mt-1">+{offer.bonus} Bonus Included</p>
                )}
              </div>

              <div className="w-full pt-4">
                <button 
                  onClick={() => handleCheckout(offer)}
                  disabled={loadingId === offer.id}
                  className={`w-full py-4 rounded-2xl  font-semibold   tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                    offer.highlight 
                    ? `${accentBg} text-white shadow-xl ${accentShadow}` 
                    : 'bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--text-dim)] shadow-sm'
                  }`}
                >
                  {loadingId === offer.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    `Buy for ₹${offer.price}`
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center justify-center py-10 opacity-30 space-y-4">
           <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold   tracking-widest">Secure Encrypted Transactions</span>
           </div>
           <p className="max-w-xs text-center text-[9px] leading-relaxed font-bold">
              Transactions processed by Stripe. Coins are credited to your vault instantly after verification.
           </p>
        </div>
      </div>
    </div>
  );
};

export default CoinShopPage;