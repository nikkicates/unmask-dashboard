/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, Layers, Loader2, ChevronRight, Activity, ShieldCheck } from 'lucide-react';

/**
 * UNMASK AI STRUCTURAL AUDIT - Production Build v4.6
 * Fixed: Configuration detection for Canvas & Netlify environments
 */

// Global helper to safely pull config from different environments
const getSafeConfig = () => {
  // 1. Check for Canvas environment global __firebase_config
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
    } catch (e) {
      console.error("Failed to parse __firebase_config");
    }
  }

  // 2. Check for Netlify/Production individual environment variables
  try {
    if (typeof process !== 'undefined' && process.env) {
      const config = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      };
      if (config.apiKey) return config;
    }
  } catch (e) { /* process is not defined */ }

  // 3. Check for Netlify JSON blob fallback
  try {
    if (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_CONFIG) {
      return JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
    }
  } catch (e) { /* process is not defined or JSON invalid */ }

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
        // 1. Fetch Config
        const config = getSafeConfig();
        
        if (!config || !config.apiKey) {
          throw new Error("MISSING_API_KEY: Configuration not found. If in Netlify, add 'REACT_APP_FIREBASE_API_KEY' to your Environment Variables.");
        }

        // 2. Initialize Firebase
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        // 3. Anonymous Authentication (Rule 3)
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            try {
              await signInAnonymously(auth);
            } catch (authErr) {
              setError(`AUTH_FAILED: ${authErr.message}`);
              setLoading(false);
              return;
            }
          }

          // 4. Live Data Subscription (Rule 1)
          if (auditId) {
            // Priority: Canvas ID > Default ID
            const effectiveAppId = typeof __app_id !== 'undefined' ? __app_id : 'unmask-audit-2026';
            const docRef = doc(db, 'artifacts', effectiveAppId, 'public', 'data', 'structural_audits', auditId);
            
            // Error callback required for onSnapshot
            onSnapshot(docRef, (snap) => {
              if (snap.exists()) {
                setAuditData(snap.data());
                setError(null);
              } else {
                setError(`ID_NOT_FOUND: The Audit record "${auditId}" does not exist in the database.`);
              }
              setLoading(false);
            }, (dbErr) => {
              setError(`DB_ERROR: ${dbErr.message}`);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        });

      } catch (err) {
        console.error("Engine failure:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initEngine();
  }, [auditId]);

  // --- UI RENDERING ---

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-10 font-sans">
        <div className="max-w-xl w-full bg-[#0f172a] border border-red-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
          <AlertTriangle className="text-red-500 h-16 w-16 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-white italic mb-4">System Access Failure</h2>
          <div className="bg-black/40 p-5 rounded-2xl mb-8 font-mono text-red-400 text-xs break-all leading-relaxed border border-slate-800">
            {error}
          </div>
          <p className="text-slate-500 text-sm mb-6 font-light">
            If you are the administrator, verify that your environment variables match the expected keys.
          </p>
          <button 
            className="text-teal-400 font-black uppercase tracking-widest text-xs hover:text-teal-300 transition-colors"
            onClick={() => window.location.search = ''}
          >
            Return to Entrance
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
        <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.6em] animate-pulse">Initializing UNMASK Engine</p>
      </div>
    );
  }

  if (!auditId) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-[3.5rem] p-14 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-600 group-hover:h-2 transition-all duration-500" />
          <Layers className="text-teal-400 h-16 w-16 mx-auto mb-10" />
          <h2 className="text-3xl font-serif text-white italic mb-12 tracking-tight">Diagnostic Entry</h2>
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Audit Record ID" 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-5 text-white text-center mb-2 uppercase tracking-[0.2em] font-mono focus:border-teal-500 outline-none transition-all shadow-inner placeholder:text-slate-700"
              onKeyDown={(e) => { if (e.key === 'Enter') window.location.search = `?id=${e.target.value}`; }}
            />
            <button 
              className="w-full bg-[#1e40af] hover:bg-[#2563eb] text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 tracking-[0.1em]"
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
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans p-8 lg:p-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-900/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full" />

      <header className="max-w-7xl mx-auto flex justify-between items-end mb-24 border-b border-slate-800 pb-12 relative z-10">
        <div className="flex items-center gap-8">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[1.5rem] shadow-xl">
            <Layers className="text-teal-400 h-10 w-10" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
              UNMASK <span className="text-teal-400 font-light italic text-3xl lowercase">Diagnostic</span>
            </h1>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mt-5 italic">Record_Ref: {auditId}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="bg-slate-900/50 px-8 py-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
             <div className="flex items-center gap-3 text-teal-400 font-mono text-[11px] font-bold uppercase tracking-widest">
               <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
               Live Data Feed
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        <div className="lg:col-span-8 space-y-20">
          {[
            { key: "authorityAlignment", label: "Authority Alignment", sub: "Power vs. Responsibility gap." },
            { key: "operationalSqueeze", label: "Operational Squeeze", sub: "Production Load vs. Structural Capacity." },
            { key: "maskingDensity", label: "Masking Density", sub: "Energy spent on performance theater." },
            { key: "escalationDensity", label: "Escalation Density", sub: "Friction in organizational decision paths." }
          ].map((field) => (
            <div key={field.key} className="group">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-white font-bold uppercase tracking-[0.2em] text-xl mb-2">{field.label}</h3>
                  <p className="text-slate-500 text-sm italic font-light font-sans tracking-wide">{field.sub}</p>
                </div>
                <div className="text-right">
                  <span className="text-teal-400 font-mono text-5xl font-black tracking-tighter leading-none">
                    {(auditData?.[field.key] || 1.0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-teal-700 via-teal-400 to-cyan-400 shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all duration-[2000ms] ease-out rounded-full"
                  style={{ width: `${((auditData?.[field.key] || 1.0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4 space-y-10">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#070b14] p-14 rounded-[3.5rem] border border-slate-800 text-center shadow-2xl h-fit relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/30 group-hover:h-full transition-all duration-700 opacity-10 pointer-events-none" />
               
               <h2 className="text-2xl font-serif italic text-white mb-8 relative z-10 uppercase tracking-widest opacity-80">Aggregate Strain</h2>
               <div className="text-[7rem] font-mono text-teal-400 font-black mb-6 tracking-tighter relative z-10 leading-none drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                 {(auditData?.totalStrainScore || 1.0).toFixed(2)}
               </div>
               <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.4em] relative z-10">Structural Health Score</p>
               
               <div className="h-px w-20 bg-slate-800 mx-auto my-12 relative z-10" />
               
               <Activity className="text-teal-500/20 h-12 w-12 mx-auto animate-pulse relative z-10" />
            </div>

            <div className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-4 right-6 text-teal-500 opacity-20">
                 <ShieldCheck size={40} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                 System Verdict
               </h4>
               <p className="text-base text-slate-400 font-light leading-relaxed font-serif italic">
                 {auditData?.totalStrainScore > 3.5 
                   ? "Structural integrity is compromised. Performance is currently being sustained through individual sacrifice rather than architectural efficiency." 
                   : "The organization demonstrates high structural maturity with low friction in decision velocity."}
               </p>
            </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto p-24 text-center text-slate-900 text-[10px] font-black tracking-[1em] uppercase flex flex-col items-center gap-8 relative z-10">
        <div className="h-px w-24 bg-slate-900" />
        &copy; 2026 STRATEGIC TRANSFORMATIONS &bull; PROPRIETARY UNMASK ENGINE
      </footer>
    </div>
  );
};

export default App;
