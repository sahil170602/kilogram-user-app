import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCartProps {
  cartCount: number;
  onClick: () => void;
  bottomPosition?: string; 
}

const FloatingCart = ({ cartCount, onClick, bottomPosition = "bottom-10" }: FloatingCartProps) => {
  return (
    <AnimatePresence>
      {/* The cart only shows if count > 0. 
          When onClearCart() is called in the parent, cartCount becomes 0,
          triggering the 'exit' animation below automatically.
      */}
      {cartCount > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className={`fixed right-6 z-[100] w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/20 ${bottomPosition}`}
        >
          {/* Continuous Pulse Animation */}
          <motion.div
            animate={{
              scale: [1, 1.6],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 bg-primary rounded-full"
          />

          {/* Static Button Content */}
          <div className="relative z-10">
            <ShoppingBag size={28} strokeWidth={2.5} />
            
            {/* Count Badge */}
            <motion.span 
              key={cartCount} 
              initial={{ scale: 1.5 }} 
              animate={{ scale: 1 }} 
              className="absolute -top-3 -right-3 w-6 h-6 bg-black text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-primary shadow-sm"
            >
              {cartCount}
            </motion.span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCart;