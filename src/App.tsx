import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';

function App() {
  const [stage, setStage] = useState<'loading' | 'login' | 'dashboard'>('loading');
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [preciseAddress, setPreciseAddress] = useState("detecting...");

  // STORE DATA STATE
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [liveOrder, setLiveOrder] = useState<any>(null);

  /**
   * 1. SESSION INITIALIZATION & MASTER DATA FETCH
   */
  useEffect(() => {
    const initializeApp = async () => {
      const savedUser = localStorage.getItem('kilo_session');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // 🎯 FIX: Set user immediately from storage so the app feels instant and doesn't get stuck
          setUser(parsedUser);
          setPreciseAddress(parsedUser.location?.address || parsedUser.last_address || "set location");

          // Fetch fresh profile data quietly in the background
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', parsedUser.id)
            .maybeSingle();
          
          if (error) throw error;

          if (profile) {
            setUser(profile);
            setPreciseAddress(profile.last_address || "set location");
            // Update local storage with fresh data
            localStorage.setItem('kilo_session', JSON.stringify(profile));
          }
        } catch (e) {
          // 🎯 FIX: DO NOT remove the session here! 
          // Mobile networks drop often. Removing the session here caused the "Auto Logout" bug.
          console.error("Background profile sync failed, keeping local session active:", e);
        }
      }
      await fetchStoreData();
    };

    initializeApp();

    // Catalog Realtime Sync
    const catalogSubscription = supabase
      .channel('catalog-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchStoreData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchStoreData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, () => fetchStoreData())
      .subscribe();

    return () => { supabase.removeChannel(catalogSubscription); };
  }, []);

  const fetchStoreData = async () => {
    try {
      const [sec, cat, prod] = await Promise.all([
        supabase.from('sections').select('*').order('id'),
        supabase.from('categories').select('*'),
        supabase.from('products').select('*')
      ]);

      if (sec.data) setSections(sec.data as any);
      if (cat.data) setCategories(cat.data as any);
      if (prod.data) setProducts(prod.data as any);
    } catch (err) {
      console.error("Master fetch failed:", err);
    }
  };

  /**
   * 2. MONITOR LIVE ORDERS & REALTIME PROFILE UPDATES
   */
  useEffect(() => {
    if (!user?.id) return;

    // Fetch active order
    const fetchActiveOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id) 
        .neq('status', 'delivered')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setLiveOrder(data || null);
    };

    fetchActiveOrder();

    // Order Tracking Subscription
    const orderSubscription = supabase
      .channel(`user-tracking-${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') setLiveOrder(payload.new);
          else if (payload.eventType === 'UPDATE') {
            setLiveOrder((prev: any) => {
              const updated = { ...prev, ...payload.new };
              return updated.status === 'delivered' ? null : updated;
            });
          }
          else if (payload.eventType === 'DELETE') setLiveOrder(null);
        }
      )
      .subscribe();

    // 🎯 PROFILE SYNC: Updates Header address instantly if changed in Profile Settings
    const profileSubscription = supabase
      .channel(`profile-sync-${user.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new.last_address) {
            setPreciseAddress(payload.new.last_address);
            setUser(payload.new); // Keep global user state in sync
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(orderSubscription); 
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id, stage]);

  /**
   * 3. HANDLERS
   */
  const handleSplashComplete = () => {
    if (user) setStage('dashboard');
    else setStage('login');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setPreciseAddress(userData.location?.address || userData.last_address || "location set");
    localStorage.setItem('kilo_session', JSON.stringify(userData));
    setStage('dashboard');
  };

  const handleLogout = async () => {
    setShowProfile(false);
    localStorage.removeItem('kilo_session');
    setUser(null);
    setStage('login');
    // Also sign out of the Supabase backend session
    await supabase.auth.signOut();
  };

  const updateGlobalUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('kilo_session', JSON.stringify(updatedUser));
  };

  const handleUpdateProfile = async (data: any) => {
    const updated = { ...user, full_name: data.name, phone_number: data.phone };
    updateGlobalUser(updated);
    await supabase.from('profiles').update({ full_name: data.name, phone_number: data.phone }).eq('id', user.id);
  };

  const handleSaveAddress = async (newAddresses: any[]) => {
    const updated = { ...user, addresses: newAddresses };
    updateGlobalUser(updated);
    await supabase.from('profiles').update({ addresses: newAddresses }).eq('id', user.id);
  };

  return (
    <div className="bg-[#08080a] min-h-screen text-white overflow-x-hidden selection:bg-primary selection:text-black font-sans lowercase no-scrollbar">
      <AnimatePresence mode="wait">
        
        {stage === 'loading' && (
          <motion.div key="splash" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100]">
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {stage === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="min-h-screen">
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        )}

        {stage === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen relative">
            <HomeScreen 
              user={user} 
              preciseAddress={preciseAddress}
              sections={sections}
              categories={categories}
              products={products}
              liveOrder={liveOrder}
              onProfileClick={() => setShowProfile(true)}
              onUpdateUser={updateGlobalUser}
              onLogout={handleLogout}
              onOrderPlaced={(orderData: any) => setLiveOrder(orderData)} 
            />

            <AnimatePresence>
              {showProfile && (
                <ProfileScreen 
                  user={user} 
                  currentAddress={preciseAddress} 
                  onBack={() => setShowProfile(false)} 
                  onLogout={handleLogout}
                  onUpdateProfile={handleUpdateProfile}
                  onSaveAddress={(newEntry: any) => handleSaveAddress([newEntry, ...(user.addresses || [])])}
                  onDeleteAddress={(id) => handleSaveAddress((user.addresses || []).filter((a: any) => a.id !== id))}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default App;