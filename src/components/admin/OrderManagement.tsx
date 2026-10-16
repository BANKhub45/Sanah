import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, CourierType } from '../../types';
import { formatTHB, formatThaiDate } from '../../utils/formatters';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Printer, 
  Truck, 
  AlertCircle, 
  Clock, 
  Search, 
  Copy, 
  ShieldCheck,
  Send,
  Package,
  X,
  Sparkles
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { 
    orders, 
    verifyOrderPayment, 
    shipOrder, 
    updateOrderStatus, 
    setSelectedOrderForLabel,
    addToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_VERIFY' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('PENDING_VERIFY');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<Order | null>(null);
  const [shipCourier, setShipCourier] = useState<CourierType>('Flash Express');
  const [shipTrackingNumber, setShipTrackingNumber] = useState('');

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Channel / Status filter
    const matchTab =
      activeTab === 'ALL' ||
      (activeTab === 'PENDING_VERIFY' && o.orderStatus === 'PENDING_VERIFY') ||
      (activeTab === 'PROCESSING' && o.orderStatus === 'PROCESSING') ||
      (activeTab === 'SHIPPED' && o.orderStatus === 'SHIPPED') ||
      (activeTab === 'DELIVERED' && o.orderStatus === 'DELIVERED');

    const cleanQ = searchQuery.toLowerCase().trim();
    const matchQuery =
      cleanQ === '' ||
      o.id.toLowerCase().includes(cleanQ) ||
      o.customerName.toLowerCase().includes(cleanQ) ||
      o.customerPhone.includes(cleanQ) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(cleanQ));

    return matchTab && matchQuery;
  });

  const pendingCount = orders.filter((o) => o.channel === 'ONLINE' && o.orderStatus === 'PENDING_VERIFY').length;
  const processingCount = orders.filter((o) => o.orderStatus === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'SHIPPED').length;

  const handleOpenShipModal = (order: Order) => {
    setSelectedOrderForShip(order);
    setShipCourier(order.courier || 'Flash Express');
    // Auto populate tracking number format
    const prefix = order.courier === 'ไปรษณีย์ไทย EMS' ? 'ED' : 'TH';
    const rand = Math.floor(1000000000 + Math.random() * 9000000000);
    setShipTrackingNumber(order.trackingNumber || `${prefix}${rand}`);
  };

  const handleConfirmShip = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderForShip) {
      shipOrder(selectedOrderForShip.id, shipCourier, shipTrackingNumber);
      setSelectedOrderForShip(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ระบบจัดการคำสั่งซื้อ & ตรวจสอบการชำระเงิน
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบสลิป PromptPay ยืนยันคำสั่งซื้อ ออกเลขพัสดุ แจ้งเตือนลูกค้า และพิมพ์ใบปะหน้าพัสดุ
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามรหัส, เบอร์โทร, ชื่อ..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('PENDING_VERIFY')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'PENDING_VERIFY'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-300" />
          <span>รอตรวจสลิป</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[11px] font-black rounded-full animate-pulse ml-1">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PROCESSING')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'PROCESSING'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>กำลังเตรียมจัดส่ง (แพ็ค)</span>
          {processingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-800 text-white text-[11px] font-black rounded-full ml-1">
              {processingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SHIPPED')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'SHIPPED'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>จัดส่งแล้ว</span>
          {shippedCount > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-800 text-white text-[11px] font-black rounded-full ml-1">
              {shippedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'DELIVERED'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>สำเร็จแล้ว</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ทั้งหมด ({orders.length})
        </button>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">ไม่มีรายการคำสั่งซื้อในสถานะนี้</p>
            <p className="text-xs text-slate-400 mt-0.5">คำสั่งซื้อใหม่จะปรากฏที่นี่ทันทีที่มีลูกค้าสั่งซื้อ</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOnline = order.channel === 'ONLINE';
            const isPendingVerify = order.orderStatus === 'PENDING_VERIFY';
            const isProcessing = order.orderStatus === 'PROCESSING';
            const isShipped = order.orderStatus === 'SHIPPED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Order Info & Items */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-base">
                      {order.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      isOnline ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isOnline ? 'คำสั่งซื้อออนไลน์' : 'หน้าร้าน POS'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatThaiDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>
                      ผู้รับ: <strong className="text-slate-800">{order.customerName}</strong>
                      {order.customerPhone !== '-' && ` (${order.customerPhone})`}
                    </div>
                    {order.customerAddress && (
                      <p className="text-slate-500 line-clamp-1">ที่อยู่: {order.customerAddress}</p>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                    {order.items.map((it, idx) => (
                      <span key={idx} className="font-medium">
                        • {it.productName} <strong className="text-amber-900">×{it.quantity}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Tracking info if shipped */}
                  {order.trackingNumber && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                      <Truck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>ขนส่ง: <strong>{order.courier}</strong></span>
                      <span>|</span>
                      <span>เลขพัสดุ: <strong className="font-mono">{order.trackingNumber}</strong></span>
                    </div>
                  )}
                </div>

                {/* Middle: Amount & Slip thumbnail */}
                <div className="flex items-center gap-4 shrink-0 lg:border-l lg:border-r border-slate-100 lg:px-6">
                  {/* Slip Preview button if attached */}
                  {order.slipImage ? (
                    <div
                      onClick={() => setSelectedOrderForSlip(order)}
                      className="cursor-pointer group text-center"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-300 group-hover:border-purple-600 transition-colors bg-slate-100 shadow-xs">
                        <img
                          src={order.slipImage}
                          alt="Slip"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="text-[10px] text-purple-700 font-bold block mt-1">
                        ดูสลิปโอนเงิน
                      </span>
                    </div>
                  ) : null}

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">ยอดชำระสุทธิ</span>
                    <div className="text-xl font-black text-amber-900 font-mono">
                      {formatTHB(order.netAmount)}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      กำไร: +{formatTHB(order.profit)}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {/* Step 1: Verify Slip Button */}
                  {isPendingVerify && (
                    <button
                      onClick={() => setSelectedOrderForSlip(order)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>ตรวจสอบสลิป & ยืนยันยอด</span>
                    </button>
                  )}

                  {/* Step 2: Print Shipping Label Button */}
                  {(isProcessing || isShipped) && isOnline && (
                    <button
                      onClick={() => setSelectedOrderForLabel(order)}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      title="พิมพ์ใบปะหน้าพัสดุ (100x150 mm หรือ A4)"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>พิมพ์ใบปะหน้าพัสดุ</span>
                    </button>
                  )}

                  {/* Step 3: Fulfill Shipping & Notify Button */}
                  {isProcessing && isOnline && (
                    <button
                      onClick={() => handleOpenShipModal(order)}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Truck className="w-4 h-4" />
                      <span>จัดส่ง & ส่งเลขพัสดุอัตโนมัติ</span>
                    </button>
                  )}

                  {isShipped && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ทำเครื่องหมายว่าส่งสำเร็จ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Verify Slip (ตรวจสอบยอดเงิน และสลิป) */}
      {selectedOrderForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    ตรวจสอบสลิปการชำระเงิน
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedOrderForSlip.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForSlip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              {/* Slip Image Display */}
              <div className="bg-slate-100 rounded-2xl p-2 max-h-72 overflow-hidden flex items-center justify-center border border-slate-200">
                {selectedOrderForSlip.slipImage ? (
                  <img
                    src={selectedOrderForSlip.slipImage}
                    alt="Slip proof"
                    className="max-h-68 rounded-xl object-contain shadow-sm"
                  />
                ) : (
                  <div className="py-8 text-center text-slate-400">ไม่มีรูปสลิป</div>
                )}
              </div>

              {/* Order Verification Details Card */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดที่ระบบเรียกเก็บ:</span>
                  <span className="font-extrabold font-mono text-sm text-purple-900">
                    {formatTHB(selectedOrderForSlip.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ชื่อลูกค้า:</span>
                  <span className="font-bold text-slate-800">{selectedOrderForSlip.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                  <span className="font-mono text-slate-800">{selectedOrderForSlip.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาสั่งซื้อ:</span>
                  <span className="text-slate-600">{formatThaiDate(selectedOrderForSlip.createdAt)}</span>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                💡 <strong>ระบบอัตโนมัติ:</strong> เมื่อพนักงานกดยืนยันยอดเงิน ระบบจะเปลี่ยนสถานะออเดอร์เป็น "เตรียมจัดส่ง" และส่งการแจ้งเตือนอัตโนมัติไปยังลูกค้าทันที
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    verifyOrderPayment(selectedOrderForSlip.id, false, 'ยอดเงินไม่ตรง หรือสลิปไม่ชัดเจน');
                    setSelectedOrderForSlip(null);
                  }}
                  className="py-3 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ปฏิเสธสลิป</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    verifyOrderPayment(selectedOrderForSlip.id, true);
                    setSelectedOrderForSlip(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันยอดชำระ & เตรียมจัดส่ง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Fulfill Shipping & Automated Notification Alert */}
      {selectedOrderForShip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    บันทึกการจัดส่งพัสดุ
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedOrderForShip.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForShip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmShip} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  เลือกบริษัทขนส่งพัสดุ
                </label>
                <select
                  value={shipCourier}
                  onChange={(e) => setShipCourier(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Flash Express">Flash Express</option>
                  <option value="Kerry Express">Kerry Express</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="ไปรษณีย์ไทย EMS">ไปรษณีย์ไทย EMS</option>
                  <option value="รับเองหน้าร้าน">รับเองหน้าร้าน</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    หมายเลขพัสดุ (Tracking Number) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = shipCourier === 'ไปรษณีย์ไทย EMS' ? 'ED' : 'TH';
                      const rand = Math.floor(1000000000 + Math.random() * 9000000000);
                      setShipTrackingNumber(`${prefix}${rand}`);
                    }}
                    className="text-[11px] text-amber-700 hover:underline font-bold"
                  >
                    สุ่มเลขพัสดุอัตโนมัติ
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={shipTrackingNumber}
                  onChange={(e) => setShipTrackingNumber(e.target.value)}
                  placeholder="เช่น TH029381726K"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-blue-700" />
                  การแจ้งเตือนอัตโนมัติถึงลูกค้า:
                </span>
                <p className="text-[11px] text-blue-800 leading-normal">
                  เมื่อกดยืนยัน ระบบจะส่งการแจ้งเตือนสถานะการจัดส่งพร้อมเลขพัสดุ {shipTrackingNumber} ให้คุณ {selectedOrderForShip.customerName} ({selectedOrderForShip.customerPhone}) ทราบโดยอัตโนมัติ
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShip(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>ยืนยันจัดส่ง & ส่งเลขพัสดุ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
