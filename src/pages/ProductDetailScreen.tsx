import { useEffect, useRef, useState } from "react";
import { 
  ChevronLeft, Star, Plus, Minus, 
  ShoppingBag, Share2, RefreshCcw, Zap, ShieldCheck, Heart, Check, 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  unit: string;
  img?: string;
  image_url?: string;
  rating_avg?: number;
  rating_count?: number;
  brand?: string;
  variant?: string;
  calorie_count?: string;
  product_type?: string;
  shelf_life?: string;
  ingredients?: string;
  key_features?: string;
  allergen_info?: string;
  items_included?: string;
  dietary_preference?: string;
  category_id?: number;
}

interface ProductDetailProps {
  product: Product;
  allProducts: Product[]; 
  cart: Record<number, number>;
  onUpdateQuantity: (id: number, delta: number) => void;
  onClose: () => void;
  onOpenCart: () => void;
  onProductClick: (product: Product) => void;
  recentProducts: Product[];
  isLiked: boolean; 
  onToggleLike: () => void;
}

const hasData = (val: any) => val && val.toString().trim() !== "" && val !== "EMPTY" && val !== "undefined";

const ProductDetailScreen = ({ 
  product, 
  allProducts = [],
  cart, 
  onUpdateQuantity, 
  onClose, 
  onOpenCart, 
  onProductClick,
  recentProducts = [],
  isLiked,
  onToggleLike
}: ProductDetailProps) => {
  const qty = cart[product.id] || 0;
  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showCopiedBadge, setShowCopiedBadge] = useState(false);

  const suggestedProducts = (allProducts || [])
    .filter(p => p.category_id === product.category_id && p.id !== product.id)
    .sort(() => 0.5 - Math.random()) 
    .slice(0, 10);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0);
    return () => { document.body.style.overflow = "auto"; };
  }, [product.id]);

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Kilo! 🛒`,
      url: window.location.href, 
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShowCopiedBadge(true);
      setTimeout(() => setShowCopiedBadge(false), 2000);
    }
  };

  const HorizontalProductCard = ({ item, index, prefix }: { item: Product, index: number, prefix: string }) => (
    <div 
      key={`${prefix}-${item.id || index}`}
      onClick={() => onProductClick(item)}
      className="min-w-[160px] max-w-[160px] snap-start bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex flex-col gap-2 active:scale-95 transition-all"
    >
      <div className="aspect-square bg-white/[0.03] rounded-2xl flex items-center justify-center overflow-hidden">
        {item.image_url ? (
            <img src={item.image_url} className="w-full h-full object-cover" alt="" />
        ) : (
            <span className="text-4xl">{item.img || "📦"}</span>
        )}
      </div>
      <h4 className="text-[11px] font-black uppercase truncate text-white/90 mt-1 capitalize">{item.name}</h4>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sm font-black tracking-tighter">₹{item.price}</span>
        <div className="flex items-center gap-0.5 text-primary">
          <Star size={10} fill="currentColor" />
          <span className="text-[10px] font-bold">{item.rating_avg ? Number(item.rating_avg).toFixed(1) : "0.0"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      key={product.id}
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[130] bg-[#08080a] flex flex-col font-sans text-white lowercase"
    >
      <AnimatePresence>
        {showCopiedBadge && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl"
          >
            <Check size={16} strokeWidth={3} />
            <span className="text-[10px] font-black  tracking-widest">Link Copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="absolute top-0 w-full px-6 pt-12 pb-4 flex items-center justify-between z-30 pointer-events-none">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform text-white">
          <ChevronLeft size={20} />
        </button>
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar">
        {/* HERO IMAGE CONTAINER - UPDATED TO FULL SIZE */}
        <div className="relative h-[50vh] w-full bg-white/[0.02] flex items-center justify-center rounded-b-[3.5rem] border-b border-white/5 overflow-hidden shrink-0">
          {product.image_url ? (
              <img 
                src={product.image_url} 
                className="w-full h-full object-cover z-10" 
                alt={product.name} 
              />
          ) : (
            <span className="text-[140px] z-10">{product.img || "📦"}</span>
          )}
          
          {/* Subtle bottom fade to blend with background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent z-20 pointer-events-none" />
        </div>

        <div className="px-6 py-8">
          <div className="flex justify-between items-start mb-2">
            <div className="max-w-[70%]">
              <h1 className="text-3xl font-black tracking-tighter mb-1 leading-tight capitalize">{product.name}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60"><Share2 size={18} /></button>
              <button onClick={onToggleLike} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"><Heart size={18} className={isLiked ? "text-primary fill-primary" : "text-white/60"} /></button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary tracking-tighter">₹{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                        <span className="text-lg text-white/60 line-through font-bold">₹{product.mrp}</span>
                    )}
                </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Star size={14} fill="#ff99c1" className="text-primary" />
              <span className="text-sm font-black text-primary">
                {product.rating_avg ? Number(product.rating_avg).toFixed(1) : "0.0"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <Badge icon={<Zap size={20}/>} label={product.variant || 'Standard'} sub="Variant" />
            <Badge icon={<RefreshCcw size={20}/>} label={product.shelf_life || 'Fresh'} sub="Shelf Life" />
            <Badge icon={<ShieldCheck size={20}/>} label={product.product_type || 'Genuine'} sub="Quality" />
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 space-y-5">
              <SpecRow label="Brand" value={product.brand} />
              <SpecRow label="Variant" value={product.variant} />
              <SpecRow label="Calorie Count" value={product.calorie_count} />
              <SpecRow label="Product Type" value={product.product_type} />
              <SpecRow label="Shelf Life" value={product.shelf_life} />
              <SpecRow label="Key Features" value={product.key_features} />
              <SpecRow label="Ingredients" value={product.ingredients} />
              <SpecRow label="Allergy Info" value={product.allergen_info} />
              <SpecRow label="Dietary Info" value={product.dietary_preference} />
              <SpecRow label="Items Included" value={product.items_included} />
            </div>
          </div>

          {suggestedProducts.length > 0 && (
            <div className="mb-12 -mx-6">
              <div className="px-6 mb-5 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Suggested For You</h3>
                <div className="h-px flex-1 bg-white/5 ml-4" />
              </div>
              <div className="flex overflow-x-auto snap-x gap-4 px-6 no-scrollbar pb-4">
                {suggestedProducts.map((p, idx) => (
                  <HorizontalProductCard key={`suggested-${p.id || idx}`} item={p} index={idx} prefix="suggested" />
                ))}
              </div>
            </div>
          )}

          {recentProducts.length > 0 && (
            <div className="mb-12 -mx-6">
              <div className="px-6 mb-5 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Recently Viewed</h3>
                <div className="h-px flex-1 bg-white/5 ml-4" />
              </div>
              <div className="flex overflow-x-auto snap-x gap-4 px-6 no-scrollbar pb-4">
                {recentProducts
                  .filter(rp => rp.id !== product.id)
                  .map((p, idx) => (
                    <HorizontalProductCard key={`recent-${p.id || idx}`} item={p} index={idx} prefix="recent" />
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto bg-[#0c0c0f]/90 backdrop-blur-2xl border-t border-white/10 p-6 pb-10 z-30">
        {qty === 0 ? (
          <button onClick={() => onUpdateQuantity(product.id, 1)} className="w-full h-16 bg-primary text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm active:scale-95 shadow-[0_10px_30px_rgba(255,153,193,0.2)]">
            <Plus size={20} /> Add to Cart
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-1 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between px-3">
              <button onClick={() => onUpdateQuantity(product.id, -1)} className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl active:scale-90"><Minus size={18} /></button>
              <span className="font-black text-lg">{qty}</span>
              <button onClick={() => onUpdateQuantity(product.id, 1)} className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl active:scale-90 text-primary"><Plus size={18} /></button>
            </div>
            <button onClick={onOpenCart} className="flex-1 h-16 bg-primary text-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 font-black uppercase tracking-widest text-xs">
              <ShoppingBag size={18} /> View Cart ({totalCartItems})
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Badge = ({ icon, label, sub }: any) => (
  <div className="flex flex-col items-center gap-2 bg-white/[0.02] border border-white/10 py-5 rounded-[2rem]">
    <div className="text-primary">{icon}</div>
    <span className="text-[9px] font-black uppercase text-center leading-tight text-white/50">{label}<br/>{sub}</span>
  </div>
);

const SpecRow = ({ label, value }: any) => {
  if (!hasData(value)) return null;
  return (
    <div className="flex justify-between items-start border-b border-white/5 last:border-0 pb-3 last:pb-0 gap-8">
      <span className="text-[11px] text-white/40 font-bold uppercase tracking-widest shrink-0 mt-0.5">{label}</span>
      <span className="text-[12px] font-black tracking-wide text-right leading-relaxed text-white/90">
        {value}
      </span>
    </div>
  );
};

export default ProductDetailScreen;