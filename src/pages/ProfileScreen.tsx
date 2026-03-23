import { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  ChevronLeft, User, MapPin, LogOut, Edit3, 
  Plus, Trash2, Home, Briefcase, Navigation,
  ShoppingBag, HelpCircle, Bell, ChevronRight, X, HeadphonesIcon,
  Loader2, Package, Megaphone, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileProps {
  user: any;
  currentAddress: string;
  onBack: () => void;
  onLogout: () => void;
  onSaveAddress: (newAddr: any) => void;
  onDeleteAddress: (id: number | string) => void;
  onUpdateProfile: (data: { name: string; phone: string }) => void;
}

const ProfileScreen = ({ user, currentAddress, onBack, onLogout, onSaveAddress, onDeleteAddress, onUpdateProfile }: ProfileProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newAddrType, setNewAddrType] = useState("home");
  const [newAddrText, setNewAddrText] = useState("");
  
  const [editForm, setEditForm] = useState({ name: user?.full_name || "", phone: user?.phone_number || user?.phone || "" });
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  
  // Data States
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // 🎯 Track Unread State locally
  const [localLastRead, setLocalLastRead] = useState<Date>(
    user?.last_read_notifications ? new Date(user.last_read_notifications) : new Date(0)
  );

  const realName = user?.full_name || "Set your name";
  const realPhone = user?.phone_number || user?.phone || "No number linked";

  const unifiedAddresses = useMemo(() => {
    const saved = user?.addresses || [];
    const currentExists = saved.some((a: any) => a.address?.toLowerCase() === currentAddress?.toLowerCase());
    if (currentAddress && currentAddress !== "detecting..." && !currentExists) {
      return [{ id: 'current-loc', type: 'current', address: currentAddress }, ...saved];
    }
    return saved;
  }, [user?.addresses, currentAddress]);

  useEffect(() => {
    fetchUserData();

    const notifSub = supabase.channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setAdminNotifs(prev => [payload.new, ...prev]);
      }).subscribe();

    return () => { supabase.removeChannel(notifSub); };
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (orders) setOrderHistory(orders);

    const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (notifs) setAdminNotifs(notifs);
    setLoadingOrders(false);
  };

  const allNotifications = useMemo(() => {
    const combined: any[] = [];

    orderHistory.forEach(order => {
      combined.push({
        id: `order-${order.id}-${order.status}`,
        type: 'order',
        title: `Order ${order.status}`,
        message: order.status === 'delivered' ? `Order #${order.id.toString().slice(-6)} was successfully delivered.` : `Order #${order.id.toString().slice(-6)} is currently ${order.status}.`,
        time: new Date(order.created_at)
      });
    });

    adminNotifs.forEach(n => {
      combined.push({
        id: `admin-${n.id}`,
        type: n.type,
        title: n.title,
        message: n.message,
        time: new Date(n.created_at)
      });
    });

    return combined.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [orderHistory, adminNotifs]);

  const unreadCount = allNotifications.filter(n => n.time > localLastRead).length;

  const handleOpenSubPage = async (pageId: string) => {
    setActiveSubPage(pageId);
    
    if (pageId === 'notifications' && unreadCount > 0) {
      const now = new Date();
      setLocalLastRead(now);
      await supabase.from('profiles').update({ last_read_notifications: now.toISOString() }).eq('id', user.id);
    }
  };

  const handleAddNew = () => {
    if (!newAddrText.trim()) return;
    onSaveAddress({ id: Date.now(), type: newAddrType, address: newAddrText.toLowerCase(), user_id: user?.id });
    setNewAddrText("");
    setIsAdding(false);
  };

  const menuItems = [
    { id: 'orders', label: 'your orders', icon: <ShoppingBag size={20} />, color: 'text-blue-400' },
    { 
      id: 'notifications', 
      label: 'notifications', 
      icon: <Bell size={20} />, 
      color: 'text-orange-400',
      badge: unreadCount 
    },
    { id: 'support', label: 'help & support', icon: <HelpCircle size={20} />, color: 'text-green-400' },
  ];

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[250] bg-[#08080a] flex flex-col font-sans text-white lowercase overflow-hidden">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5 bg-[#08080a]">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 shrink-0"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-black tracking-tighter capitalize leading-none">Profile Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar pb-10">
        <section className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary mb-4 relative shadow-2xl">
            <User size={40} strokeWidth={1.5} />
            <button onClick={() => setShowEditProfile(true)} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center border-4 border-[#08080a] shadow-lg active:scale-90"><Edit3 size={14} /></button>
          </div>
          <h3 className="text-xl font-black tracking-tight first-letter:uppercase">{realName}</h3>
          <p className="text-xs text-white/40 font-bold">{realPhone}</p>
        </section>

        <section className="mb-10 space-y-3">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => handleOpenSubPage(item.id)} className="w-full p-5 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-between active:scale-[0.98] transition-all relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>{item.icon}</div>
                <span className="text-sm font-black first-letter:uppercase">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.badge !== undefined && item.badge > 0 && <span className="bg-primary text-black font-black text-[10px] px-2 py-1 rounded-full">{item.badge} new</span>}
                <ChevronRight size={18} className="text-white/20" />
              </div>
            </button>
          ))}
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">saved addresses</h3>
            {!isAdding && <button onClick={() => setIsAdding(true)} className="text-primary text-[10px] font-black uppercase flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"><Plus size={12} /> add new</button>}
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/[0.05] border border-primary/30 rounded-[2rem] p-6 space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {['home', 'work', 'other'].map(type => (
                      <button key={type} onClick={() => setNewAddrType(type)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${newAddrType === type ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/40"}`}>{type}</button>
                    ))}
                  </div>
                  <button onClick={() => setNewAddrText(currentAddress)} className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90"><Navigation size={16} /></button>
                </div>
                <textarea autoFocus className="w-full bg-white/5 rounded-2xl p-4 text-xs font-bold outline-none border border-white/10 focus:border-primary text-white h-24 placeholder:text-white/10" placeholder="enter address details..." value={newAddrText} onChange={(e) => setNewAddrText(e.target.value)} />
                <div className="flex gap-3">
                  <button onClick={() => setIsAdding(false)} className="flex-1 h-12 rounded-2xl bg-white/5 text-white/40 font-black text-[10px] uppercase">cancel</button>
                  <button onClick={handleAddNew} className="flex-1 h-12 rounded-2xl bg-white text-black font-black text-[10px] uppercase">save address</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-3">
            {unifiedAddresses.map((addr: any) => (
              <div key={addr.id} className={`bg-white/[0.02] border rounded-[2rem] p-5 flex items-start gap-4 transition-all ${addr.id === 'current-loc' ? 'border-primary/30 bg-primary/5' : 'border-white/10'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${addr.id === 'current-loc' ? 'bg-primary text-black' : 'bg-white/5 text-white/40'}`}>
                  {addr.type === 'home' ? <Home size={16}/> : addr.type === 'work' ? <Briefcase size={16}/> : <MapPin size={16}/>}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black mb-1 first-letter:uppercase">{addr.id === 'current-loc' ? 'current location' : addr.type}</h4>
                  <p className="text-xs text-white/40 leading-relaxed lowercase">{addr.address}</p>
                </div>
                {addr.id !== 'current-loc' && <button onClick={() => onDeleteAddress(addr.id)} className="text-white/10 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
        </section>

        <button onClick={onLogout} className="w-full p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] flex items-center justify-center gap-3 text-red-500 active:scale-[0.98] transition-all mt-6">
          <LogOut size={18} />
          <span className="text-sm font-black first-letter:uppercase">log out</span>
        </button>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProfile(false)} className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-[410] bg-[#12121a] border-t border-white/10 rounded-t-[3rem] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black first-letter:uppercase">edit profile</h3>
                <button onClick={() => setShowEditProfile(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><X size={20} /></button>
              </div>
              <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase mb-1">full name</p>
                  <input className="bg-transparent w-full outline-none font-bold text-sm" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase mb-1">phone number</p>
                  <input className="bg-transparent w-full outline-none font-bold text-sm" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                </div>
              </div>
              <button onClick={() => { onUpdateProfile(editForm); setShowEditProfile(false); }} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs">save changes</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSubPage && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute inset-0 z-[300] bg-[#08080a] flex flex-col">
            <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5 bg-[#08080a]">
              <button onClick={() => setActiveSubPage(null)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-black tracking-tighter first-letter:uppercase">{activeSubPage === 'support' ? 'help & support' : activeSubPage}</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar pb-10">
              
              {activeSubPage === 'orders' && (
                <div className="space-y-4">
                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4"><Loader2 size={32} className="animate-spin" /></div>
                  ) : orderHistory.length > 0 ? (
                    orderHistory.map((order: any) => (
                      <div key={order.id} className="p-5 bg-white/[0.02] border border-white/10 rounded-[2rem] flex flex-col gap-3">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/60"><Package size={20}/></div>
                               <div>
                                  <p className="text-[10px] font-black text-white/40 uppercase mb-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                  <h4 className="text-sm font-black">₹{order.total_amount}</h4>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                      <ShoppingBag size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-[10px]">no orders yet</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeSubPage === 'notifications' && (
                <div className="space-y-3">
                  {allNotifications.length > 0 ? (
                    allNotifications.map((notif: any) => {
                      const isUnread = notif.time > localLastRead;
                      return (
                        <div key={notif.id} className={`p-5 rounded-[2rem] flex items-start gap-4 transition-all ${isUnread ? 'bg-primary/5 border border-primary/20' : 'bg-white/[0.02] border border-white/5'}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.type === 'order' ? 'bg-blue-500/10 text-blue-400' : notif.type === 'offer' ? 'bg-orange-500/10 text-orange-400' : notif.type === 'alert' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                            {notif.type === 'order' ? <Package size={18} /> : notif.type === 'alert' ? <AlertCircle size={18} /> : <Megaphone size={18} />}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-black first-letter:uppercase ${isUnread ? 'text-white' : 'text-white/80'}`}>{notif.title}</h4>
                              <span className="text-[9px] font-black text-white/30 uppercase mt-0.5">{notif.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className={`text-xs leading-relaxed ${isUnread ? 'text-white/80' : 'text-white/50'}`}>{notif.message}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                      <Bell size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-[10px]">you are all caught up!</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeSubPage === 'support' && (
                <div className="space-y-6">
                  <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] text-center shadow-xl">
                    <HeadphonesIcon size={48} className="mx-auto text-primary mb-4" />
                    <h3 className="font-black text-lg mb-2 first-letter:uppercase">chat support</h3>
                    <button className="w-full mt-6 py-4 bg-primary text-black rounded-2xl font-black uppercase text-[10px]">start conversation</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileScreen;