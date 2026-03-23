import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay before switching to main app
          return 100;
        }
        return prev + 2;
      });
    }, 30); // Speed of the progress bar
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f11] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Text: Kilo + Gram */}
        <div className="flex text-5xl md:text-8xl font-black tracking-tighter mb-6">
          <motion.span
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white"
          >
            KILO
          </motion.span>
          <motion.span
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-primary"
          >
            GRAM
          </motion.span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-md">
          <motion.div
            className="h-full bg-primary shadow-[0_0_15px_rgba(255,153,193,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-4 text-xs font-medium tracking-[0.3em] text-white/40 uppercase"
        >
          
        </motion.p>
      </div>
    </div>
  );
}