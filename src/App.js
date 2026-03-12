/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, Layers, Loader2, ChevronRight, Activity, Terminal, ShieldCheck } from 'lucide-react';

/**
 * UNMASK AI STRATEGIC ENGINE - Build v4.8
 * Final Methodological Troubleshooting Version
 */

const App = () => {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [auditId] = useState(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const initEngine = async () => {
      try {
        // 1. Explicitly grab baked variables from the process
        const env = process.env || {};
        
        const config = {
          apiKey: (env.REACT_APP_FIREBASE_API_KEY || window.__firebase_config?.apiKey || "").trim(),
          authDomain: (env.REACT_APP_FIREBASE_AUTH_DOMAIN || window.__firebase_config?.authDomain || "").trim(),
          projectId: (env.REACT_APP_FIREBASE_PROJECT_ID || window.__firebase_config?.projectId || "unmask-audit-2026").trim(),
          storageBucket: (env.REACT_APP_FIREBASE_STORAGE_BUCKET || window.__firebase_config?.storageBucket || "").trim(),
          messagingSenderId: (env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || window.__firebase_config?.messagingSenderId || "").trim(),
          appId: (env.REACT_APP_FIREBASE_APP_ID || window.__firebase_config?.appId || "").trim()
        };

        // 2. The Hard Stop
        if (!config.apiKey) {
          throw new Error("BUILD_ID_FAIL: The React compiler did not find REACT_APP_FIREBASE_API_KEY during the build phase.");
        }

        // 3. Firebase Lifecycle
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        onAuthStateChanged(auth, async (user) => {
          if (!user) await signInAnonymously(auth);

          if (auditId) {
            const effectiveAppId = window.__app_id || 'unmask-audit-2026';
            const docRef = doc(db, 'artifacts', effectiveAppId, 'public', 'data', 'structural_audits', auditId);
            
            onSnapshot(docRef, (snap) => {
              if (snap.exists()) {
                setAuditData(snap.data());
                setError(null);
              } else {
                setError(`ERR_NOT_FOUND: record_${auditId}`);
              }
              setLoading(false);
            }, (err) => {
              setError(`ERR_DB: ${err.message}`);
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

  // --- UI COMPONENTS ---

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-300 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-[#0f172a] border border-red-900/30 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <AlertTriangle className="text-red-500 h-16 w-16 mx-auto mb-8" />
          <h2 className="text-2xl font-serif text-white italic mb-6">System Initialization Fault</h2>
          
          <div className="bg-black/60 p-6 rounded-2xl mb-10 border border-slate-800 text-red-400 font-mono text-xs break-all leading-relaxed">
            {error}
          </div>

          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 mx-auto mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-teal-400 transition-colors"
          >
            <Terminal size={14} /> {showDebug ? "Close Diagnostic Panel" : "Open Diagnostic Panel"}
          </button>

          {showDebug && (
            <div className="text-left bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-10 font-mono text-[10px] space-y-2">
              <p className="text-teal-500 border-b border-slate-800 pb-2 mb-4">DEPLOYED_VARIABLES_MAP:</p>
              <p>API_KEY: {process.env.REACT_APP_FIREBASE_API_KEY ? "CONNECTED (String Length: " + process.env.REACT_APP_FIREBASE_API_KEY.length + ")" : "NULL_OR_EMPTY"}</p>
              <p>AUTH_DOMAIN: {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? "CONNECTED" : "NULL_OR_EMPTY"}</p>
              <p>PROJECT_ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID ? "CONNECTED" : "NULL_OR_EMPTY"}</p>
              <p className="mt-6 text-slate-500 italic">Recommendation: If API_KEY is NULL, go to Netlify Deploys and click "Clear cache and deploy site".</p>
            </div>
          )}

          <button 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all"
            onClick={() => window.location.reload()}
          >
            Restart Engine
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
        <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Establishing Secure Feed</p>
      </div>
    );
  }

  if (!auditId) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-[3rem] p-12 text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-600" />
          <Layers className="text-teal-400 h-16 w-16 mx-auto mb-8" />
          <h2 className="text-3xl font-serif text-white italic mb-10">Diagnostic Entry</h2>
          <input 
            type="text" 
            placeholder="RECORD ID" 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-5 text-white text-center mb-6 uppercase tracking-widest font-mono focus:border-teal-500 outline-none transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter') window.location.search = `?id=${e.target.value}`; }}
          />
          <button 
            className="w-full bg-[#1e40af] hover:bg-[#2563eb] text-white font-black py-5 rounded-2xl shadow-xl transition-all"
            onClick={(e) => {
              const input = e.currentTarget.parentElement.querySelector('input');
              if (input?.value) window.location.search = `?id=${input.value}`;
            }}
          >
            ACCESS ENGINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans p-8 lg:p-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent" />
      
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-24 border-b border-slate-800 pb-12 relative z-10">
        <div className="flex items-center gap-6">
          <Layers className="text-teal-400 h-10 w-10" />
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
              UNMASK <span className="text-teal-400 font-light italic text-2xl lowercase">Diagnostic</span>
            </h1>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mt-3 italic">ID: {auditId}</p>
          </div>
        </div>
        <div className="hidden sm:block">
           <div className="flex items-center gap-3 text-teal-400 font-mono text-[10px] font-bold uppercase tracking-widest bg-slate-900 px-6 py-3 rounded-full border border-slate-800">
             <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
             Active Stream
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        <div className="lg:col-span-8 space-y-16">
          {[
            { k: "authorityAlignment", l: "Authority Alignment", s: "Power vs. Responsibility gap." },
            { k: "operationalSqueeze", l: "Operational Squeeze", s: "Output Load vs. Capacity." },
            { k: "maskingDensity", l: "Masking Density", s: "Energy lost to performance theater." },
            { k: "escalationDensity", l: "Escalation Density", s: "Friction in decision velocity." }
          ].map((f) => (
            <div key={f.k}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-lg mb-1">{f.l}</h3>
                  <p className="text-slate-500 text-xs italic font-light font-sans">{f.s}</p>
                </div>
                <span className="text-teal-400 font-mono text-4xl font-black tracking-tighter">
                  {(auditData?.[f.k] || 1.0).toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-600 to-cyan-400 transition-all duration-[1500ms]"
                  style={{ width: `${((auditData?.[f.k] || 1.0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0f172a] p-12 rounded-[3.5rem] border border-slate-800 text-center shadow-2xl relative overflow-hidden group">
               <h2 className="text-2xl font-serif italic text-white mb-8 opacity-80 uppercase tracking-widest">Aggregate Strain</h2>
               <div className="text-[7rem] font-mono text-teal-400 font-black mb-6 tracking-tighter leading-none">
                 {(auditData?.totalStrainScore || 1.0).toFixed(2)}
               </div>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Health Index</p>
               <Activity className="text-teal-500/20 h-10 w-10 mx-auto mt-12 animate-pulse" />
            </div>

            <div className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-teal-500" /> System Verdict
               </h4>
               <p className="text-sm text-slate-400 font-light leading-relaxed italic font-serif">
                 {auditData?.totalStrainScore > 3.5 
                   ? "Structural integrity is compromised. Leadership load-paths are operating beyond safe thresholds." 
                   : "Organizational stability is optimal. Friction levels are within acceptable parameters."}
               </p>
            </div>
        </div>
      </main>

      <footer className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-900 text-[10px] font-black tracking-[1em] uppercase">
        © 2026 STRATEGIC TRANSFORMATIONS &bull; UNMASK ENGINE v4.8
      </footer>
    </div>
  );
};

export default App;
