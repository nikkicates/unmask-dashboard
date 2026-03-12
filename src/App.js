import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { 
  Activity, ShieldCheck, AlertTriangle, Layers, Loader2, ChevronRight, Gauge, TrendingDown
} from 'lucide-react';

/**
 * UNMASK AI STRUCTURAL AUDIT - Production Build
 * Optimized for Environment Compatibility (Canvas & Netlify)
 */

// Helper to safely get config without ReferenceErrors
const getSafeConfig = () => {
  // Check for Canvas environment globals first
  if (typeof __firebase_config !== 'undefined') {
    try {
      return JSON.parse(__firebase_config);
    } catch (e) {
      console.error("Failed to parse __firebase_config");
    }
  }
  // Fallback for Netlify/Create React App environments
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
    } catch (e) {
      console.error("Failed to parse REACT_APP_FIREBASE_CONFIG");
    }
  }
  return {};
};

const firebaseConfig = getSafeConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Safe access for App ID
const appId = (typeof __app_id !== 'undefined' ? __app_id : 
              (typeof process !== 'undefined' && process.env?.REACT_APP_ID) ? process.env.REACT_APP_ID : 
              'unmask-audit-2026');

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [auditId, setAuditId] = useState(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Handle initial custom token if provided by environment, otherwise anonymous
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Secure connection failed. Check your environment configuration.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // RULE 3: Auth Before Queries
    if (!user || !auditId) {
      if (!auditId) setLoading(false);
      return;
    }

    setLoading(true);
    // RULE 1: Strict Paths
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'structural_audits', auditId);
    
    // ERROR CALLBACK REQUIRED: Every onSnapshot() call must have error callback
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAuditData(docSnap.data());
        setError(null);
      } else {
        setError("Audit ID not found. Verify your Welcome Kit credentials.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore sync error:", err);
      setError("Database sync interrupted.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, auditId, appId]);

  const SliderField = ({ label, subtext, value }) => {
    const val = value || 1.0;
    return (
      <div className="mb-12 group cursor-default font-sans">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <h3 className="text-white text-lg font-bold tracking-wider uppercase flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              {label}
            </h3>
            <p className="text-slate-500 text-sm italic font-light">{subtext}</p>
          </div>
          <div className="text-4xl font-mono text-teal-400 font-black tracking-tighter">
            {loading ? "..." : val.toFixed(1)}
          </div>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full border border-slate-700/50">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-600 to-cyan-400 transition-all duration-1000 ease-out"
            style={{ width: `${(val / 5) * 100}%` }}
          />
          <div 
            className="absolute h-4 w-4 bg-white rounded-full top-1/2 -translate-y-1/2 border-2 border-teal-500 shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
            style={{ left: `calc(${(val / 5) * 100}% - 8px)` }}
          />
        </div>
      </div>
    );
  };

  if (!auditId) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <Layers className="text-teal-400 h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-white italic mb-4">Diagnostic Entry</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-light font-sans">
            Enter your <strong>Audit ID</strong> from your Welcome Kit to access the engine.
          </p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. UNMASK-2026-X92" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white text-center font-mono focus:outline-none focus:border-teal-500 transition-all uppercase tracking-widest"
              onKeyDown={(e) => { if (e.key === 'Enter') window.location.search = `?id=${e.target.value}`; }}
            />
            <button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
        <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.5em]">Initializing UNMASK Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-teal-500/30">
      <header className="border-b border-slate-800/60 bg-[#0d1425]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <Layers className="text-teal-400 h-8 w-8" />
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                UNMASK <span className="text-teal-400 font-light italic">Diagnostic Engine</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">
                Strategic Transformations &bull; 2026
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
             <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Audit Record</p>
             <p className="text-xs font-mono text-teal-400">{auditId}</p>
          </div>
        </div>
      </header>

      {error ? (
        <main className="max-w-xl mx-auto mt-20 p-10 bg-red-950/20 border border-red-500/20 rounded-[2.5rem] text-center">
          <AlertTriangle className="text-red-500 h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-serif italic text-white mb-4">System Access Denied</h2>
          <p className="text-slate-400 mb-6 font-sans">{error}</p>
          <button className="text-teal-400 underline font-bold font-sans" onClick={() => window.location.search = ''}>Try Again</button>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-3xl font-serif text-teal-50 italic mb-6 border-b border-slate-800 pb-4">Executive Briefing</h2>
              <div className="space-y-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Load-Path Analysis</span>
                    <Gauge className="text-teal-400 h-4 w-4" />
                  </div>
                  <div className="text-4xl font-mono text-white font-black mb-2">{auditData?.loadPathEfficiency || 0}%</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light italic">Measures structural integrity of decision flow.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-800/20 rounded-xl">
                    <TrendingDown className="text-red-400" size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Risk Profile: <strong className="text-white ml-2">{auditData?.totalStrainScore > 3.5 ? 'Critical' : 'Stable'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#0f172a]/50 border border-slate-800/80 rounded-[2.5rem] p-8 lg:p-14 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between mb-16 gap-4 border-b border-slate-800 pb-8">
              <h2 className="text-5xl font-serif text-white italic tracking-tighter">Structural Health Audit</h2>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Strain Score</p>
                <p className="text-5xl font-mono text-teal-400 font-black tracking-tighter">{(auditData?.totalStrainScore || 1.0).toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
              <SliderField label="1. Authority Alignment" subtext="Responsibility vs Power gap." value={auditData?.authorityAlignment} />
              <SliderField label="2. Operational Squeeze" subtext="Output Load vs Capacity." value={auditData?.operationalSqueeze} />
              <SliderField label="3. Masking Density" subtext="Energy lost to performance theater." value={auditData?.maskingDensity} />
              <SliderField label="4. Escalation Density" subtext="Friction in decision-velocity." value={auditData?.escalationDensity} />
            </div>
          </div>
        </main>
      )}

      <footer className="max-w-7xl mx-auto p-16 text-center text-slate-800 text-[11px] font-black tracking-[0.6em] uppercase">
        &copy; 2026 STRATEGIC TRANSFORMATIONS &bull; UNMASK ENGINE v4.0
      </footer>
    </div>
  );
};

export default App;
