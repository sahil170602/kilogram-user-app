import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Bike, Phone, Clock, ShieldCheck, XCircle, PackageCheck, Navigation, ShoppingBag } from "lucide-react";
import { supabase } from "../lib/supabase"; // 🎯 Added Supabase import for fetching items

interface TrackingProps {
  order: any;
  onClose: () => void;
}

const OrderTrackingScreen = ({ order, onClose }: TrackingProps) => {
  // 🎯 State to hold items, falling back to empty array if missing
  const [itemsList, setItemsList] = useState<any[]>(order.order_items || order.items || []);

  // 🎯 Automatically fetch items if they weren't passed in the order object
  useEffect(() => {
    const fetchMissingItems = async () => {
      if (itemsList.length > 0) return; // Skip if we already have them

      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*, products(name)')
          .eq('order_id', order.id);

        if (data && !error) {
          setItemsList(data);
        }
      } catch (err) {
        console.error("Error fetching manifest items:", err);
      }
    };

    if (order?.id) fetchMissingItems();
  }, [order.id]);

  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const steps = [
    { label: 'Placed', status: 'order placed', icon: <Clock size={16}/> },
    { label: 'Rider', status: 'rider_assigned', icon: <Navigation size={16}/> },
    { label: 'Packed', status: 'order packed', icon: <ShieldCheck size={16}/> },
    { label: 'Transit', status: 'out_for_delivery', icon: <Bike size={16}/> },
    { label: 'Done', status: 'delivered', icon: <PackageCheck size={16}/> },
  ];

  const currentStepIdx = steps.findIndex(s => s.status === order.status);

  const getProgressWidth = () => {
    if (isCancelled || isDelivered) return "100%";
    const percentage = ((currentStepIdx + 1) / steps.length) * 100;
    return `${Math.max(percentage, 15)}%`;
  };

  const handleCallStore = () => {
    window.location.href = `tel:+917972506748`;
  };

  // 🎯 Dynamic calculations based on order data
  const deliveryFee = order.delivery_fee || 0;
  const riderTip = order.rider_tip || 0;
  
  // Calculate subtotal directly from items, or fallback to math
  const subtotal = itemsList.length > 0 
    ? itemsList.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    : Math.max(order.total_amount - deliveryFee - riderTip, 0);

  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-[#08080a] flex flex-col font-sans text-white lowercase"
    >
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-[#08080a]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-black tracking-tighter capitalize">Track Order</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-white/0 uppercase tracking-widest">#{order.id.toString().slice(-6)}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar pb-32">
        
        {/* Progress Bar Container */}
        <motion.div 
          layout
          className={`border rounded-[2.5rem] p-8 mb-8 transition-colors duration-500 ${isCancelled ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/10'}`}
        >
          <div className="flex justify-between mb-8 relative">
            {steps.map((step, idx) => {
              const isDone = currentStepIdx >= idx && !isCancelled;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-3 z-10">
                  <motion.div 
                    layout
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCancelled ? 'bg-red-500/10 text-red-500' : 
                      isDone ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,153,193,0.3)]' : 'bg-[#12121a] text-white/20 border border-white/5'
                    }`}
                  >
                    {isCancelled ? <XCircle size={14} /> : step.icon}
                  </motion.div>
                  <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter transition-colors duration-500 ${
                    isCancelled ? 'text-red-500' : isDone ? 'text-primary' : 'text-white/20'
                  }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
          
          <div className="h-1.5 w-full bg-[#12121a] rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className={`h-full ${isCancelled ? 'bg-red-500' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: getProgressWidth() }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </motion.div>

        {/* Dynamic Status Visual Box */}
        <motion.div 
          layout
          className={`h-48 sm:h-64 rounded-[2.5rem] mb-8 relative overflow-hidden flex flex-col items-center justify-center border transition-colors duration-500 ${isCancelled ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.03] border-white/10'}`}
        >
            <div className={`absolute inset-0 blur-3xl transition-colors duration-500 ${isCancelled ? 'bg-red-500/10' : 'bg-primary/5'}`} />
            
            <AnimatePresence mode="wait">
              {isCancelled ? (
                <motion.div key="cancelled" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <XCircle size={48} className="text-red-500 mb-4" />
                  <h3 className="font-black text-lg text-red-500 uppercase tracking-tighter">Order Cancelled</h3>
                  <p className="font-bold text-xs text-red-500/60 mt-2">Store declined your request.</p>
                </motion.div>
              ) : isDelivered ? (
                <motion.div key="delivered" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <PackageCheck size={48} className="text-primary mb-4" />
                  <h3 className="font-black text-lg text-white uppercase tracking-tighter mb-2">Order Delivered</h3>
                  <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-primary">Enjoy your meal</p>
                </motion.div>
              ) : (
                <motion.div key="active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  {order.status === 'order placed' ? (
                    <Clock size={48} className="text-primary animate-pulse mb-4 drop-shadow-[0_0_15px_rgba(255,153,193,0.5)]" />
                  ) : order.status === 'rider_assigned' ? (
                    <Navigation size={48} className="text-primary animate-pulse mb-4 drop-shadow-[0_0_15px_rgba(255,153,193,0.5)]" />
                  ) : order.status === 'order packed' ? (
                    <ShieldCheck size={48} className="text-primary mb-4 drop-shadow-[0_0_15px_rgba(255,153,193,0.5)]" />
                  ) : (
                    <Bike size={48} className="text-primary animate-bounce mb-4 drop-shadow-[0_0_15px_rgba(255,153,193,0.5)]" />
                  )}

                  <h3 className="font-black text-lg text-white uppercase tracking-tighter mb-2">
                    {order.status === 'order placed' ? 'Preparing your order' : 
                     order.status === 'rider_assigned' ? 'Rider Assigned' :
                     order.status === 'order packed' ? 'Order is packed' : 
                     'Out for delivery'}
                  </h3>
                  <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-primary">Live Sync Active</p>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>

        {/* 🎯 Real Order Summary */}
        <div className="space-y-4 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2 flex items-center gap-2">
            <ShoppingBag size={12} /> Bill Details
          </h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 space-y-4">
            
            <div className="space-y-3 pb-4 border-b border-white/5">
              {itemsList.length > 0 ? (
                itemsList.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/60">
                        {item.quantity}x
                      </span>
                      <span className="text-[20px] font-bold text-white/90 capitalize">
                        {item.product_name || item.products?.name || item.name || 'Unknown Item'}
                      </span>
                    </div>
                    <span className="text-[20px] font-mono text-white/80">₹{item.unit_price * item.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-2 opacity-50">
                   <Clock size={16} className="animate-spin mb-2" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Syncing Items...</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-white/60">
                <span className="text-[16px] font-bold capitalize tracking-wide">Subtotal</span>
                <span className="text-[16px] font-mono">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span className="text-[16px] font-bold capitalize tracking-wide">Delivery Fee</span>
                <span className="text-[16px] capitalize font-mono">{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span className="text-[16px] font-bold  capitalize tracking-widest">Rider Tip</span>
                <span className="text-[16px]  capitalize font-mono">{riderTip > 0 ? `₹${riderTip}` : 'Free'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-white">Total Pay</span>
              <span className="text-xl font-black text-primary italic tracking-tighter">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-4 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2 flex items-center gap-2">
             <MapPin size={12} /> Dropoff Location
          </h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 flex gap-4">
            <MapPin className="text-white/40 shrink-0" size={20} />
            <p className="text-xs font-bold leading-relaxed">{order.address}</p>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-8 bg-[#0c0c0f] border-t border-white/5 rounded-t-[3rem] mt-auto">
        <div className="flex items-center justify-between">
           <button onClick={handleCallStore} className="flex items-center gap-4 active:scale-95 transition-transform text-left">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,153,193,0.1)]">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase">Support</p>
                <p className="text-sm font-bold text-white">Call Store</p>
              </div>
           </button>
           <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase">Payment</p>
              <p className={`text-sm font-black transition-colors ${isCancelled ? 'text-white/40 line-through' : 'text-green-400'}`}>
                 {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTrackingScreen;