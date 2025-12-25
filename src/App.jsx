import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import { 
  ShieldCheck, 
  UserCheck, 
  Camera, 
  IdCard, 
  ChevronRight, 
  TrendingUp, 
  Wallet, 
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  LogOut
} from 'lucide-react';

// --- KONFIGURASI FIREBASE ANDA (SUDAH TERPASANG) ---
const firebaseConfig = {
  apiKey: "AIzaSyDrpBJTtankyLgimtOwuriFpiyuC5K10OI",
  authDomain: "studio-727777898-40aea.firebaseapp.com",
  databaseURL: "https://studio-727777898-40aea-default-rtdb.firebaseio.com",
  projectId: "studio-727777898-40aea",
  storageBucket: "studio-727777898-40aea.firebasestorage.app",
  messagingSenderId: "351263967108",
  appId: "1:351263967108:web:973eb49037d874e5c17fd1",
  measurementId: "G-C1LTN3E50Q"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const chartData = [
  { name: '00:00', price: 42000 },
  { name: '04:00', price: 42500 },
  { name: '08:00', price: 41800 },
  { name: '12:00', price: 43200 },
  { name: '16:00', price: 44100 },
  { name: '20:00', price: 43800 },
  { name: '23:59', price: 44500 },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    const userRef = doc(db, 'artifacts', 'crypto-pro', 'users', user.uid, 'profile', 'status');
    
    getDoc(userRef).then(snap => {
      if (!snap.exists()) {
        setDoc(userRef, { 
          displayName: user.displayName,
          email: user.email,
          isPremium: false, 
          kycStatus: 'none',
          lastUpdate: new Date().toISOString() 
        }, { merge: true });
      }
    });

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) setUserData(doc.data());
    });

    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Gagal Login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleNextStep = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setKycStep(prev => prev + 1);
    }, 1500);
  };

  const finalizeUpgrade = async () => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', 'crypto-pro', 'users', user.uid, 'profile', 'status');
    await updateDoc(userRef, {
      isPremium: true,
      kycStatus: 'verified',
      upgradedAt: new Date().toISOString()
    });
    setKycStep(1);
    setShowUpgradeModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-widest uppercase opacity-50">Menghubungkan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="w-full max-w-md bg-[#12161C] border border-gray-800 p-10 rounded-[3rem] shadow-2xl relative z-10 text-center">
          <div className="bg-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20">
            <TrendingUp size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">CRYPTO<span className="text-yellow-500">PRO</span></h1>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed">Platform trading masa depan dengan keamanan tinggi.</p>
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-4"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
            Masuk dengan Google
          </button>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-6 font-bold">Secure Authentication by Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-gray-100 font-sans">
      <nav className="border-b border-gray-800 bg-[#12161C] px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
            <TrendingUp size={20} className="text-black" />
          </div>
          <span className="text-xl font-bold">CRYPTO<span className="text-yellow-500">PRO</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-white uppercase">{user.displayName || 'Trader'}</p>
            <p className={`text-[10px] font-bold ${userData?.isPremium ? 'text-yellow-500' : 'text-gray-500'}`}>
              {userData?.isPremium ? 'PREMIUM MEMBER' : 'BASIC ACCOUNT'}
            </p>
          </div>
          <button onClick={handleLogout} className="p-2 bg-gray-800 rounded-xl hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12161C] border border-gray-800 rounded-[2rem] p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">BTC / USDT</h2>
                <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-md">LIVE MARKET</span>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold tracking-tight text-yellow-500">$44,500.00</h2>
                <p className="text-green-500 text-sm font-bold">+4.25% (24h)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="price" stroke="#EAB308" strokeWidth={3} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!userData?.isPremium ? (
            <div className="bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold text-yellow-500 mb-4">Upgrade Akun</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">Verifikasi identitas (KYC) untuk fitur premium.</p>
              <button 
                onClick={() => { setKycStep(1); setShowUpgradeModal(true); }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Mulai Verifikasi <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-[2rem] p-8 flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-2xl"><ShieldCheck className="text-green-500" /></div>
              <div>
                <p className="font-bold text-green-500">Premium Aktif</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Identitas Terverifikasi</p>
              </div>
            </div>
          )}
          <div className="bg-[#12161C] border border-gray-800 rounded-[2rem] p-8">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-gray-400">
              <Wallet size={16} /> ESTIMASI SALDO
            </h3>
            <p className="text-4xl font-bold tracking-tighter mb-2">$12,450</p>
            <p className="text-xs text-gray-500 font-bold uppercase">≈ 0.280 BTC</p>
          </div>
        </div>
      </main>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#1E2329] border border-gray-700 w-full max-w-md rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Langkah {kycStep}/4</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold">KYC Verification</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-800 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-8">
              {kycStep === 1 && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center"><IdCard className="text-yellow-500" size={32}/></div>
                  <h4 className="font-bold">Foto KTP / Passport</h4>
                  <div className="aspect-video bg-gray-900 border-2 border-dashed border-gray-700 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                    <Camera size={24} className="text-gray-600"/>
                    <p className="text-xs text-gray-600 font-bold">Ambil Foto</p>
                  </div>
                </div>
              )}
              {kycStep === 2 && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center"><UserCheck className="text-yellow-500" size={32}/></div>
                  <h4 className="font-bold">Selfie dengan KTP</h4>
                  <div className="aspect-square w-48 mx-auto bg-gray-900 rounded-full border border-gray-700 flex items-center justify-center relative overflow-hidden">
                     <p className="text-[10px] text-yellow-500 font-mono animate-pulse">SCANNING...</p>
                  </div>
                </div>
              )}
              {kycStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"/>
                  <h4 className="font-bold">Memproses AI...</h4>
                </div>
              )}
              {kycStep === 4 && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center"><CheckCircle2 className="text-green-500" size={32}/></div>
                  <h4 className="font-bold text-green-500">Berhasil</h4>
                </div>
              )}
              <button 
                onClick={kycStep === 4 ? finalizeUpgrade : handleNextStep}
                disabled={isVerifying}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-2xl mt-8"
              >
                {isVerifying ? 'Sedang Memverifikasi...' : kycStep === 4 ? 'Terapkan Premium' : 'Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

