import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatThaiDate } from '../../utils/formatters';
import { X, Printer, Truck, MapPin, Phone, Package, QrCode } from 'lucide-react';

export const ShippingLabelModal: React.FC = () => {
  const { selectedOrderForLabel, setSelectedOrderForLabel, settings } = useStore();

  if (!selectedOrderForLabel) return null;

  const order = selectedOrderForLabel;

  // Extract postal code from customer address
  const postalMatch = order.customerAddress?.match(/\b\d{5}\b/);
  const postalCode = postalMatch ? postalMatch[0] : '10160';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Screen only */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600 text-white rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                ใบปะหน้าพัสดุสำหรับจัดส่งอัตโนมัติ (Shipping Label)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {order.id} | ขนส่ง: {order.courier}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบปะหน้า (Print)</span>
            </button>
            <button
              onClick={() => setSelectedOrderForLabel(null)}
              className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50 print:p-0 print:bg-white">
          <div className="max-w-[420px] mx-auto bg-white p-6 border-2 border-slate-900 rounded-2xl shadow-sm text-slate-900 font-sans print:border-2 print:border-black print:rounded-none print:shadow-none print-area">
            {/* Courier Header Band */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 bg-slate-900 text-white rounded">
                  {order.courier || 'EXPRESS'}
                </span>
                <span className="text-xs font-extrabold text-slate-700">ใบนำส่งพัสดุด่วน</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">รหัสออเดอร์</span>
                <span className="font-mono font-black text-sm">{order.id}</span>
              </div>
            </div>

            {/* Tracking Barcode Simulation */}
            <div className="py-3 text-center border-b-2 border-slate-900 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">
                Tracking Number
              </span>
              {/* Simulated crisp Barcode stripes */}
              <div className="h-12 w-full max-w-[280px] mx-auto flex items-stretch justify-center gap-0.5 px-2">
                {[3,1,2,4,1,2,3,1,1,4,2,1,3,2,1,4,1,3,2,1,4,2,1,3,1,2,4,1,3,2,1,4,2].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black"
                    style={{ width: `${w * 2}px` }}
                  />
                ))}
              </div>
              <span className="font-mono font-black text-base tracking-widest block mt-1">
                {order.trackingNumber || 'TH6902381903K'}
              </span>
            </div>

            {/* Recipient Box (ผู้รับ) - Prominent */}
            <div className="py-3.5 border-b-2 border-slate-900">
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                ผู้รับ (TO):
              </span>
              <div className="space-y-1">
                <div className="font-black text-base text-slate-900">
                  {order.customerName}
                </div>
                <div className="font-mono font-bold text-sm text-slate-800">
                  โทร: {order.customerPhone}
                </div>
                <div className="text-xs leading-relaxed text-slate-800 pr-2">
                  {order.customerAddress}
                </div>
              </div>

              {/* Large Zip Code Highlight */}
              <div className="mt-2.5 flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-300">
                <span className="text-[11px] font-bold text-slate-600">รหัสไปรษณีย์ปลายทาง:</span>
                <div className="flex gap-1">
                  {postalCode.split('').map((char, i) => (
                    <span
                      key={i}
                      className="w-7 h-8 bg-white border-2 border-black font-mono font-black text-lg flex items-center justify-center"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sender Box (ผู้ส่ง) */}
            <div className="py-3 border-b-2 border-slate-900 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">
                ผู้ส่ง (FROM):
              </span>
              <div className="font-bold text-slate-900">{settings.storeName} ({settings.branchName})</div>
              <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                {settings.address}
              </div>
              <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                โทร: {settings.phone}
              </div>
            </div>

            {/* Packing Picker List (รายการของฝากในกล่อง) */}
            <div className="py-2.5 border-b border-slate-300 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                รายการของฝาก (Packing Checklist):
              </span>
              <div className="space-y-0.5 font-medium text-slate-800">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">
                      [ ] {it.productName}
                    </span>
                    <span className="font-mono font-bold shrink-0">
                      ×{it.quantity} {it.unit.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer QR & Date */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>วันที่พิมพ์: {formatThaiDate(new Date().toISOString())}</span>
              <span className="font-semibold text-slate-700">ตลาดกิมหยง หาดใหญ่</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
