import React from 'react';
import { ProductCategory } from '../../types';
import { Search, Flame, ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | 'ทั้งหมด';
  setSelectedCategory: (c: ProductCategory | 'ทั้งหมด') => void;
  onOpenAI: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAI,
}) => {
  const quickTags = [
    'เม็ดมะม่วงเผา',
    'ถั่วพิตาชิโอ',
    'ชาชัก 666',
    'ไมโลมาเลย์',
    'เกาลัดคั่ว',
    'บ๊วยซากุระ',
    'ชุดของฝาก',
  ];

  return (
    <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl overflow-hidden shadow-2xl mb-8 border border-amber-700/50">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>ของฝากขึ้นชื่ออันดับ 1 ตลาดกิมหยง หาดใหญ่</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight font-sans">
          ร้านของฝาก <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">สานะกิมหยง</span> หาดใหญ่
        </h1>
        <p className="text-sm sm:text-lg text-amber-100/90 max-w-2xl mx-auto mb-8 font-light">
          คัดสรรของฝากยอดนิยมส่งตรงจากตลาดกิมหยง เม็ดมะม่วงหิมพานต์เผาเตาถ่านโบราณ พิตาชิโอเกรดพรีเมียม ชาชักปักษ์ใต้แท้ และขนมนำเข้าจากมาเลเซีย
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-5">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาของฝาก เช่น เม็ดมะม่วงเผา, พิตาชิโอ, ชาชัก, ไมโลมาเลย์..."
              className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 rounded-2xl shadow-xl border-2 border-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 text-sm font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-24 text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1"
              >
                ล้าง
              </button>
            )}
            <button
              onClick={onOpenAI}
              className="absolute right-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ถาม AI</span>
            </button>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-amber-200/80 mr-1">ค้นหายอดฮิต:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 hover:text-white border border-white/10 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-amber-800/60 text-left">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">ของแท้ 100%</p>
              <p className="text-[11px] text-amber-200/70">คัดเกรดพรีเมียมกิมหยง</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">จัดส่งด่วนทั่วไทย</p>
              <p className="text-[11px] text-amber-200/70">ครบ 500.- ส่งฟรี</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">รับประกันความสด</p>
              <p className="text-[11px] text-amber-200/70">ใหม่ กรอบ ไม่เหม็นหืน</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">มีหน้าร้านจริง</p>
              <p className="text-[11px] text-amber-200/70">ตลาดกิมหยง ชั้น 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
