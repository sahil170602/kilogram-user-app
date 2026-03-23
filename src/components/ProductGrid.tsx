import { Star, Plus, Minus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  img?: string;        // Fallback emoji icon
  image_url?: string;  // Real uploaded image from Supabase
  rating: number;
  orderCount?: number;
}

interface ProductGridProps {
  products: Product[];
  cart: Record<number, number>;
  onUpdateQuantity: (id: number, delta: number) => void;
  onSeeAll?: () => void;
  onProductClick?: (product: Product) => void;
  hideHeader?: boolean;
}

const ProductGrid = ({ products, cart, onUpdateQuantity, onSeeAll, onProductClick, hideHeader }: ProductGridProps) => {
  // Show all products if in the See All screen, otherwise slice to 10
  const displayData = hideHeader ? products : (products || []).slice(0, 10);

  return (
    <div className={hideHeader ? "" : "px-6"}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Best Sellers</h3>
          {onSeeAll && (
            <button onClick={onSeeAll} className="flex items-center gap-1 text-primary text-[14px] font-black tracking-wide">
              See all <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <AnimatePresence>
          {displayData.map((p) => {
            const qty = cart[p.id] || 0;
            return (
              <motion.div 
                key={p.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                onClick={() => onProductClick && onProductClick(p)}
                className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-5 flex flex-col relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all"
              >
                
                {/* Image Container with Supabase Support */}
                <div className="aspect-4:5 rounded-2xl bg-white/[0.03] flex items-center justify-center overflow-hidden mb-4 relative">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform">{p.img || "📦"}</span>
                  )}

                  {/* Best Seller Badge logic unified here */}
                  {(p.orderCount || 0) > 50 && (
                    <div className="absolute top-2 right-2 bg-primary text-black text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-widest z-10 shadow-lg">
                      Hot
                    </div>
                  )}
                </div>

                {/* Name styling: Capitalize handles "First letter capital, rest small" */}
                <h4 className="text-[14px] font-black text-white mb-1 truncate capitalize">
                  {p.name}
                </h4>

                {/* DYNAMIC RATING SECTION */}
<div className="flex items-center gap-1.5 mb-3">
  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
    <Star size={10} fill="currentColor" className="text-primary" />
    <span className="text-[11px] font-black text-primary">
      {/* Show average rating or 0.0 if new product */}
      {p.rating_avg ? Number(p.rating_avg).toFixed(1) : "0.0"}
    </span>
  </div>

  <span className="text-[10px] text-white/20 font-bold tracking-tight">
    {/* Show total reviews and the unit */}
   
  </span>
</div>
                
                {/* Action Row */}
                <div className="flex justify-between items-center mt-auto" onClick={(e) => e.stopPropagation()}>
                  <span className="text-lg font-black tracking ">₹{p.price}</span>
                  
                  {qty === 0 ? (
                    <button 
                      onClick={() => onUpdateQuantity(p.id, 1)} 
                      className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center active:scale-90 transition-all hover:bg-primary shadow-lg"
                    >
                      <Plus size={18} />
                    </button>
                  ) : (
                    <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-3 border border-white/10">
                      <button 
                        onClick={() => onUpdateQuantity(p.id, -1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl active:scale-90 transition-all hover:bg-red-500/20"
                      >
                        <Minus size={14} className="text-white" />
                      </button>
                      <span className="font-black text-xs text-white min-w-[12px] text-center">{qty}</span>
                      <button 
                        onClick={() => onUpdateQuantity(p.id, 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-primary rounded-xl active:scale-90 transition-all text-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductGrid;