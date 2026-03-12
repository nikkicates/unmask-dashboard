/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { 
  AlertTriangle, Layers, Loader2, ChevronRight, Activity, ShieldCheck, Calendar, Zap
} from 'lucide-react';

/**
 * UNMASK FRAMEWORK DIAGNOSTIC v5.2
 * Branding: Strategic Transformations (Blue #064680)
 * Typography: Lora (Serif) & Urbanist (Sans)
 */

// Safety helper for Netlify Environment Variables
const getEnv = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key].trim();
    }
  } catch (e) {}
  return null;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [auditId] = useState(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const initEngine = async () => {
      try {
        // 1. Fetch Configuration from Netlify or Canvas Globals
        const globalConfig = window.__firebase_config || {};
        const config = {
          apiKey: getEnv('REACT_APP_FIREBASE_API_KEY') || globalConfig.apiKey,
          authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || globalConfig.authDomain,
          projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID') || globalConfig.projectId || "unmask-audit-2026",
          storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET') || globalConfig.storageBucket,
          messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID') || globalConfig.messagingSenderId,
          appId: getEnv('REACT_APP_FIREBASE_APP_ID') || globalConfig.appId
        };

        if (!config.apiKey) {
          throw new Error("MISSING_KEYS: The engine is idling. Please ensure your Firebase keys are added to Netlify Environment Variables.");
        }

        // 2. Initialize
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        // 3. Auth & Data Stream
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            try { await signInAnonymously(auth); } catch (e) { console.error(e); }
          }

          if (auditId) {
            const effectiveAppId = typeof __app_id !== 'undefined' ? __app_id : 'unmask-audit-2026';
            const docRef = doc(db, 'artifacts', effectiveAppId, 'public', 'data', 'structural_audits', auditId);
            
            onSnapshot(docRef, (snap) => {
              if (snap.exists()) {
                setAuditData(snap.data());
                setError(null);
              } else {
                setError(`ID_NOT_FOUND: Record "${auditId}" not found.`);
              }
              setLoading(false);
            }, (err) => {
              setError(`DB_SYNC_ERROR: ${err.message}`);
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

  // --- VIEWS ---

  if (error) {
    return (
      <div className="min-h-screen bg-[#064680] flex items-center justify-center p-10 font-urbanist text-white">
        <div className="max-w-xl w-full bg-[#04325c] border border-red-400/20 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <AlertTriangle className="text-red-400 h-12 w-12 mx-auto mb-6" />
          <h2 className="text-2xl font-lora italic mb-4">System Access Error</h2>
          <div className="bg-black/20 p-4 rounded-xl mb-8 font-mono text-red-300 text-[10px] break-all border border-red-900/30">
            {error}
          </div>
          <button onClick={() => window.location.search = ''} className="text-teal-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
            Return to Entrance
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#064680] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
        <p className="text-white/40 font-urbanist font-black text-[10px] uppercase tracking-[0.5em]">Establishing Secure Stream</p>
      </div>
    );
  }

  if (!auditId) {
    return (
      <div className="min-h-screen bg-[#064680] flex items-center justify-center p-6 font-urbanist">
        <div className="max-w-md w-full bg-[#04325c] border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-400 group-hover:h-2 transition-all duration-500" />
          <Layers className="text-teal-400 h-16 w-16 mx-auto mb-10" />
          <h2 className="text-3xl font-lora text-white italic mb-12 tracking-tight">Diagnostic Entry</h2>
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Record ID" 
              className="w-full bg-[#064680] border border-white/10 rounded-2xl px-4 py-5 text-white text-center mb-2 uppercase tracking-[0.2em] font-urbanist focus:border-teal-400 outline-none transition-all shadow-inner placeholder:text-white/20"
              onKeyDown={(e) => { if (e.key === 'Enter') window.location.search = `?id=${e.target.value}`; }}
            />
            <button 
              className="w-full bg-teal-500 hover:bg-teal-400 text-[#064680] font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 tracking-[0.1em]"
              onClick={(e) => {
                const input = e.currentTarget.parentElement.querySelector('input');
                if (input?.value) window.location.search = `?id=${input.value}`;
              }}
            >
              ACCESS ENGINE <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#064680] text-white font-urbanist flex flex-col">
      <header className="border-b border-white/10 bg-[#04325c]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg shadow-lg">
               <div className="grid grid-cols-2 gap-1 scale-75">
                 <div className="w-3 h-3 bg-[#064680] rounded-sm" />
                 <div className="w-3 h-3 bg-teal-500 rounded-sm" />
                 <div className="w-3 h-3 bg-purple-600 rounded-sm" />
                 <div className="w-3 h-3 bg-[#064680] rounded-sm" />
               </div>
            </div>
            <div>
              <h1 className="text-2xl font-lora font-bold text-white tracking-tighter leading-none uppercase">
                UNMASK <span className="text-teal-400 italic font-light lowercase text-xl">Framework Diagnostic</span>
              </h1>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-2 italic font-urbanist">
                Strategic Transformations &bull; Ref: {auditId}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-[#064680] rounded-full border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Live Secure Stream</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7 space-y-16">
            {[
              { key: "authorityAlignment", label: "Authority Alignment", sub: "Power vs. Responsibility gap." },
              { key: "operationalSqueeze", label: "Operational Squeeze", sub: "Production Load vs. Structural Capacity." },
              { key: "maskingDensity", label: "Masking Density", sub: "Energy lost to organizational performance theater." },
              { key: "escalationDensity", label: "Escalation Density", sub: "Friction in organizational decision paths." }
            ].map((field) => (
              <div key={field.key} className="group">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-xl font-urbanist font-black uppercase tracking-widest text-white/90 leading-none mb-2">
                      {field.label}
                    </h3>
                    <p className="text-white/40 text-[11px] italic font-light">{field.sub}</p>
                  </div>
                  <div className="text-5xl font-urbanist font-black text-teal-400 tracking-tighter">
                    {(auditData?.[field.key] || 1.0).toFixed(1)}
                  </div>
                </div>
                <div className="h-3 bg-[#04325c] rounded-full border border-white/5 overflow-hidden p-[2px]">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-cyan-400 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                    style={{ width: `${((auditData?.[field.key] || 1.0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-gradient-to-br from-[#04325c] to-[#064680] p-10 lg:p-14 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                  <Layers size={120} />
               </div>
               <h2 className="text-xl font-lora italic text-white/80 mb-10 uppercase tracking-widest relative z-10">Aggregate Strain</h2>
               <div className="text-8xl lg:text-9xl font-urbanist font-black text-teal-400 tracking-tighter leading-none mb-8 relative z-10 drop-shadow-[0_4px_20px_rgba(45,212,191,0.2)]">
                 {(auditData?.totalStrainScore || 1.0).toFixed(2)}
               </div>
               <p className="text-[11px] text-white/40 uppercase font-black tracking-[0.4em] relative z-10">Structural Health Score</p>
               <div className="h-px w-20 bg-white/10 my-12 relative z-10" />
               <Activity className="text-teal-500/20 h-10 w-10 mx-auto animate-pulse relative z-10" />
            </div>

            <div className="bg-[#04325c]/30 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 relative">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-3">
                 <ShieldCheck size={16} className="text-teal-400" /> System Verdict
               </h4>
               <p className="text-xl font-lora italic text-white/70 leading-relaxed">
                 {auditData?.totalStrainScore > 3.5 
                   ? "Structural integrity is compromised. Performance is sustained through individual sacrifice rather than architectural efficiency." 
                   : "The organization demonstrates high structural maturity with low friction in decision velocity."}
               </p>
            </div>
        </div>
      </div>
      </main>

      <section className="bg-white/5 border-t border-white/10 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-lora italic text-white">Ready to Recalibrate?</h2>
            <p className="text-white/50 font-urbanist font-light text-lg">
              Move from managing symptoms to redesigning systems.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="https://strategictransformations.com/book" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-[#064680] px-12 py-5 rounded-2xl font-black font-urbanist text-sm uppercase tracking-[0.2em] flex items-center gap-3 transition-all hover:bg-teal-400 hover:scale-105 shadow-2xl group"
            >
              <Calendar size={18} className="group-hover:animate-bounce" />
              Book Discovery <span className="text-xs font-light opacity-60">with Nikki Cates</span>
            </a>
            <button 
              onClick={() => window.print()}
              className="text-white/30 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
            >
              <FileText size={14} /> EXPORT AUDIT PDF
            </button>
          </div>
        </div>
      </section>

      <footer className="py-16 text-center text-white/10 text-[10px] font-black tracking-[1em] uppercase">
        &copy; 2026 STRATEGIC TRANSFORMATIONS &bull; PROPRIETARY UNMASK ENGINE
      </footer>
    </div>
  );
};

export default App;
