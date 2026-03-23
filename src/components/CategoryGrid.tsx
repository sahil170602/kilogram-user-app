import { ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  icon?: string;      // Fallback emoji
  image_url?: string; // Real uploaded image from Supabase
}

interface CategoryGridProps {
  categories: Category[];
  onSeeAll?: () => void;
  onCategoryClick?: (category: Category) => void;
  hideHeader?: boolean;
}

const CategoryGrid = ({ categories, onSeeAll, onCategoryClick, hideHeader }: CategoryGridProps) => {
  const displayData = hideHeader ? categories : (categories || []).slice(0, 8);

  return (
    <div className={hideHeader ? "px-6 py-4" : "px-6 mb-10"}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col">
            
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              top categories
            </h2>
          </div>
          
          {onSeeAll && (
            <button 
              onClick={onSeeAll} 
              className="flex items-center gap-1.5 text-white/30 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all group"
            >
              see all 
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {displayData.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => onCategoryClick && onCategoryClick(cat)}
            className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
          >
            {/* LARGE GLASS CONTAINER */}
            <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-[1rem] flex items-center justify-center overflow-hidden relative shadow-xl group-hover:border-white/20 group-hover:bg-white/[0.05] transition-all duration-500">
              
              {/* IMAGE SET TO FULL SIZE */}
              {cat.image_url ? (
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  className="w-18 h-18 object-cover group-hover:scale-110 rounded-[0.8rem] transition-transform duration-700 ease-out"
                />
              ) : (
                <span className="text-4xl group-hover:scale-110 transition-transform duration-500">
                  {cat.icon || "📦"}
                </span>
              )}

              {/* OVERLAY GRADIENT FOR BETTER TEXT CONTRAST */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* GLASS REFLECTION */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none" />
            </div>

            {/* CATEGORY NAME */}
            <span className="text-[14px] font-black text-center truncate w-full capitalize text-primary group-hover:text-primary transition-colors tracking-tight">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;