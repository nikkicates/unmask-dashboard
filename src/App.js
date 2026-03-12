/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { 
  AlertTriangle, Layers, Loader2, ChevronRight, Activity, ShieldCheck, Calendar, FileText
} from 'lucide-react';

/**
 * STRATEGIC TRANSFORMATIONS PORTAL v5.7 - STABLE
 * Fixed: Missing icon import and improved Netlify variable detection
 */

const getSafeConfig = () => {
  // 1. Check for Canvas/Global Preview config first
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
    } catch (e) { console.error("Config parse fail"); }
  }

  // 2. Map Netlify variables (Brought in via process.env)
  // We use the optional chaining and empty string fallback for stability
  const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
  
  const config = {
    apiKey: (env.REACT_APP_FIREBASE_API_KEY || "").trim(),
    authDomain: (env.REACT_APP_FIREBASE_AUTH_DOMAIN || "").trim(),
    projectId: (env.REACT_APP_FIREBASE_PROJECT_ID || "").trim() || "unmask-audit-2026",
    storageBucket: (env.REACT_APP_FIREBASE_STORAGE_BUCKET || "").trim(),
    messagingSenderId: (env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
    appId: (env.REACT_APP_FIREBASE_APP_ID || "").trim()
  };

  return config.apiKey ? config : null;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [auditId] = useState(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const initEngine = async () => {
      try {
        const config = getSafeConfig();
        
        // If config is null, the variables aren't baked into the build yet
        if (!config) {
          throw new Error("Portal security configuration missing. Ensure REACT_APP_FIREBASE_API_KEY is in Netlify and click 'Clear cache and deploy'.");
        }

        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            try { await signInAnonymously(auth); } catch (e) { console.error("Auth bridge failed"); }
          }

          if (auditId) {
            const effectiveAppId = typeof __app_id !== 'undefined' ? __app_id : 'unmask-audit-2026';
            const docRef = doc(db, 'artifacts', effectiveAppId, 'public', 'data', 'structural_audits', auditId);
            
            onSnapshot(docRef, (snap) => {
              if (snap.exists()) {
                setAuditData(snap.data());
                setError(null);
              } else {
                setError(`ID_NOT_RECOGNIZED: "${auditId}" is not in the diagnostic database.`);
              }
              setLoading(false);
            }, (dbErr) => {
              setError(`ACCESS_DENIED: ${dbErr.message}`);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    initEngine();
  }, [auditId]);

  const handleAuthenticate = () => {
    if (inputValue.trim()) {
      window.location.search = `?id=${inputValue.trim().toUpperCase()}`;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#070e24] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#070e24] flex items-center justify-center p-10 font-urbanist text-white text-center">
      <div className="max-w-xl w-full bg-[#161d31] border border-red-400/20 rounded-[2.5rem] p-12 shadow-2xl">
        <AlertTriangle className="text-red-400 h-12 w-12 mx-auto mb-6" />
        <h2 className="text-2xl font-lora italic mb-4">System Access Alert</h2>
        <div className="bg-black/20 p-4 rounded-xl mb-8 font-mono text-red-300 text-[10px] break-all border border-red-900/30">
          {error}
        </div>
        <button onClick={() => window.location.search = ''} className="text-teal-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
          Return to Entrance
        </button>
      </div>
    </div>
  );

  if (!auditId) return (
    <div className="min-h-screen bg-[#070e24] flex flex-col items-center justify-center p-6 font-urbanist text-center">
      <div className="mb-16 relative flex justify-center scale-[1.35]">
        <div className="grid grid-cols-2 gap-1.5">
           <div className="w-5 h-5 bg-teal-500 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" />
           <div className="w-5 h-5 border-2 border-slate-500 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] translate-y-3.5 -translate-x-1" />
           <div className="w-5 h-5 bg-purple-600 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] -translate-y-2.5" />
        </div>
      </div>
      <div className="max-w-xl w-full mb-16">
        <h2 className="text-4xl lg:text-5xl font-lora text-white mb-6 italic">Secure Diagnostic Access</h2>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em]">Strategic Transformations Portal</p>
      </div>
      <div className="max-w-md w-full space-y-5">
        <input 
          type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          placeholder="......" 
          className="w-full bg-[#161d31] border border-white/5 rounded-2xl px-6 py-8 text-white text-center text-2xl font-mono focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAuthenticate(); }}
        />
        <button onClick={handleAuthenticate} className="w-full bg-[#163d8d] hover:bg-[#1e4eb0] text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">
          Authenticate Session
        </button>
      </div>
      <footer className="mt-24 text-[10px] text-slate-700 uppercase tracking-[0.2em] font-medium opacity-60">
        This diagnostic engine is proprietary IP. <br/> Unauthorized access is prohibited.
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#064680] text-white font-urbanist flex flex-col">
      <header className="border-b border-white/10 bg-[#04325c]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg">
               <div className="grid grid-cols-2 gap-1 scale-75">
                 <div className="w-3 h-3 bg-[#064680] rounded-sm" />
                 <div className="w-3 h-3 bg-teal-500 rounded-sm" />
                 <div className="w-3 h-3 bg-purple-600 rounded-sm" />
                 <div className="w-3 h-3 bg-[#064680] rounded-sm" />
               </div>
            </div>
            <div>
              <h1 className="text-xl font-lora font-bold text-white tracking-tighter leading-none uppercase">
                UNMASK <span className="text-teal-400 italic font-light lowercase text-lg">Diagnostic</span>
              </h1>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.4em] mt-2 italic">Ref: {auditId}</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="bg-teal-500/10 px-4 py-2 rounded-full border border-teal-500/20 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-400">Secure Live Stream</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7 space-y-16">
            {[
              { key: "authorityAlignment", label: "Authority Alignment" },
              { key: "operationalSqueeze", label: "Operational Squeeze" },
              { key: "maskingDensity", label: "Masking Density" },
              { key: "escalationDensity", label: "Escalation Density" }
            ].map((field) => (
              <div key={field.key}>
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-xl font-urbanist font-black uppercase tracking-widest text-white/90 leading-none">{field.label}</h3>
                  <div className="text-5xl font-urbanist font-black text-teal-400 tracking-tighter">
                    {(auditData?.[field.key] || 1.0).toFixed(1)}
                  </div>
                </div>
                <div className="h-3 bg-black/20 rounded-full border border-white/5 overflow-hidden p-[2px]">
                  <div className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-cyan-400 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                    style={{ width: `${((auditData?.[field.key] || 1.0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-[#04325c] p-12 lg:p-14 rounded-[3.5rem] border border-white/10 shadow-2xl relative">
               <h2 className="text-xl font-lora italic text-white/60 mb-10 uppercase tracking-widest">Aggregate Strain</h2>
               <div className="text-8xl lg:text-9xl font-urbanist font-black text-teal-400 tracking-tighter mb-6 leading-none">
                 {(auditData?.totalStrainScore || 1.0).toFixed(2)}
               </div>
               <p className="text-[11px] text-white/30 uppercase font-black tracking-[0.4em]">Health Index</p>
               <div className="h-px w-20 bg-white/10 my-10" />
               <Activity className="text-teal-400/20 h-10 w-10 animate-pulse" />
            </div>
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 italic font-lora text-white/70 text-lg leading-relaxed shadow-lg">
               {auditData?.totalStrainScore > 3.5 ? "Critical strain detected in structural load-paths." : "Structural integrity remains within stable parameters."}
            </div>
          </div>
        </div>
      </main>

      <section className="bg-white/5 border-t border-white/10 py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-lora italic text-white mb-4">Ready to Recalibrate?</h2>
            <p className="text-white/50 font-urbanist font-light mb-12 text-lg">Redesign systems, don't just manage symptoms.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="https://strategictransformations.com/book" className="bg-white text-[#064680] px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl flex items-center gap-3">
                <Calendar size={18} /> Book Discovery <span className="text-xs opacity-50 font-light lowercase">with Nikki Cates</span>
              </a>
              <button onClick={() => window.print()} className="text-white/30 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                <FileText size={14} /> EXPORT PDF AUDIT
              </button>
            </div>
          </div>
      </section>

      <footer className="py-16 text-center text-white/5 text-[10px] font-black tracking-[1em] uppercase">
        &copy; 2026 STRATEGIC TRANSFORMATIONS &bull; PROPRIETARY UNMASK ENGINE
      </footer>
    </div>
  );
};

export default App;
