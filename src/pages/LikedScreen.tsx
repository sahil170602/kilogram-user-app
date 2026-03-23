import { ChevronLeft, Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductGrid from "../components/ProductGrid";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  img: string;
  rating: number;
}

interface LikedScreenProps {
  likedProducts: Product[];
  cart: Record<number, number>;
  onUpdateQuantity: (id: number, delta: number) => void;
  onProductClick: (product: Product) => void;
  onBack: () => void;
}

const LikedScreen = ({ likedProducts, cart, onUpdateQuantity, onProductClick, onBack }: LikedScreenProps) => {
  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[140] bg-[#08080a] flex flex-col font-sans text-white"
    >
      {/* HEADER */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#08080a]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black uppercase tracking-tighter">My Favorites</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {likedProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6"
            >
              <ProductGrid 
                products={likedProducts} 
                cart={cart}
                onUpdateQuantity={onUpdateQuantity}
                onProductClick={onProductClick}
                hideHeader 
              />
            </motion.div>
          ) : (
            /* EMPTY STATE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center px-12 text-center py-40"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Heart size={32} className="text-white/20" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-2 text-white/80">Nothing Liked Yet</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-loose mb-8">
                Tap the heart on any product to save it here for later.
              </p>
              <button 
                onClick={onBack}
                className="px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-95 transition-all"
              >
                <ShoppingBag size={14} /> Start Shopping
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LikedScreen;