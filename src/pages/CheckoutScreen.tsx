import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, MapPin, ArrowRight, ShieldCheck, 
  User, Phone, Navigation, Zap,
  ChevronDown, Plus, Check, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

interface CheckoutProps {
  total: number;
  cartItems: any[]; 
  user: any; 
  onBack: () => void;
  onSuccess: (data: any) => void;
  onSaveNewAddress: (updatedAddresses: any[]) => void; 
  clearCart: () => void; // 🎯 Added missing clearCart prop
}

const CheckoutScreen = ({ total, cartItems = [], user, onBack, onSuccess, onSaveNewAddress, clearCart }: CheckoutProps) => {
  // --- Profile Data ---
  // 🎯 Updated to check multiple common Supabase phone fields
  const realName = user?.full_name || user?.user_metadata?.full_name || "set name";
  const realPhone = user?.phone || user?.phone_number || user?.user_metadata?.phone || "no number";
  const savedAddresses = user?.addresses || [];

  // --- State ---
  const [profileAddress, setProfileAddress] = useState<string>("");
  const [selectedAddrId, setSelectedAddrId] = useState<string | number>('profile');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // --- 🎯 FETCH PROFILE ADDRESS ---
  useEffect(() => {
    const fetchProfileAddress = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("last_address")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data?.last_address) {
          setProfileAddress(data.last_address);
        }
      } catch (err) {
        console.error("Checkout Address Fetch Error:", err);
      }
    };
    fetchProfileAddress();
  }, [user?.id]);

  const addressList = useMemo(() => {
    const list = [];
    if (profileAddress) {
      list.push({ id: 'profile', type: 'verified spot', address: profileAddress });
    } else {
      list.push({ id: 'profile', type: 'verified spot', address: 'fetching address...' });
    }
    savedAddresses.forEach((addr: any) => {
      list.push({ ...addr });
    });
    return list;
  }, [profileAddress, savedAddresses]);

  const getSelectedAddressText = () => {
    if (selectedAddrId === 'new') return newAddress || "enter new address";
    const found = addressList.find((a: any) => a.id === selectedAddrId);
    return found ? found.address : "select address";
  };

  const handleDetectLocationManual = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) return setIsDetecting(false);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        setNewAddress(data.display_name);
      } finally { setIsDetecting(false); }
    }, () => setIsDetecting(false), { enableHighAccuracy: true });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      // 1. Create the Main Order
      // Defaulting status to 'order placed' as requested
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          user_name: realName, 
          user_phone: realPhone,
          address: getSelectedAddressText(),
          total_amount: total,
          status: 'order placed', 
          payment_method: 'cod',
          created_at: new Date().toISOString(),
        }])
        .select().single();

      if (orderError) throw orderError;

      // 2. Prepare the items for the manifest
      // This maps your cart data to match your Supabase table columns exactly
      const itemsToInsert = cartItems.map((item: any) => ({
        order_id: order.id,           // Connects to the order above
        product_id: item.id,          // Foreign key to products
        product_name: item.name,      // Direct name for the manifest fallback
        quantity: item.qty || 1,
        unit_price: item.price
      }));

      // 3. Insert into order_items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 4. Success Actions
      clearCart(); // 🎯 Now properly defined via props
      onSuccess(order); // Navigate to tracking or success screen
      
    } catch (err: any) {
      console.error("Checkout Failed:", err.message);
      alert("Checkout Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      className="fixed inset-0 z-[200] bg-[#08080a] flex flex-col font-sans text-white lowercase"
    >
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5 bg-[#08080a]">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black tracking-tighter capitalize">Checkout</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar pb-10">
        <section className="mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 px-2">delivery contact</h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-inner">
            <div className="flex gap-4 items-center">
              <User size={18} className="text-primary" />
              <span className="text-sm font-bold capitalize">{realName}</span>
            </div>
            <div className="flex gap-4 items-center">
              <Phone size={18} className="text-primary" />
              <span className="text-sm font-bold">{realPhone}</span>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 px-2">delivery address</h3>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 flex items-center justify-between active:scale-[0.98] transition-all shadow-inner"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={18} />
                </div>
                <div className="text-left max-w-[200px]">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selected Spot</p>
                  <p className="text-xs font-bold truncate">{getSelectedAddressText()}</p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-white/20 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-[300]"
                >
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {addressList.map((addr: any) => (
                      <button key={addr.id} 
                        onClick={() => { setSelectedAddrId(addr.id); setIsDropdownOpen(false); }}
                        className={`w-full px-6 py-5 flex items-center justify-between border-b border-white/5 active:bg-white/5 transition-colors ${selectedAddrId === addr.id ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${addr.id === 'profile' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                            {addr.type}
                          </span>
                          <span className="text-xs text-white/70 text-left line-clamp-1">{addr.address}</span>
                        </div>
                        {selectedAddrId === addr.id && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                    <button onClick={() => { setShowAddressPopup(true); setIsDropdownOpen(false); }}
                      className="w-full px-6 py-5 flex items-center gap-3 text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                    >
                      <Plus size={16} /> 
                      <span className="text-xs font-black uppercase tracking-widest">New Delivery Address</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="bg-primary/10 border border-primary/20 rounded-[2rem] p-5 flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h4 className="text-sm font-black text-primary capitalize">Premium Delivery</h4>
            <p className="text-xs font-bold text-primary/60">Flash arrival in 15 mins • Cash on Delivery</p>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 py-4 opacity-10">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Kilogram Secure</span>
        </div>
      </div>

      <div className="p-6 bg-[#0c0c0f] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Amount to pay</span>
            <span className="text-3xl font-black italic text-primary">₹{total}</span>
          </div>
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
             <span className="text-[10px] font-black text-green-400 capitalize tracking-wide">Cash on Delivery</span>
          </div>
        </div>
        
        <button 
          onClick={handlePlaceOrder}
          disabled={loading || (selectedAddrId === 'new' && newAddress.length < 5)}
          className="w-full h-16 bg-white text-black rounded-[2rem] flex items-center justify-center gap-3 font-black transition-all active:scale-95 disabled:opacity-30"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              <span className="text-base uppercase tracking-widest">Confirm Order</span>
              <ArrowRight size={20} strokeWidth={3} />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showAddressPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressPopup(false)} className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-[410] bg-[#12121a] border-t border-white/10 rounded-t-[3rem] p-8 pb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black capitalize">Add New Location</h3>
                <button onClick={() => setShowAddressPopup(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><X size={20} /></button>
              </div>
              <button onClick={handleDetectLocationManual} className="w-full mb-4 py-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center gap-3 text-primary font-black text-xs uppercase">
                <Navigation size={16} /> {isDetecting ? "Fetching..." : "Detect Current Signal"}
              </button>
              <textarea autoFocus className="w-full bg-white/5 rounded-2xl p-5 text-sm font-bold outline-none border border-white/10 focus:border-primary text-white h-32 mb-6 resize-none placeholder:text-white/10" placeholder="flat no, street name, area..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              <button onClick={() => { setSelectedAddrId('new'); setShowAddressPopup(false); }} disabled={newAddress.length < 5} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs">Save and use</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CheckoutScreen;