import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatTHB } from '../../utils/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, settings, clearCart } = useStore();

  if (!isOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100));
  const shippingFee = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : settings.defaultShippingFee;
  const grandTotal = cartTotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">ตะกร้าสินค้าของคุณ</h3>
                <span className="text-xs text-slate-500">{cart.length} รายการ</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
                >
                  ล้างตะกร้า
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Shipping Banner */}
          {cart.length > 0 && (
            <div className="bg-amber-50 px-5 py-3 border-b border-amber-200/60">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-700" />
                  {remainingForFreeShipping === 0
                    ? '🎉 คุณได้รับสิทธิ์จัดส่งฟรีทั่วประเทศแล้ว!'
                    : `สั่งเพิ่มอีก ${formatTHB(remainingForFreeShipping)} เพื่อส่งฟรี!`}
                </span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700 text-base">ตะกร้าของคุณยังว่างอยู่</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  เลือกของฝากหาดใหญ่รสเด็ด เม็ดมะม่วงหิมพานต์เผา ชาชัก หรือผลไม้อบแห้ง ใส่ตะกร้าได้เลยค่ะ
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
                >
                  เลือกดูของฝาก
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-3.5 flex gap-3 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">
                      {item.product.unit} | ชิ้นละ {formatTHB(item.product.sellPrice)}
                    </span>
                    <div className="font-extrabold text-amber-800 text-sm mt-1">
                      {formatTHB(item.product.sellPrice * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-semibold text-slate-800">{formatTHB(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {shippingFee === 0 ? 'ส่งฟรี (โปรโมชั่น)' : formatTHB(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-amber-800 font-extrabold">{formatTHB(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span>ชำระเงินผ่าน PromptPay QR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
