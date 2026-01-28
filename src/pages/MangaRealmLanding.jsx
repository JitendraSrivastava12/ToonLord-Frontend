import React from 'react';
import { 
  Glasses, 
  ShieldCheck, 
  ArrowRight, 
  Lock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MangaRealmLanding = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#05060b] via-[#070814] to-black text-white font-sans selection:bg-rose-500/30 overflow-x-hidden">

      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[150px]" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[200px]" />

      {/* --- HERO SECTION --- */}
      <main className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 text-center">

        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-extrabold uppercase tracking-widest mb-12 shadow-lg shadow-rose-500/10 backdrop-blur">
          ⚡ v2.0 Now Available
        </div>
        
        {/* MAIN TEXT UNCHANGED */}
        <h1 className="text-4xl md:text-6xl font-black mb-10 leading-[1.05] tracking-tight max-w-4xl mx-auto">
          The Ultimate Platform for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Manga Enthusiasts & Creators
          </span>
        </h1>
        
        <p className="text-gray-400 max-w-1xl mx-auto text-lg leading-relaxed mb-20">
          Experience friendly reading modes, unlock premium content with points, or join as a creator to publish and earn. Choose your path below.
        </p>

        {/* --- SPLIT LOGIN CARDS --- */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* USER PORTAL */}
          <div className="group relative bg-gradient-to-b from-[#0b0d16]/90 to-[#07080f]/90 backdrop-blur-xl border border-rose-500/20 p-10 rounded-3xl transition-all hover:border-rose-500/50 hover:shadow-[0_0_80px_rgba(244,63,94,0.25)]">

            {/* glow overlay */}
            <div className="absolute inset-0 rounded-3xl bg-rose-500/5 opacity-0 group-hover:opacity-100 blur-xl transition" />

            <div className="relative">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/30 group-hover:scale-110 transition-transform">
                <Glasses className="text-rose-400" size={28} />
              </div>

              <h2 className="text-2xl md:text-4xl font-black mb-4 text-left">User Portal</h2>

              <p className="text-gray-400 text-left text-sm leading-relaxed mb-8">
                For readers and creators. Read manga, earn points, unlock premium chapters, or publish and monetize your own series.
              </p>

              <ul className="space-y-4 mb-10 text-left text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-rose-400" />
                  Unlimited Friendly Mode Reading
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-rose-400" />
                  Earn Points & Unlock Premium
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-rose-400" />
                  Creator Upload & Revenue Tools
                </li>
              </ul>

              <Link to="/Userlogin" className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:to-rose-700 text-white font-black py-4 rounded-xl flex items-center  justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-rose-500/30">
                User Login / Sign Up <ArrowRight size={18} />
              </Link> 
            </div>
          </div>

          {/* ADMIN PORTAL */}
          <div className="group relative bg-gradient-to-b from-[#0b0d16]/90 to-[#07080f]/90 backdrop-blur-xl border border-blue-500/20 p-10 rounded-3xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_80px_rgba(59,130,246,0.25)]">

            <div className="absolute inset-0 rounded-3xl bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-xl transition" />

            <div className="relative">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-blue-400" size={28} />
              </div>

              <h2 className="text-2xl md:text-4xl font-black mb-4 text-left">Admin Console</h2>

              <p className="text-gray-400 text-left text-sm leading-relaxed mb-8">
                Restricted access for administrators only. Manage users, content moderation, platform analytics, and revenue systems.
              </p>

              <ul className="space-y-4 mb-10 text-left text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-blue-400" />
                  Platform & User Management
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-blue-400" />
                  Content Moderation System
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-blue-400" />
                  Financial & System Analytics
                </li>
              </ul>

              <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                Admin Login <Lock size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- STATS BAR --- */}
      <section className="relative bg-[#0b0d16]/80 backdrop-blur border-y border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { label: 'Active Series', value: '12k+' },
            { label: 'Daily Readers', value: '850k' },
            { label: 'Chapters Uploaded', value: '2.4M' },
            { label: 'Creator Revenue', value: '$140k+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MangaRealmLanding;
