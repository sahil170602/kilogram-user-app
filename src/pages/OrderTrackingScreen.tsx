import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Bike, Phone, Clock, ShieldCheck, XCircle } from "lucide-react";

interface TrackingProps {
  order: any;
  onClose: () => void;
}

const OrderTrackingScreen = ({ order, onClose }: TrackingProps) => {
  if (!order) return null;

  const isCancelled = order.status === 'cancelled';

  const steps = [
    { label: 'Placed', status: 'order placed', icon: <Clock size={16}/> },
    { label: 'Packed', status: 'order packed', icon: <ShieldCheck size={16}/> },
    { label: 'Dispatched', status: 'order dispatched', icon: <Bike size={16}/> },
  ];

  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-[#08080a] flex flex-col font-sans text-white lowercase"
    >
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5 bg-[#08080a]">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black tracking-tighter capitalize">Track Order</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
        
        {/* Progress Bar Container */}
        <motion.div 
          layout
          className={`border rounded-[2.5rem] p-8 mb-8 transition-colors duration-500 ${isCancelled ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/10'}`}
        >
          <div className="flex justify-between mb-8 relative">
            {steps.map((step, idx) => {
              const isDone = steps.findIndex(s => s.status === order.status) >= idx && !isCancelled;
              return (
                <div key={idx} className="flex flex-col items-center gap-3 z-10">
                  <motion.div 
                    layout
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCancelled ? 'bg-red-500/10 text-red-500' : 
                      isDone ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,153,193,0.3)]' : 'bg-[#12121a] text-white/20 border border-white/5'
                    }`}
                  >
                    {isCancelled ? <XCircle size={16} /> : step.icon}
                  </motion.div>
                  <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${
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
              animate={{ 
                width: isCancelled ? '100%' : 
                       order.status === 'order placed' ? '15%' : 
                       order.status === 'order packed' ? '50%' : '100%' 
              }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </motion.div>

        {/* Dynamic Status Visual Box */}
        <motion.div 
          layout
          className={`h-64 rounded-[2.5rem] mb-8 relative overflow-hidden flex flex-col items-center justify-center border transition-colors duration-500 ${isCancelled ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.03] border-white/10'}`}
        >
            <div className={`absolute inset-0 blur-3xl transition-colors duration-500 ${isCancelled ? 'bg-red-500/10' : 'bg-primary/5'}`} />
            
            <AnimatePresence mode="wait">
              {isCancelled ? (
                <motion.div key="cancelled" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <XCircle size={56} className="text-red-500 mb-4" />
                  <h3 className="font-black text-lg text-red-500 uppercase tracking-tighter">Order Cancelled</h3>
                  <p className="font-bold text-xs text-red-500/60 mt-2">Store declined your request.</p>
                </motion.div>
              ) : (
                <motion.div key="active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <Bike size={56} className="text-primary animate-bounce mb-4 drop-shadow-[0_0_15px_rgba(255,153,193,0.5)]" />
                  <h3 className="font-black text-lg text-white uppercase tracking-tighter mb-2">
                    {order.status === 'order placed' ? 'Preparing your items' : 
                     order.status === 'order packed' ? 'Order is packed' : 'Out for delivery'}
                  </h3>
                  <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-primary">Live Sync Active</p>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>

        {/* Delivery Details */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Delivery Address</h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 flex gap-4">
            <MapPin className="text-white/40 shrink-0" size={20} />
            <p className="text-xs font-bold leading-relaxed">{order.address}</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-[#0c0c0f] border-t border-white/5 rounded-t-[3rem]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 border border-white/10">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase">Support</p>
                <p className="text-sm font-bold">Contact Store</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase">Bill Total</p>
              <p className={`text-xl font-black italic transition-colors ${isCancelled ? 'text-white/40 line-through' : 'text-primary'}`}>₹{order.total_amount}</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTrackingScreen;