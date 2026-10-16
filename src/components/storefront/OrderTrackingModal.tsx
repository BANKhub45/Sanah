import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatTHB, formatThaiDate } from '../../utils/formatters';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  MapPin,
  Phone
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
}) => {
  const { orders, addToast } = useStore();
  const [searchCode, setSearchCode] = useState(initialCode);

  if (!isOpen) return null;

  // Search by order ID, tracking number, or phone number
  const cleanQuery = searchCode.trim().toLowerCase();
  const matchedOrders = orders.filter((o) => {
    if (!cleanQuery) return true; // Show all if empty
    return (
      o.id.toLowerCase().includes(cleanQuery) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(cleanQuery)) ||
      o.customerPhone.includes(cleanQuery) ||
      o.customerName.toLowerCase().includes(cleanQuery)
    );
  });

  const selectedOrder = matchedOrders.length > 0 ? matchedOrders[0] : null;

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    addToast('success', 'คัดลอกเลขพัสดุแล้ว', tracking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                ติดตามสถานะคำสั่งซื้อ & พัสดุ
              </h3>
              <p className="text-xs text-slate-500">
                ร้านของฝากสานะกิมหยง หาดใหญ่
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="ค้นหาด้วย รหัสคำสั่งซื้อ (เช่น SN261015-8821), เลขพัสดุ, หรือเบอร์โทรศัพท์..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Quick Recent Order Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-xs text-slate-500">
            <span className="shrink-0 text-[11px]">ออเดอร์ล่าสุด:</span>
            {orders.slice(0, 4).map((ord) => (
              <button
                key={ord.id}
                onClick={() => setSearchCode(ord.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 transition-colors ${
                  searchCode === ord.id
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {ord.id}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!selectedOrder ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">ไม่พบข้อมูลคำสั่งซื้อ</p>
              <p className="text-xs text-slate-400 mt-0.5">
                โปรดตรวจสอบรหัสคำสั่งซื้อ หรือเบอร์โทรศัพท์อีกครั้งนะคะ
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Header Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-800 text-base">
                      {selectedOrder.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedOrder.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.orderStatus === 'SHIPPED'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedOrder.orderStatus === 'PROCESSING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedOrder.orderStatus === 'PENDING_VERIFY' && 'รอตรวจสอบสลิปยอดชำระ'}
                      {selectedOrder.orderStatus === 'PROCESSING' && 'ยืนยันยอดแล้ว กำลังแพ็ค'}
                      {selectedOrder.orderStatus === 'SHIPPED' && 'จัดส่งแล้ว'}
                      {selectedOrder.orderStatus === 'DELIVERED' && 'จัดส่งสำเร็จ'}
                      {selectedOrder.orderStatus === 'CANCELLED' && 'ยกเลิกคำสั่งซื้อ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    สั่งซื้อเมื่อ {formatThaiDate(selectedOrder.createdAt)}
                  </p>
                </div>

                {/* Tracking Number highlight */}
                {selectedOrder.trackingNumber && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      เลขพัสดุ ({selectedOrder.courier})
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-sm text-amber-900">
                        {selectedOrder.trackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(selectedOrder.trackingNumber!)}
                        className="p-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs transition-colors"
                        title="คัดลอกเลขพัสดุ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Timeline Steps */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  ลำดับขั้นตอนการจัดส่ง
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(selectedOrder.trackingSteps || []).map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          step.isCompleted
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300 text-slate-300'
                        }`}
                      >
                        {step.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <h5 className={`font-bold ${step.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.title}
                          </h5>
                          {step.timestamp && (
                            <span className="text-[11px] text-slate-400">
                              {formatThaiDate(step.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${step.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details & Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    ผู้รับพัสดุ:
                  </h5>
                  <p className="font-semibold text-slate-800">{selectedOrder.customerName}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedOrder.customerPhone}
                  </p>
                  <p className="text-slate-600 leading-normal">{selectedOrder.customerAddress || 'รับเองหน้าร้าน'}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-700" />
                    สรุปรายการของฝาก:
                  </h5>
                  <div className="divide-y divide-slate-200/60 max-h-28 overflow-y-auto pr-1">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="py-1 flex justify-between text-slate-600">
                        <span className="truncate pr-2">{it.productName} × {it.quantity}</span>
                        <span className="font-semibold text-slate-800 shrink-0">{formatTHB(it.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                    <span>ยอดชำระสุทธิ:</span>
                    <span className="text-amber-800 font-extrabold">{formatTHB(selectedOrder.netAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
