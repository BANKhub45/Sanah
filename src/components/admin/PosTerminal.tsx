import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { formatTHB } from '../../utils/formatters';
import { generatePromptPayQRCode } from '../../utils/promptpay';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Banknote, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  User,
  Zap,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { 
    products, 
    createPosOrder, 
    settings, 
    setSelectedOrderForReceipt, 
    addToast 
  } = useStore();

  // POS active register cart
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ทั้งหมด'>('ทั้งหมด');
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('ลูกค้าหน้าร้าน (Walk-in)');

  // Checkout Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY_QR' | 'CREDIT_CARD'>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [posQrUrl, setPosQrUrl] = useState<string>('');

  const categories: (ProductCategory | 'ทั้งหมด')[] = [
    'ทั้งหมด',
    'ถั่วและธัญพืช',
    'ขนมนำเข้าและมาเลเซีย',
    'ชา กาแฟ และเครื่องดื่ม',
    'ผลไม้อบแห้ง',
    'ของแห้งและของทานเล่น',
    'ชุดของฝากจัดเซ็ต',
  ];

  // Filter products for POS
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    const cleanQ = searchQuery.toLowerCase().trim();
    const matchQuery =
      cleanQ === '' ||
      p.name.toLowerCase().includes(cleanQ) ||
      p.sku.toLowerCase().includes(cleanQ);
    return matchCat && matchQuery;
  });

  const addToPosCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('error', 'สินค้าหมด', `${product.name} ในสต็อกหมดแล้ว`);
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addToast('error', 'สต็อกไม่พอ', `มีสินค้าในสต็อกเพียง ${product.stock} ชิ้น`);
          return prev;
        }
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setPosCart((prev) => prev.filter((it) => it.product.id !== productId));
      return;
    }
    const currentProd = products.find((p) => p.id === productId);
    if (currentProd && quantity > currentProd.stock) {
      addToast('error', 'สต็อกไม่พอ', `มีสินค้าเพียง ${currentProd.stock} ชิ้น`);
      return;
    }
    setPosCart((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity } : it))
    );
  };

  const clearPosCart = () => {
    setPosCart([]);
    setDiscount(0);
  };

  // Calculations
  const subtotal = posCart.reduce((sum, it) => sum + it.product.sellPrice * it.quantity, 0);
  const netTotal = Math.max(0, subtotal - discount);
  const cashChange = Math.max(0, cashReceived - netTotal);

  const handleOpenPayment = () => {
    if (posCart.length === 0) {
      addToast('error', 'ยังไม่มีรายการสินค้า', 'กรุณาเลือกสินค้าลงในบิลก่อน');
      return;
    }
    setCashReceived(netTotal); // Default exact amount
    // Generate QR for counter PromptPay
    generatePromptPayQRCode(settings.promptpayId, netTotal).then((url) => {
      setPosQrUrl(url);
    });
    setIsPayModalOpen(true);
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === 'CASH' && cashReceived < netTotal) {
      addToast('error', 'ยอดเงินสดไม่พอ', `ยอดชำระสุทธิ ${formatTHB(netTotal)}`);
      return;
    }

    // Process instant real-time stock deduction
    const order = createPosOrder({
      items: posCart,
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? cashReceived : netTotal,
      discount,
      customerName,
    });

    setIsPayModalOpen(false);
    clearPosCart();

    // Offer to print receipt
    setSelectedOrderForReceipt(order);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
      {/* LEFT: Product Catalog & Quick Tap Grid (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
        {/* Header & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-600 text-white rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  ระบบขายหน้าร้าน POS (ตลาดกิมหยง)
                </h2>
                <span className="text-xs text-slate-500">
                  คีย์รายการขายแบบเรียลไทม์เพื่อตัดสต็อกสินค้าทันที
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ระบบสต็อกออนไลน์
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด่วน เช่น เม็ดมะม่วง, ชาชัก, รหัส SKU..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid for Cashier */}
        <div className="flex-1 overflow-y-auto max-h-[600px] pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const cartItem = posCart.find((it) => it.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToPosCart(p)}
                  className={`relative p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isOutOfStock
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200/90 hover:border-amber-500 hover:shadow-md cursor-pointer active:scale-98'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      {cartItem && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                          {cartItem.quantity}
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {p.sku}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-amber-900">
                      {formatTHB(p.sellPrice)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isOutOfStock
                        ? 'bg-rose-100 text-rose-700'
                        : p.stock <= p.minStock
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      สต็อก: {p.stock}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Active Cashier Register & Checkout Panel (4-5 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 flex flex-col justify-between h-full">
        <div>
          {/* Register Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-slate-800 text-base">รายการบิลขาย</h3>
            </div>
            {posCart.length > 0 && (
              <button
                onClick={clearPosCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold"
              >
                ล้างบิล
              </button>
            )}
          </div>

          {/* Customer Type Quick Selector */}
          <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-xs">
            <User className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ระบุชื่อลูกค้า เช่น ลูกค้าหน้าร้าน / นักท่องเที่ยว"
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none w-full"
            />
          </div>

          {/* Register Items List */}
          <div className="mt-4 divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
            {posCart.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">ยังไม่มีรายการในบิล</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  แตะเลือกของฝากจากตารางด้านซ้ายเพื่อคิดเงิน
                </p>
              </div>
            ) : (
              posCart.map((it) => (
                <div key={it.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 truncate">{it.product.name}</h5>
                    <span className="text-[11px] text-slate-400">
                      @{formatTHB(it.product.sellPrice)}
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                    <button
                      onClick={() => updateQuantity(it.product.id, it.quantity - 1)}
                      className="w-5 h-5 rounded bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-slate-900">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(it.product.id, it.quantity + 1)}
                      className="w-5 h-5 rounded bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono font-bold text-slate-900 w-16 text-right">
                    {formatTHB(it.product.sellPrice * it.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Bill Summary & Pay Button */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>ยอดรวม ({posCart.reduce((s, it) => s + it.quantity, 0)} ชิ้น)</span>
              <span className="font-bold text-slate-800 font-mono">{formatTHB(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>ส่วนลดหน้าร้าน (บาท)</span>
              <input
                type="number"
                min={0}
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-20 px-2 py-0.5 text-right border border-slate-200 rounded font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>ยอดสุทธิที่ต้องชำระ</span>
              <span className="text-xl text-amber-800 font-black font-mono">
                {formatTHB(netTotal)}
              </span>
            </div>
          </div>

          <button
            disabled={posCart.length === 0}
            onClick={handleOpenPayment}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              posCart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/25 active:scale-98'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>ชำระเงิน & ตัดสต็อกทันที ({formatTHB(netTotal)})</span>
          </button>
        </div>
      </div>

      {/* MODAL: POS Quick Payment (เงินสด / QR หน้าร้าน) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">ชำระเงินหน้าร้าน</h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-600" />
                  <span>เงินสด</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PROMPTPAY_QR')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'PROMPTPAY_QR'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-600" />
                  <span>สแกน QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>บัตรเครดิต</span>
                </button>
              </div>

              {/* Amount to Pay */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold">ยอดที่ต้องชำระ</span>
                <div className="text-2xl font-black text-amber-900 font-mono">
                  {formatTHB(netTotal)}
                </div>
              </div>

              {/* Cash Denominations and Change */}
              {paymentMethod === 'CASH' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      เงินสดที่รับมา (บาท)
                    </label>
                    <input
                      type="number"
                      value={cashReceived === 0 ? '' : cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      placeholder="เช่น 500 หรือ 1000"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-base font-black text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Fast Bills Buttons */}
                  <div className="flex gap-1.5">
                    {[netTotal, 100, 500, 1000].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashReceived(amt)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors"
                      >
                        {idx === 0 ? 'พอดี' : `${amt}.-`}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculator */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-900">
                    <span className="font-bold">เงินทอนลูกค้า:</span>
                    <span className="text-xl font-black font-mono">
                      {formatTHB(cashChange)}
                    </span>
                  </div>
                </div>
              )}

              {/* QR Counter Display */}
              {paymentMethod === 'PROMPTPAY_QR' && (
                <div className="text-center p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-900 block mb-1">
                    ให้ลูกค้าสแกน PromptPay หน้าร้าน
                  </span>
                  {posQrUrl ? (
                    <img
                      src={posQrUrl}
                      alt="PromptPay QR"
                      className="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-xs"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center">
                      <QrCode className="w-10 h-10 animate-spin text-blue-700" />
                    </div>
                  )}
                  <span className="text-[11px] text-blue-700 block mt-1 font-mono">
                    {settings.promptpayName} ({settings.promptpayId})
                  </span>
                </div>
              )}

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-600">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="font-bold">รูดหรือแตะบัตรผ่านเครื่อง EDC หน้าร้าน</p>
                  <p className="text-[11px] text-slate-400">เมื่อทำรายการสำเร็จ ให้กดยืนยันการตัดสต็อก</p>
                </div>
              )}

              {/* Complete Order Button */}
              <button
                type="button"
                onClick={handleCompleteOrder}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>ยืนยันการขาย & ตัดสต็อกทันที</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
