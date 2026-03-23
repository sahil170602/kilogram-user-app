import { useState } from "react";
import { ChevronLeft, Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";
import ProductGrid from "../components/ProductGrid";
import CategoryGrid from "../components/CategoryGrid";
import FloatingCart from "../components/FloatingCart";

interface SeeAllProps {
  type: "category" | "product";
  title: string;
  data: any[];
  cart?: Record<number, number>;
  onBack: () => void;
  onUpdateQuantity?: (id: number, delta: number) => void;
  onCategoryClick?: (category: any) => void;
  onOpenCart?: () => void; 
  onProductClick?: (product: any) => void;
}

const SeeAllScreen = ({ type, title, data = [], cart = {}, onBack, onUpdateQuantity, onCategoryClick, onOpenCart, onProductClick }: SeeAllProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Sort Best Sellers if product type (matches ProductGrid logic)
  const processedData = type === "product" 
    ? [...data].sort((a: any, b: any) => (b.order_count || 0) - (a.order_count || 0))
    : data;

  // 2. Filter based on real database 'name' field
  const filteredData = processedData.filter((item) =>
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[120] bg-[#08080a] flex flex-col lowercase"
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-[#08080a]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tighter capitalize">{title}</h2>
            <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                {filteredData.length} items found
            </p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:scale-90 transition-all">
          <SlidersHorizontal size={18} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            type="text"
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-primary/40 transition-all text-white placeholder:text-white/10"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar">
        {filteredData.length > 0 ? (
            type === "category" ? (
            <CategoryGrid 
                categories={filteredData} 
                hideHeader 
                onCategoryClick={onCategoryClick} 
            />
            ) : (
            <ProductGrid 
                products={filteredData} 
                cart={cart}
                onUpdateQuantity={onUpdateQuantity || (() => {})} 
                onProductClick={onProductClick}
                hideHeader 
            />
            )
        ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <PackageSearch size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No matching results</p>
            </div>
        )}
      </div>

      {/* Floating Cart integration */}
      {totalCartItems > 0 && (
        <FloatingCart 
            cartCount={totalCartItems} 
            onClick={() => onOpenCart && onOpenCart()} 
            bottomPosition="bottom-10"
        />
      )}
    </motion.div>
  );
};

export default SeeAllScreen;