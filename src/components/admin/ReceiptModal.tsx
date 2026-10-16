import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatTHB, formatThaiDate } from '../../utils/formatters';
import { X, Printer, Store } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedOrderForReceipt, setSelectedOrderForReceipt, settings } = useStore();

  if (!selectedOrderForReceipt) return null;

  const order = selectedOrderForReceipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Screen only */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <h3 className="font-extrabold text-slate-800 text-sm">ใบเสร็จรับเงินอย่างย่อ</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์</span>
            </button>
            <button
              onClick={() => setSelectedOrderForReceipt(null)}
              className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper (80mm width standard) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 print:p-0 print:bg-white">
          <div className="max-w-[320px] mx-auto bg-white p-5 border border-dashed border-slate-300 rounded-2xl shadow-xs text-slate-900 font-mono text-xs print:border-none print:shadow-none print-area">
            {/* Store Header */}
            <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-bold text-sm text-slate-900">{settings.storeName}</h4>
              <p className="text-[11px] text-slate-600">{settings.branchName}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{settings.address}</p>
              <p className="text-[10px] text-slate-500">โทร: {settings.phone}</p>
            </div>

            {/* Bill details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>เลขที่บิล:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>วันที่:</span>
                <span>{formatThaiDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>ลูกค้า:</span>
                <span className="truncate max-w-[160px]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>ช่องทาง:</span>
                <span>{order.channel === 'POS_STOREFRONT' ? 'หน้าร้าน กิมหยง' : 'ออนไลน์'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-semibold">
                    <span className="truncate pr-2">{it.productName}</span>
                    <span className="shrink-0">{formatTHB(it.totalPrice)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {it.quantity} × {formatTHB(it.unitPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculations */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า:</span>
                <span>{formatTHB(order.totalAmount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>ส่วนลด:</span>
                  <span>-{formatTHB(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>ยอดสุทธิ:</span>
                <span className="text-amber-900 font-black">{formatTHB(order.netAmount)}</span>
              </div>

              {/* Payment Info */}
              <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>วิธีชำระ:</span>
                  <span className="font-bold">
                    {order.paymentMethod === 'CASH' ? 'เงินสด' : order.paymentMethod === 'PROMPTPAY_QR' ? 'PromptPay QR' : 'บัตรเครดิต'}
                  </span>
                </div>
                {order.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between">
                      <span>รับเงินสด:</span>
                      <span>{formatTHB(order.cashReceived || order.netAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>เงินทอน:</span>
                      <span>{formatTHB(order.cashChange || 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer thank you */}
            <div className="pt-3 text-center text-[10px] text-slate-500 space-y-0.5">
              <p>*** ขอบคุณที่อุดหนุนของฝากสานะกิมหยง ***</p>
              <p>ยินดีต้อนรับสู่หาดใหญ่ โอกาสหน้าเชิญใหม่นะคะ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
