import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { 
  Activity, ShieldCheck, AlertTriangle, MousePointer2, 
  TrendingDown, Gauge, Layers, FileText, Loader2, ChevronRight 
} from 'lucide-react';

const firebaseConfig = JSON.parse(__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'unmask-audit-2026';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [auditId, setAuditId] = useState(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        setError("Secure connection failed. Please refresh.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !auditId) {
      if (!auditId) setLoading(false);
      return;
    }
    setLoading(true);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'structural_audits', auditId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAuditData(docSnap.data());
        setError(null);
      } else {
        setError("Audit ID not found. Verify your credentials.");
      }
      setLoading(false);
    }, (err) => {
      setError("Sync interrupted.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, auditId]);

  const SliderField = ({ label, subtext, value }) => {
    const val = value || 1.0;
    return (
      <div className="mb-12 group cursor-default font-sans">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <h3 className="text-white text-lg font-bold tracking-wider uppercase flex items-center gap-2 font-sans">
              <div className="h-2 w-2 rounded-full bg-teal-400" />
              {label}
            </h3>
            <p className="text-slate-500 text-sm italic font-light font-sans">{subtext}</p>
          </div>
          <div className="text-4xl font-mono text-teal-400 font-black tracking-tighter">
            {loading ? "..." : val.toFixed(1)}
          </div>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full border border-slate-700/50">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-600 to-cyan-400"
            style={{ width: `${(val / 5) * 100}%` }}
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
                const val = e.currentTarget.previousSibling.value;
                if (val) window.location.search = `?id=${val}`;
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
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans p-10">
      <header className="border-b border-slate-800 pb-10 mb-10">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          UNMASK <span className="text-teal-400 font-light italic">Diagnostic Engine</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Audit ID: {auditId}</p>
      </header>

      {error ? (
        <div className="text-center p-20 bg-red-900/10 border border-red-500/20 rounded-3xl">
          <AlertTriangle className="text-red-500 h-10 w-10 mx-auto mb-4" />
          <p className="text-white font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <SliderField label="1. Authority Alignment" subtext="Gap between responsibility and power." value={auditData?.authorityAlignment} />
            <SliderField label="2. Operational Squeeze" subtext="Volume vs. Capacity." value={auditData?.operationalSqueeze} />
            <SliderField label="3. Masking Density" subtext="Energy lost to performance theater." value={auditData?.maskingDensity} />
            <SliderField label="4. Escalation Density" subtext="Friction in the hierarchy." value={auditData?.escalationDensity} />
          </div>
          <div className="lg:col-span-4 bg-[#0f172a] p-10 rounded-[2.5rem] border border-slate-800">
             <h2 className="text-2xl font-serif italic text-white mb-6 border-b border-slate-800 pb-4">Verdict</h2>
             <p className="text-4xl font-mono text-teal-400 font-black mb-4">
               {auditData?.totalStrainScore ? auditData.totalStrainScore.toFixed(2) : "1.00"}
             </p>
             <p className="text-sm text-slate-400 font-light leading-relaxed font-sans">
               Aggregate Strain Score: Measuring structural friction across all leadership layers.
             </p>
          </div>
        </div>
      )}
      <footer className="mt-20 pt-10 border-t border-slate-800 text-center text-[10px] text-slate-600 font-black tracking-[0.5em]">
        © 2026 STRATEGIC TRANSFORMATIONS
      </footer>
    </div>
  );
};

export default App;
