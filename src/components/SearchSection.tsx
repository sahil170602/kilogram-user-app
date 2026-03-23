import { useRef, useState } from "react";
import { Search, Mic, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchSectionProps {
  query: string;
  setQuery: (q: string) => void;
  isFocused: boolean;
  setIsFocused: (f: boolean) => void;
  hint: string;
  isListening: boolean;
  onVoice: () => void;
  onCamera: () => void;
}

const SearchSection = ({ query, setQuery, isFocused, setIsFocused, hint, isListening, onVoice, onCamera }: SearchSectionProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleCameraClick = () => {
    onCamera();
    cameraInputRef.current?.click();
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Show scanning UI
      setIsScanning(true);
      setQuery("Scanning...");

      // 2. SIMULATE AI VISION & OCR (Replace with Google Cloud Vision / Tesseract API later)
      setTimeout(() => {
        setIsScanning(false);
        
        // Mock logic: 70% chance to find a store item, 30% chance to find random text
        const mockExtractedWords = ["Milk", "Rice", "Oil", "Bread", "Laptop", "Table", "Shoes"];
        const randomWord = mockExtractedWords[Math.floor(Math.random() * mockExtractedWords.length)];
        
        // Put the extracted text into the search bar!
        setQuery(randomWord);
      }, 2000); // 2 seconds of fake processing time
    }
  };

  return (
    <div className="px-6 mt-4 relative z-40">
      {/* HIDDEN NATIVE CAMERA INPUT */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef}
        onChange={handleImageCapture}
        className="hidden"
      />

      <div className="relative group">
        <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 transition-colors ${query ? 'text-primary' : 'text-primary'}`} />
        
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)} 
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? "" : ""}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-xs font-bold text-white outline-none focus:border-primary/40 transition-all"
        />

        {!isFocused && !query && (
          <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <span className="text-white/80 text-[13px] font-semibold tracking-wide">Search...</span>
            <div className="h-4 overflow-hidden relative w-40">
              <AnimatePresence mode="wait">
                <motion.span key={hint} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} className="absolute left-0 text-white/80 text-[12px] font-bold">"{hint}"</motion.span>
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button onClick={onVoice} className={`w-9 h-9 flex items-center justify-center rounded-xl ${isListening ? 'bg-primary text-black animate-pulse' : 'bg-white/5 text-primary'}`}>
            <Mic size={16} />
          </button>
          
          <button onClick={handleCameraClick} disabled={isScanning} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-primary active:scale-90 transition-all">
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;