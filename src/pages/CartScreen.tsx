import { useState, useEffect } from "react";
import { 
  ChevronLeft, Plus, Minus, ShoppingBag, ArrowRight, Trash2, 
  HandCoins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutScreen from "./CheckoutScreen";

interface CartScreenProps {
  cart: Record<number, number>;
  products: any[];
  user: any; 
  onClose: () => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onUpdateUser: (updatedUser: any) => void; 
  onOrderPlaced: (order: any) => void;
}

const CartScreen = ({ cart, products, user, onClose, onUpdateQuantity, onUpdateUser, onOrderPlaced }: CartScreenProps) => {
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Map cart items to real product details from database
  const cartItems = Object.entries(cart)
    .map(([idString, qty]) => {
      const id = parseInt(idString);
      const product = products.find((p) => p.id === id);
      return product ? { ...product, qty } : null;
    })
    .filter((item): item is any => item !== null);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 99 || subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee + selectedTip;

  const tipPresets = [10, 20, 30, 50];

  const handleOrderSuccess = (orderData: any) => {
    setOrderSuccess(true);
    
    setTimeout(() => {
      setOrderSuccess(false);
      setShowCheckout(false);
      onOrderPlaced(orderData); 
      onClose(); 
    }, 3000);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[150] bg-[#08080a] flex flex-col font-sans text-white lowercase"
      >
        <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-[#08080a]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black tracking-tighter first-letter:uppercase">your cart</h2>
              <p className="text-[10px] text-white/40 font-bold tracking-widest">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar pb-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <ShoppingBag size={40} className="text-white/20 mb-6" />
              <h3 className="text-lg font-black tracking-tighter mb-2 first-letter:uppercase">cart is empty</h3>
              <button onClick={onClose} className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-transform">start shopping</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => (
                    <motion.div 
                      key={`cart-item-${item.id || index}`} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-4 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <span className="text-3xl">{item.img || "📦"}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-black truncate mb-1 first-letter:uppercase">{item.name}</h4>
                        <p className="text-xs text-white/40 font-bold">₹{item.price}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <button onClick={() => onUpdateQuantity(item.id, -item.qty)} className="text-white/20 active:text-red-400">
                          <Trash2 size={14} />
                        </button>
                        <div className="h-8 rounded-xl bg-primary text-black flex items-center px-1 gap-2 border border-primary">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-black/10 rounded-lg"><Minus size={12} /></button>
                          <span className="font-black text-[10px] w-3 text-center">{item.qty}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-black/10 rounded-lg"><Plus size={12} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <HandCoins size={24} />
                  </div>
                  <h3 className="text-sm font-black tracking-tight first-letter:uppercase">tip your partner</h3>
                </div>
                <p className="text-xs text-white/40 font-bold mb-5 leading-relaxed">100% of the tip goes to your delivery partner</p>
                <div className="flex gap-3">
                  {tipPresets.map((amount) => (
                    <button
                      key={`tip-preset-${amount}`}
                      onClick={() => setSelectedTip(selectedTip === amount ? 0 : amount)}
                      className={`flex-1 py-3 rounded-2xl border font-black text-xs transition-all ${selectedTip === amount ? "bg-primary border-primary text-black scale-95" : "bg-white/5 border-white/10 text-white/60"}`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 mb-4">
                <h3 className="text-base font-black text-primary mb-5 first-letter:uppercase">bill details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white/60 first-letter:uppercase">item total</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {selectedTip > 0 && (
                    <div className="flex justify-between text-sm font-bold text-primary">
                      <span className="first-letter:uppercase">rider tip ❤️</span>
                      <span>₹{selectedTip}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white/60 first-letter:uppercase">delivery fee</span>
                    {deliveryFee === 0 ? <span className="text-primary font-black uppercase text-[10px]">free</span> : <span>₹{deliveryFee}</span>}
                  </div>
                  <div className="h-px w-full bg-white/5 my-2" />
                  <div className="flex justify-between text-xl font-black tracking-tighter">
                    <span className="first-letter:uppercase">to pay</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 bg-[#0c0c0f] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => setShowCheckout(true)}
              className="w-full h-16 bg-white text-black rounded-[1.5rem] flex items-center justify-between px-8 active:scale-[0.98] transition-all"
            >
              <span className="text-[15px] font-black tracking-tight first-letter:uppercase">proceed to pay</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black tracking-tighter">₹{total}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </div>
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutScreen 
            total={total}
            cartItems={cartItems} 
            user={user}
            onBack={() => setShowCheckout(false)}
            onSuccess={handleOrderSuccess}
            onSaveNewAddress={(newAddr) => {
              if (!user) return; 
              const currentAddresses = user.addresses || [];
              const updatedUser = { ...user, addresses: [newAddr, ...currentAddresses] };
              onUpdateUser(updatedUser);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-primary flex flex-col items-center justify-center text-black"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center mb-6"
            >
              <ShoppingBag size={40} className="text-primary" />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">order placed!</h2>
            <p className="font-bold text-sm mt-2 opacity-60 uppercase tracking-widest">preparing your bulk items</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartScreen;