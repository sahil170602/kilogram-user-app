import { useState, useEffect } from "react";
import { MapPin, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

interface HeaderProps {
  userId?: string;
  userName?: string;
  onProfileClick: () => void;
  onLikedClick: () => void;
}

const Header = ({ userId, userName = "user", onProfileClick, onLikedClick }: HeaderProps) => {
  const [dbAddress, setDbAddress] = useState<string>("securing gps...");
  const userInitial = userName?.trim()?.charAt(0)?.toLowerCase() || "u";

  useEffect(() => {
    const fetchLastAddress = async () => {
      // 🚀 IF USERID IS MISSING, WE CAN'T FETCH
      if (!userId) {
        console.log("Header waiting for userId...");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("last_address")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.last_address) {
          console.log("Header Address Found:", data.last_address);
          setDbAddress(data.last_address);
        } else {
          setDbAddress("Add Address");
        }
      } catch (err) {
        console.error("Header Fetch Error:", err);
      }
    };

    fetchLastAddress();

    // REALTIME SYNC
    const channel = supabase
      .channel(`header-address-${userId}`)
      .on("postgres_changes", { 
        event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` 
      }, (payload) => {
        if (payload.new?.last_address) setDbAddress(payload.new.last_address);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]); // 🎯 Re-runs as soon as userId is found

  return (
    <header className="px-6 pt-10 pb-4 sticky top-0 bg-[#08080a]/90 backdrop-blur-xl z-[60] border-b border-white/5">
      <div className="flex justify-between items-center">
        <div className="flex flex-col max-w-[70%]">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <div className="relative">
              <MapPin size={12} fill="currentColor" />
              <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">deliver to</span>
          </div>
          <h3 className="text-[13px] font-black text-white tracking-tight leading-tight line-clamp-1 truncate">
            {dbAddress}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLikedClick} className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary active:scale-90"><Heart size={18} strokeWidth={2.5} /></button>
          <button onClick={onProfileClick} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black uppercase">{userInitial}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;