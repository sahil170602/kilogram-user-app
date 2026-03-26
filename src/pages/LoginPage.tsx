import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, ArrowRight, User, Mail, Navigation, Check, X, Target, Home } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginPageProps {
  onLogin: (userData?: any) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState<'phone' | 'profile' | 'location'>('phone');
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // User Profile Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  // 🎯 Coordinates & Manual Address
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [manualAddress, setManualAddress] = useState("");

  const isPhoneValid = phone.length === 10;
  const formattedPhone = `+91${phone}`;

  // Google Maps API Key for the Visual Map Viewer
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDItwA1G4wtDpaOYGENGZ2CjjZQmGDDt5Y';

  // --- 1. AUTHENTICATION LOGIC (🎯 UPDATED SMART ROUTING) ---
  const checkUserExists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserId(data.id);
        setName(data.full_name || "");
        setEmail(data.email || "");

        // 🎯 SMART BYPASS: If they already have an address and coordinates saved, skip to Home!
        if (data.full_name && data.last_address && data.last_lat && data.last_lng) {
          onLogin({ 
            id: data.id,
            full_name: data.full_name, 
            email: data.email || "",
            phone: formattedPhone, 
            location: { 
              lat: data.last_lat, 
              lng: data.last_lng, 
              address: data.last_address 
            } 
          });
          return; // Stop execution here so it doesn't change steps
        } else {
          // Existing user but missing location, go to step 3
          setStep('location');
        }
      } else {
        // Brand new user, go to step 2
        setStep('profile');
      }
    } catch (err) {
      console.error("Auth Check Error:", err);
      setStep('profile'); 
    } finally {
      setLoading(false);
    }
  };

  // --- 2. PROFILE CREATION ---
  const saveProfile = async () => {
    if (!name || !email) return;
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          phone_number: formattedPhone, 
          full_name: name, 
          email: email 
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      setUserId(data.id);
      setStep('location');
    } catch (error: any) {
      alert("Database Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 🛰️ STRICT HARDWARE GPS DETECTION ---
  const startDetection = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      setLoading(false);
      return;
    }

    // Forces re-detection to bypass cache
    const geoOptions = {
      enableHighAccuracy: true, 
      timeout: 15000,           
      maximumAge: 0             
    };

    navigator.geolocation.getCurrentPosition(async (position) => {
      setCoords({ 
        lat: position.coords.latitude, 
        lng: position.coords.longitude 
      });
      setLoading(false);
      setShowMap(true); 
    }, (_) => {
      setLoading(false);
      alert("GPS Failed. Please ensure Location Permissions are allowed.");
    }, geoOptions);
  };

  // --- 4. DATA SYNC & FINALIZATION ---
  const handleFinalize = async () => {
    if (!manualAddress || manualAddress.trim().length < 5) {
      alert("Please enter a clear address (House No, Street) for delivery precision.");
      return;
    }

    setLoading(true);
    try {
      if (userId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            last_lat: coords.lat, 
            last_lng: coords.lng, 
            last_address: manualAddress 
          })
          .eq('id', userId);
        
        if (updateError) throw updateError;
      }

      onLogin({ 
        id: userId,
        full_name: name, 
        email,
        phone: formattedPhone, 
        location: { ...coords, address: manualAddress } 
      });
    } catch (err) {
      console.error("Supabase Sync Error:", err);
      onLogin({ id: userId, full_name: name, email, phone: formattedPhone });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#08080a] flex flex-col overflow-hidden text-white font-sans lowercase no-scrollbar">
      
      <div className="relative h-[45vh] w-full shrink-0">
        <img src="/delivery-bg.png" alt="Logistics" className="w-full h-full object-cover opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
      </div>

      <div className="flex-1 px-8 flex flex-col items-center justify-between pb-10 relative z-10">
        <AnimatePresence mode="wait">
          
          {step === 'phone' && (
            <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="text-center mb-10">
                <h1 className="text-5xl font-black tracking-tighter mb-1 uppercase ">KILO<span className="text-primary">GRAM</span></h1>
                <p className="text-[9px] text-white/20 tracking-[0.5em] font-black uppercase">V1.0</p>
              </div>

              <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4 mb-5 shadow-inner">
                <div className="flex items-center gap-2 border-r border-white/10 pr-4 text-white/80 font-black text-sm">+91</div>
                <input 
                  type="tel" value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter Mobile Number" 
                  className="bg-transparent border-none outline-none flex-1 text-white font-black tracking-[0em] text-base placeholder:text-white/10"
                />
              </div>

              <button 
                onClick={checkUserExists}
                disabled={!isPhoneValid || loading}
                className={`w-full py-5 rounded-2xl font-black tracking-widest text-xs uppercase transition-all flex items-center justify-center gap-3 ${
                  isPhoneValid ? 'bg-primary text-black shadow-[0_20px_40px_rgba(255,153,193,0.3)]' : 'bg-white/5 text-white/10 border border-white/5'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-1">Create Account</h2>
                <p className="text-xs text-white/40 font-bold">Join the kilogram network</p>
              </div>
              <div className="w-full space-y-4 mb-10">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4 border-white/5 shadow-inner">
                  <User size={20} className="text-primary" />
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent border-none outline-none flex-1 font-black text-sm placeholder:text-white/10" />
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4 border-white/5 shadow-inner">
                  <Mail size={20} className="text-primary" />
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none outline-none flex-1 font-black text-sm placeholder:text-white/10" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={!name || !email || loading} className="w-full py-5 rounded-2xl bg-primary text-black font-black uppercase text-[13px] tracking-widest shadow-[0_20px_40px_rgba(255,153,193,0.2)] active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Finalize Profile"}
              </button>
            </motion.div>
          )}

          {step === 'location' && (
            <motion.div key="location" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-primary/20 shadow-2xl">
                {loading ? <Loader2 className="text-primary animate-spin" size={40} /> : <Target className="text-primary animate-pulse" size={40} fill="currentColor" />}
              </div>
              <div className="mb-12">
                <h2 className="text-3xl font-black tracking-tighter mb-2 italic">Welcome, <span className="text-primary capitalize">{name.split(' ')[0]}</span></h2>
                <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em]">Force Syncing Live Position...</p>
              </div>
              <button 
                onClick={startDetection} disabled={loading}
                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
              >
                {loading ? "Searching Satellites..." : <>Get Live Location <MapPin size={16} /></>} 
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-12 bg-white/5 rounded-full" />
            <p className="text-[10px] text-white/10 font-black tracking-[0.6em] uppercase">Security Verified</p>
        </div>
      </div>

      {/* 🗺️ VISUAL OVERLAY: COORDINATE CONFIRMATION + MANUAL ENTRY */}
      <AnimatePresence>
        {showMap && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[500] bg-[#08080a] flex flex-col lowercase">
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0c0c0f]">
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-white">Live Position Locked</h3>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Pin shows your current real-time spot</p>
              </div>
              <button onClick={() => setShowMap(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 active:scale-90 transition-transform"><X size={20} /></button>
            </div>

            <div className="flex-1 relative bg-[#0c0c0f]">
              <iframe
                title="map-confirm" width="100%" height="100%" frameBorder="0"
                src={`http://googleusercontent.com/maps.google.com/9{GOOGLE_MAPS_API_KEY}&center=${coords.lat},${coords.lng}&zoom=18`}
                className="grayscale invert opacity-80 contrast-125 shadow-inner"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping absolute -inset-2" />
                  <MapPin size={56} className="text-primary relative drop-shadow-[0_0_20px_rgba(255,153,193,0.7)]" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Address Details & Manual Actions */}
            <div className="p-8 bg-[#0c0c0f] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              <div className="bg-white/5 rounded-2xl p-6 mb-8 flex items-start gap-4 border border-white/5 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50" />
                <Home size={24} className="text-primary shrink-0 mt-1" />
                <div className="text-left w-full">
                  <p className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-[0.2em]">Enter Door Details (House No/Street)</p>
                  <textarea 
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="E.g. House No. 42, Bhamti Road, near Tabla Hub..."
                    className="w-full bg-transparent border-none outline-none text-white font-bold text-sm leading-relaxed placeholder:text-white/10 h-24 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={startDetection} className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/10 active:scale-95">Re-Detect</button>
                <button onClick={handleFinalize} disabled={loading} className="flex-[2] py-5 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest shadow-[0_15px_30px_rgba(255,153,193,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={18} strokeWidth={4} /> Confirm & Enter</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-ping { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default LoginPage;