import { Home, LayoutGrid, Clock, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const TABS = [
    { id: "home", icon: <Home size={22} />, label: "Home" },
    { id: "browse", icon: <LayoutGrid size={22} />, label: "Browse" },
    { id: "orders", icon: <Clock size={22} />, label: "Orders" },
    { id: "profile", icon: <User size={22} />, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-8 left-8 right-8 h-16 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-4 z-50">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${
            activeTab === tab.id ? 'text-primary' : 'text-white/20 hover:text-white/40'
          }`}
        >
          {tab.icon}
          
          {/* Active Indicator Dot */}
          {activeTab === tab.id && (
            <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;