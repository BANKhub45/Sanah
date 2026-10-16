/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/storefront/HeroBanner';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';
import { PosTerminal } from './components/admin/PosTerminal';
import { AdminLayout } from './components/admin/AdminLayout';
import { ShippingLabelModal } from './components/admin/ShippingLabelModal';
import { ReceiptModal } from './components/admin/ReceiptModal';
import { GeminiChatModal } from './components/chat/GeminiChatModal';
import { ToastContainer } from './components/common/Toast';
import { NotificationAlerts } from './components/common/NotificationAlerts';
import { Product, ProductCategory } from './types';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Truck, 
  ShieldCheck, 
  Store, 
  Heart,
  MessageSquare
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    settings, 
    isChatOpen, 
    setIsChatOpen,
    trackingSearchCode,
    setTrackingSearchCode 
  } = useStore();

  // Storefront search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ทั้งหมด'>('ทั้งหมด');

  // Modal visibility states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  const handleOpenTrackingWithCode = (code: string) => {
    setTrackingSearchCode(code);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar with Mode Switcher & Cart */}
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Storefront (Online Shop for Customers) */}
        {currentView === 'STOREFRONT' && (
          <div className="space-y-6">
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenAI={() => setIsChatOpen(true)}
            />

            <ProductGrid
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={(p) => setSelectedDetailProduct(p)}
            />
          </div>
        )}

        {/* VIEW 2: POS Storefront Terminal (Cashier & Instant Stock Deduction) */}
        {currentView === 'POS' && <PosTerminal />}

        {/* VIEW 3: Backoffice Management (Orders, Stock, Costs, Sales Report) */}
        {currentView === 'ADMIN' && <AdminLayout />}
      </main>

      {/* Footer (Store info & Kim Yong Market background) */}
      <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Store Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="text-white font-black text-base">{settings.storeName}</h4>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">
                  {settings.branchName}
                </span>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed text-xs">
                ร้านของฝากชื่อดังใจกลางตลาดกิมหยง อำเภอหาดใหญ่ จังหวัดสงขลา คัดสรรของฝากคุณภาพพรีเมียม ถั่วพิตาชิโอ เม็ดมะม่วงเผาเตาถ่านโบราณ ชาชักปักษ์ใต้แท้ และขนมนำเข้าจากมาเลเซีย พร้อมส่งตรงความอร่อยถึงหน้าบ้านคุณทั่วไทย
              </p>
              <div className="text-slate-400 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>โทร: {settings.phone} | LINE: {settings.lineId}</span>
                </p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">ระบบร้านค้า</h5>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => setCurrentView('STOREFRONT')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    • เลือกซื้อของฝากออนไลน์
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsTrackingOpen(true)}
                    className="hover:text-amber-400 transition-colors"
                  >
                    • เช็คสถานะพัสดุ & คำสั่งซื้อ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('POS')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    • ระบบขายหน้าร้าน POS (ตัดสต็อกทันที)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('ADMIN')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    • ระบบจัดการหลังร้าน & สรุปยอดขาย
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Payment & Security */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">การชำระเงิน & จัดส่ง</h5>
              <div className="space-y-2 text-slate-400 text-xs">
                <p>✓ รองรับ PromptPay QR ทุกธนาคาร</p>
                <p>✓ พนักงานตรวจสลิปและยืนยันออเดอร์ทันที</p>
                <p>✓ แจ้งเตือนเลขพัสดุอัตโนมัติ</p>
                <p>✓ สั่งครบ {settings.freeShippingThreshold}.- จัดส่งฟรีทั่วไทย</p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">Flash Express</span>
                  <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">Kerry</span>
                  <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">J&T</span>
                  <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">EMS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} {settings.storeName} ({settings.branchName}). สงวนลิขสิทธิ์ทั้งหมด</span>
            <span className="flex items-center gap-1">
              สร้างด้วยความภาคภูมิใจในของดีเมืองหาดใหญ่ <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </span>
          </div>
        </div>
      </footer>

      {/* Floating AI Button (Bottom Right) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-amber-600/40 border border-amber-400/40 flex items-center gap-2 group transition-all hover:scale-105 active:scale-95 no-print"
        title="คุยกับน้องสานะ ผู้ช่วยอัจฉริยะ"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-200 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-amber-700 animate-ping"></span>
        </div>
        <span className="hidden sm:inline font-bold text-xs">
          ถามน้องสานะ (AI ของฝาก)
        </span>
      </button>

      {/* Modals Container */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenTrackingWithCode={handleOpenTrackingWithCode}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialCode={trackingSearchCode}
      />

      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onOpenAI={() => setIsChatOpen(true)}
      />

      <ShippingLabelModal />
      <ReceiptModal />
      <GeminiChatModal />

      {/* Global Toast & Customer Alert banners */}
      <ToastContainer />
      <NotificationAlerts />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
