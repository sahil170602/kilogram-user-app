import { useState, useEffect } from "react";
import { 
  Plus, Bike, Timer, ChevronRight, ShoppingBag, XCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Component Imports
import Header from "../components/Header";
import CategoryGrid from "../components/CategoryGrid";
import ProductGrid from "../components/ProductGrid";
import SearchSection from "../components/SearchSection";
import SeeAllScreen from "./SeeAllScreen";
import FloatingCart from "../components/FloatingCart";
import CartScreen from "./CartScreen";
import ProductDetailScreen from "./ProductDetailScreen";
import LikedScreen from "./LikedScreen";
import OrderTrackingScreen from "./OrderTrackingScreen";

interface HomeProps {
  user: any;
  preciseAddress: string;
  sections: any[];
  categories: any[];
  products: any[];
  liveOrder: any;
  onLogout: () => void;
  onProfileClick: () => void;
  onUpdateUser: (updatedUser: any) => void;
  onOrderPlaced: (order: any) => void; 
}

const SEARCH_HINTS = ["basmati rice", "fresh milk", "cooking oil", "detergent pack"];

const HomeScreen = ({ 
  user, preciseAddress, sections = [], categories = [], products = [], liveOrder,
  onProfileClick, onUpdateUser, onOrderPlaced 
}: HomeProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  
  const [viewAll, setViewAll] = useState<{ type: "category" | "product", title: string, data: any[] } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [likedIds, setLikedIds] = useState<number[]>([]);
  
  const [isLikedPageOpen, setIsLikedPageOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setHintIndex(prev => (prev + 1) % SEARCH_HINTS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handleBack = () => {
      if (isTrackingOpen) setIsTrackingOpen(false);
      else if (isCartOpen) setIsCartOpen(false);
      else if (selectedProduct) setSelectedProduct(null);
      else if (isLikedPageOpen) setIsLikedPageOpen(false);
      else if (viewAll) setViewAll(null);
      else if (searchQuery !== "") setSearchQuery("");
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [isCartOpen, viewAll, searchQuery, selectedProduct, isLikedPageOpen, isTrackingOpen]);

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  const handleCategoryClick = (cat: any) => {
    const filtered = (products || []).filter(p => p.category_id === cat.id);
    setViewAll({ type: "product", title: cat.title || cat.name, data: filtered });
  };

  const handleFinalOrderPlaced = (orderData: any) => {
    setCart({}); 
    setIsCartOpen(false); 
    onOrderPlaced(orderData); 
  };

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const searchResults = searchQuery 
    ? (products || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) 
    : [];

  return (
    <div className="flex flex-col h-screen bg-[#08080a] text-white font-sans overflow-hidden relative lowercase">
      
      <Header 
        userId={user?.id} 
        userName={user?.full_name} 
        onProfileClick={onProfileClick}
        onLikedClick={() => setIsLikedPageOpen(true)} 
      />

      <SearchSection 
        query={searchQuery} setQuery={setSearchQuery} 
        isFocused={isSearchFocused} setIsFocused={setIsSearchFocused}
        hint={SEARCH_HINTS[hintIndex]} onVoice={() => {}} onCamera={() => {}}
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {!searchQuery ? (
          <div className="pt-4">
            {(sections || []).length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center opacity-10 italic">
                 <ShoppingBag size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">no sections configured</p>
               </div>
            ) : sections.map((section: any) => {
              const secProds = (products || []).filter(p => p.section_id === section.id);
              const secCats = (categories || []).filter(c => c.section_id === section.id);

              if (secProds.length === 0 && secCats.length === 0) return null;

              return (
                <section key={section.id} className="mb-14">
                  <div className="px-6 mb-6">
                    <div className="flex flex-col">
                      {section.subtitle && (
                        <span className="text-[9px] font-black capitalize text-primary tracking-[0.3em] mb-1 opacity-80">
                          {section.subtitle}
                        </span>
                      )}
                      <h2 className="text-3xl font-black tracking-tighter text-white capitalize leading-none">
                        {section.title || "unnamed"}
                      </h2>
                      <div className="h-1 w-8 bg-primary mt-2 rounded-full opacity-40" />
                    </div>
                  </div>

                  {secCats.length > 0 && (
                    <CategoryGrid 
                      categories={secCats} 
                      onSeeAll={() => setViewAll({ 
                        type: 'category', 
                        title: `${section.title} Categories`, 
                        data: secCats 
                      })} 
                      onCategoryClick={handleCategoryClick} 
                    />
                  )}

                  <ProductGrid 
                    products={secProds} 
                    cart={cart} 
                    onUpdateQuantity={updateQuantity} 
                    onProductClick={setSelectedProduct} 
                    onSeeAll={() => setViewAll({ 
                      type: 'product', 
                      title: `${section.title} Best Sellers`, 
                      data: secProds 
                    })}
                  />
                </section>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-6 pb-2">
            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-wide mb-6">found {searchResults.length} items</h3>
            <div className="grid grid-cols-2 gap-5">
              {searchResults.map((p: any) => (
                <motion.div key={p.id} layout onClick={() => setSelectedProduct(p)} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-5 active:scale-95 transition-transform">
                  <div className="aspect-square rounded-3xl bg-white/[0.03] flex items-center justify-center overflow-hidden mb-5">
                    {p.image_url ? (
                      <img src={p.image_url} className="w-full h-full object-contain p-2" alt="" />
                    ) : (
                      <span className="text-5xl">{p.img || "📦"}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-black mb-4 line-clamp-1">{p.name}</h4>
                  <div className="flex justify-between items-center" onClick={e => e.stopPropagation()}>
                    <span className="text-xl font-black italic">₹{p.price}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-all"><Plus size={18} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {liveOrder && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsTrackingOpen(true)}
            className={`fixed bottom-28 left-6 right-6 z-[100] p-4 rounded-[2.2rem] flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-[#08080a] cursor-pointer transition-colors ${
              liveOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-primary'
            }`}
          >
            <div className="flex items-center gap-4 text-black">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-xl relative">
                {liveOrder.status === 'cancelled' ? (
                   <XCircle size={28} className="text-red-500" />
                ) : (
                  <>
                    <Bike size={28} className="text-primary" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
                    </span>
                  </>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase leading-none mb-1.5 tracking-tighter">
                  {liveOrder.status === 'cancelled' ? 'Order Cancelled' : `Order ${liveOrder.status}`}
                </h4>
                <div className="flex items-center gap-1.5 opacity-60">
                  {liveOrder.status === 'cancelled' ? (
                     <span className="text-[10px] font-black uppercase tracking-widest text-black">Tap to view details</span>
                  ) : (
                    <>
                      <Timer size={14} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Arriving in 15m</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {liveOrder.status === 'cancelled' ? (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onUpdateUser({...user});
                }}
                className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-black hover:bg-black/30 transition-colors"
              >
                <XCircle size={20} strokeWidth={3} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                <ChevronRight size={20} className="text-black" strokeWidth={3} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!liveOrder && totalCartItems > 0 && (
        <FloatingCart cartCount={totalCartItems} onClick={() => setIsCartOpen(true)} />
      )}

      <AnimatePresence>
        {isCartOpen && (
          <CartScreen 
            cart={cart} 
            products={products} 
            user={user} 
            onClose={() => setIsCartOpen(false)} 
            onUpdateQuantity={updateQuantity} 
            onUpdateUser={onUpdateUser} 
            onOrderPlaced={handleFinalOrderPlaced} 
          />
        )}
        {viewAll && (
          <SeeAllScreen type={viewAll.type} title={viewAll.title} data={viewAll.data} cart={cart} onUpdateQuantity={updateQuantity} onCategoryClick={handleCategoryClick} onOpenCart={() => setIsCartOpen(true)} onProductClick={setSelectedProduct} onBack={() => setViewAll(null)} />
        )}
        {selectedProduct && (
          <ProductDetailScreen product={selectedProduct} allProducts={products} cart={cart} onUpdateQuantity={updateQuantity} onOpenCart={() => setIsCartOpen(true)} onProductClick={setSelectedProduct} isLiked={likedIds.includes(selectedProduct.id)} onToggleLike={() => setLikedIds(prev => prev.includes(selectedProduct.id) ? prev.filter(id => id !== selectedProduct.id) : [...prev, selectedProduct.id])} onClose={() => setSelectedProduct(null)} />
        )}
        {isLikedPageOpen && (
          <LikedScreen likedProducts={products.filter(p => likedIds.includes(p.id))} cart={cart} onUpdateQuantity={updateQuantity} onProductClick={setSelectedProduct} onBack={() => setIsLikedPageOpen(false)} />
        )}
        {isTrackingOpen && (
          <OrderTrackingScreen 
            order={liveOrder} 
            onClose={() => setIsTrackingOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeScreen;