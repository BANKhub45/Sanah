import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Store, 
  ShoppingBag, 
  Truck, 
  Sparkles, 
  LayoutDashboard, 
  CreditCard,
  MapPin,
  Flame,
  BadgeAlert
} from 'lucide-react';
import { formatTHB } from '../utils/formatters';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenTracking }) => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    cartTotal, 
    orders, 
    setIsChatOpen,
    settings 
  } = useStore();

  // Count pending slip verifications
  const pendingSlipCount = orders.filter(
    (o) => o.channel === 'ONLINE' && o.orderStatus === 'PENDING_VERIFY'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm no-print">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-amber-200 shrink-0" />
        <span>ของฝากแท้จากตลาดกิมหยง หาดใหญ่ จัดส่งด่วนทั่วไทย | สั่งซื้อครบ {settings.freeShippingThreshold}.- ส่งฟรีทั่วประเทศ!</span>
        <span className="hidden md:inline-block bg-amber-800/60 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-200">
          มีหน้าร้านจริง
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2 md:gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentView('STOREFRONT')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight font-sans group-hover:text-amber-700 transition-colors">
                  {settings.storeName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                  หาดใหญ่
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                ของฝากตลาดกิมหยง เม็ดมะม่วงหิมพานต์เผา ชาชัก ขนมนำเข้า
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (Middle) */}
          <nav className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setCurrentView('STOREFRONT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentView === 'STOREFRONT'
                  ? 'bg-white text-amber-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>สั่งซื้อออนไลน์</span>
            </button>

            <button
              onClick={() => setCurrentView('POS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentView === 'POS'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">แคชเชียร์</span>
              <span>POS หน้าร้าน</span>
            </button>

            <button
              onClick={() => setCurrentView('ADMIN')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentView === 'ADMIN'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>จัดการร้านค้า</span>
              {pendingSlipCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[11px] font-extrabold rounded-full animate-pulse shadow-sm">
                  {pendingSlipCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Tracking Button */}
            <button
              onClick={onOpenTracking}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-800 rounded-xl transition-colors shadow-sm"
              title="เช็คสถานะพัสดุและออเดอร์"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>เช็คพัสดุ</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200/80 hover:from-amber-200 hover:to-amber-300 border border-amber-300 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-700 animate-spin-slow" />
              <span className="hidden sm:inline">ถาม AI</span>
              <span>น้องสานะ</span>
            </button>

            {/* Cart Button (Always visible) */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-amber-100 font-medium">ตะกร้าสินค้า</span>
                <span className="text-xs font-bold">{formatTHB(cartTotal)}</span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
