import { motion, AnimatePresence } from "framer-motion";
import { Bike, Timer, ChevronRight } from "lucide-react";

export const LiveOrderCard = ({ order, onClick }: { order: any; onClick: () => void }) => {
  // Only show if there is an active order that isn't delivered or cancelled
  if (!order || order.status === 'delivered' || order.status === 'cancelled') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        /* 🎯 Floating position adjusted to sit above the bottom nav */
        className="fixed bottom-28 left-4 right-4 z-[100] bg-primary p-4 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_40px_rgba(255,153,193,0.4)] cursor-pointer border-4 border-black/10"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl">
              <Bike size={28} />
            </div>
            {/* Pulsing indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-black"></span>
            </span>
          </div>

          <div className="lowercase">
            <h4 className="text-black font-black text-sm uppercase leading-none mb-1.5 tracking-tighter">
              {order.status === 'order placed' ? 'preparing items' : order.status}
            </h4>
            <div className="flex items-center gap-1.5 text-black/50">
              <Timer size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                ETA: 12-15 MINS
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/10 p-2 rounded-full">
          <ChevronRight size={20} className="text-black" strokeWidth={4} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};