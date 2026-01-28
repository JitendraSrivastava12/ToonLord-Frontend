import React, { useContext } from 'react';
import { CloudUpload, BarChart3, DollarSign, ChevronRight } from 'lucide-react';
import { AppContext } from "../UserContext"; // Adjust path to your context file

const CreatorCTA = () => {
  // 1. Consume global theme state from Context
  const { isRedMode } = useContext(AppContext);

  // 2. Dynamic styling based on global context
  const accentColor = isRedMode ? 'text-red-500' : 'text-green-400';
  const buttonBg = isRedMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600';

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl transition-all duration-500">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-black italic mb-4">
            Are you a <span className={`${accentColor} transition-colors duration-500`}>Creator?</span>
          </h2>
          <p className="text-gray-400 max-w-xl leading-relaxed mb-8">
            Upload your own manga. Track your readership, stats in real-time, 
            and monetize your content. Join our creator program today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button className={`flex items-center gap-3 px-8 py-4 rounded-xl text-black font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg ${buttonBg}`}>
              Start Uploading
              <CloudUpload size={18} fill="black" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-gray-300">
              View Dashboard Demo
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center lg:text-left">
          <div className="p-6 bg-white/5 rounded-lg border border-white/10 group hover:border-white/20 transition-all">
            <CloudUpload size={32} className={`${accentColor} mx-auto lg:mx-0 mb-3 transition-colors`} />
            <p className="font-bold text-gray-200">Easy Upload</p>
            <p className="text-xs text-gray-500 mt-1">Streamlined publishing tools.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-lg border border-white/10 group hover:border-white/20 transition-all">
            <BarChart3 size={32} className={`${accentColor} mx-auto lg:mx-0 mb-3 transition-colors`} />
            <p className="font-bold text-gray-200">Detailed Stats</p>
            <p className="text-xs text-gray-500 mt-1">Track views, reads, and earnings.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-lg border border-white/10 group hover:border-white/20 transition-all">
            <DollarSign size={32} className={`${accentColor} mx-auto lg:mx-0 mb-3 transition-colors`} />
            <p className="font-bold text-gray-200">Monetize</p>
            <p className="text-xs text-gray-500 mt-1">Earn points and direct payments.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorCTA;