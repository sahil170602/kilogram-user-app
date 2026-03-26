import { Star, Plus, Minus, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, Fragment } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  img?: string;        
  image_url?: string;  
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
  isBulkSection?: boolean; 
  onOpenCart?: () => void; 
}

const ProductGrid = ({ products, cart, onUpdateQuantity, onSeeAll, onProductClick, hideHeader, isBulkSection, onOpenCart }: ProductGridProps) => {
  const displayData = hideHeader ? products : (products || []).slice(0, 10);

  const [bulkExpandId, setBulkExpandId] = useState<number | null>(null);
  const [bulkKg, setBulkKg] = useState(1);
  const [bulkGm, setBulkGm] = useState(0);

  // Chunk data into rows of 2 so the slider can span the full width below them
  const rows = [];
  for (let i = 0; i < displayData.length; i += 2) {
    rows.push(displayData.slice(i, i + 2));
  }

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

      <div className="grid grid-cols-2 gap-5 items-start">
        {rows.map((row, rowIndex) => {
          const activeProductInRow = row.find(p => isBulkSection && bulkExpandId === p.id);
          const activeQty = activeProductInRow ? (cart[activeProductInRow.id] || 0) : 0;

          return (
            <Fragment key={`row-${rowIndex}`}>
              {row.map((p) => {
                const qty = cart[p.id] || 0;
                const isExpanded = isBulkSection && bulkExpandId === p.id;

                return (
                  <motion.div 
                    key={p.id} 
                    layout 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    onClick={() => onProductClick && onProductClick(p)}
                    className={`bg-white/[0.02] border rounded-[2.5rem] p-5 flex flex-col relative overflow-hidden group cursor-pointer transition-all h-full ${
                      isExpanded ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* 🎯 FIX: Changed to aspect-[4/5], bg-white, and object-contain to standardize all image sizes */}
                    <div className="aspect-[4/5] w-full rounded-2xl bg-white flex items-center justify-center overflow-hidden mb-4 relative p-2">
                      {p.image_url ? (
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <span className="text-4xl group-hover:scale-110 transition-transform">{p.img || "📦"}</span>
                      )}

                      {(p.orderCount || 0) > 50 && (
                        <div className="absolute top-2 right-2 bg-primary text-black text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-widest z-10 shadow-lg">Hot</div>
                      )}
                    </div>

                    <h4 className="text-[14px] font-black text-white mb-1 truncate capitalize">{p.name}</h4>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        <Star size={10} fill="currentColor" className="text-primary" />
                        <span className="text-[11px] font-black text-primary">
                          {p.rating ? Number(p.rating).toFixed(1) : "0.0"}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/20 font-bold tracking-tight truncate ml-2">
                        {isBulkSection ? 'per kg' : p.unit}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto pt-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-lg font-black tracking-tight shrink-0">
                        ₹{p.price}{isBulkSection ? <span className="text-[10px] text-white/40">/kg</span> : ''}
                      </span>
                      
                      {qty === 0 ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isBulkSection) {
                              if (isExpanded) {
                                setBulkExpandId(null);
                              } else {
                                setBulkExpandId(p.id);
                                setBulkKg(1);
                                setBulkGm(0);
                              }
                            } else {
                              onUpdateQuantity(p.id, 1);
                            }
                          }} 
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shrink-0 ${
                            isExpanded ? 'bg-primary text-black' : 'bg-white text-black hover:bg-primary'
                          }`}
                        >
                          {isExpanded ? <X size={18} strokeWidth={3} /> : <Plus size={18} />}
                        </button>
                      ) : (
                        isBulkSection ? (
                          <div 
                            className={`flex items-center rounded-2xl p-2 gap-1.5 border shrink-0 cursor-pointer active:scale-95 transition-all ${
                              isExpanded ? 'bg-primary text-black border-primary' : 'bg-primary/20 text-primary border-primary/30'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isExpanded) {
                                setBulkExpandId(null);
                              } else {
                                setBulkExpandId(p.id);
                                setBulkKg(Math.floor(qty));
                                setBulkGm(Math.round((qty % 1) * 1000));
                              }
                            }}
                          >
                            <span className="font-black text-xs px-1">{qty} kg</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-1.5 border border-white/10 shrink-0">
                            <button onClick={() => onUpdateQuantity(p.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl active:scale-90 transition-all hover:bg-red-500/20">
                              <Minus size={14} className="text-white" />
                            </button>
                            <span className="font-black text-xs text-white min-w-[12px] text-center">{qty}</span>
                            <button onClick={() => onUpdateQuantity(p.id, 1)} className="w-8 h-8 flex items-center justify-center bg-primary rounded-xl active:scale-90 transition-all text-black">
                              <Plus size={14} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* 🎯 THE FULL WIDTH SLIDER WITH PLUS/MINUS BUTTONS */}
              <AnimatePresence>
                {activeProductInRow && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="col-span-2 overflow-hidden"
                  >
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 mt-2 mb-4 shadow-inner">
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">Set Exact Weight</span>
                          <span className="text-sm font-black capitalize">{activeProductInRow.name}</span>
                        </div>
                        <button onClick={() => setBulkExpandId(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 active:scale-90 transition-transform">
                          <X size={16} />
                        </button>
                      </div>

                      {/* KILOGRAM CONTROL */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-white/60">Kilograms</span>
                              <div className="flex items-center gap-3">
                                  <button onClick={() => setBulkKg(Math.max(0, bulkKg - 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
                                      <Minus size={14} />
                                  </button>
                                  <span className="text-white font-black w-10 text-center">{bulkKg} <span className="text-[10px] text-white/40">KG</span></span>
                                  <button onClick={() => setBulkKg(Math.min(500, bulkKg + 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
                                      <Plus size={14} />
                                  </button>
                              </div>
                          </div>
                          <input 
                            type="range" min="0" max="500" value={bulkKg} 
                            onChange={(e) => setBulkKg(Number(e.target.value))} 
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff99c1]" 
                          />
                      </div>

                      {/* GRAM CONTROL */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-white/60">Grams</span>
                              <div className="flex items-center gap-3">
                                  <button onClick={() => setBulkGm(Math.max(0, bulkGm - 50))} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
                                      <Minus size={14} />
                                  </button>
                                  <span className="text-white font-black w-10 text-center">{bulkGm} <span className="text-[10px] text-white/40">G</span></span>
                                  <button onClick={() => setBulkGm(Math.min(950, bulkGm + 50))} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
                                      <Plus size={14} />
                                  </button>
                              </div>
                          </div>
                          <input 
                            type="range" min="0" max="950" step="50" value={bulkGm} 
                            onChange={(e) => setBulkGm(Number(e.target.value))} 
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff99c1]" 
                          />
                      </div>

                      <button
                         onClick={() => {
                             const totalWeight = bulkKg + (bulkGm / 1000);
                             if (totalWeight > 0) {
                                 const delta = totalWeight - activeQty; 
                                 onUpdateQuantity(activeProductInRow.id, delta);
                                 setBulkExpandId(null);
                                 if (onOpenCart) onOpenCart(); 
                             }
                         }}
                         className="w-full py-4 bg-primary text-black rounded-[1.5rem] font-black uppercase tracking-widest mt-2 flex justify-between px-6 items-center shadow-[0_10px_30px_rgba(255,153,193,0.25)] active:scale-[0.98] transition-all"
                      >
                         <span className="text-sm">Update Cart</span>
                         <span className="text-lg">₹{Math.round(activeProductInRow.price * (bulkKg + bulkGm / 1000))}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;