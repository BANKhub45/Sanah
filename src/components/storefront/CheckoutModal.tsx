import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CourierType } from '../../types';
import { generatePromptPayQRCode } from '../../utils/promptpay';
import { formatTHB } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Copy, 
  Upload, 
  QrCode, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Clock
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrackingWithCode: (code: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOpenTrackingWithCode,
}) => {
  const { cart, cartTotal, settings, createOnlineOrder, addToast } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [courier, setCourier] = useState<CourierType>('Flash Express');
  const [notes, setNotes] = useState('');

  // Payment state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [slipImage, setSlipImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  const shippingFee = cartTotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
  const netAmount = cartTotal + shippingFee;

  // Generate PromptPay QR when entering step 2
  useEffect(() => {
    if (step === 2 && netAmount > 0) {
      generatePromptPayQRCode(settings.promptpayId, netAmount).then((dataUrl) => {
        setQrDataUrl(dataUrl);
      });
    }
  }, [step, netAmount, settings.promptpayId]);

  if (!isOpen) return null;

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      addToast('error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'โปรดระบุชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่ง');
      return;
    }
    setStep(2);
  };

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText(settings.promptpayId);
    addToast('success', 'คัดลอกหมายเลขพร้อมเพย์แล้ว', settings.promptpayId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSlipImage(reader.result as string);
        addToast('success', 'แนบสลิปเรียบร้อยแล้ว');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSlip = () => {
    // Helpful simulation for testing
    const sampleSlip = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
    setSlipImage(sampleSlip);
    addToast('info', 'แนบสลิปจำลองสำหรับทดสอบแล้ว', 'ยอดเงินตรงตามออเดอร์');
  };

  const handleSubmitOrder = () => {
    if (!slipImage) {
      addToast('error', 'กรุณาแนบสลิปการโอนเงิน', 'เพื่อความรวดเร็วในการตรวจสอบยอดและยืนยันออเดอร์');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order = createOnlineOrder({
        customerName,
        customerPhone,
        customerAddress,
        courier,
        paymentMethod: 'PROMPTPAY_QR',
        slipImage,
        notes,
      });

      setCreatedOrderId(order.id);
      setIsSubmitting(false);
      setStep(3);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }
    }, 600);
  };

  const handleFinish = () => {
    onClose();
    if (createdOrderId) {
      onOpenTrackingWithCode(createdOrderId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {step === 1 ? 'ขั้นตอนที่ 1 / 2' : step === 2 ? 'ขั้นตอนที่ 2 / 2' : 'สั่งซื้อสำเร็จ'}
            </span>
            <h3 className="font-extrabold text-slate-800 text-lg">
              {step === 1 && 'ข้อมูลที่อยู่จัดส่งของฝาก'}
              {step === 2 && 'ชำระเงินผ่าน PromptPay QR'}
              {step === 3 && 'คำสั่งซื้อของคุณเสร็จสมบูรณ์'}
            </h3>
          </div>

          {step !== 3 && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: Address & Courier Selection */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้รับของฝาก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น คุณกมลวรรณ ทวีสุข"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์มือถือ (สำหรับรับ SMS / ขนส่งโทรแจ้ง) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="เช่น 089-123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ที่อยู่จัดส่งพัสดุ (บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="เช่น 123/45 หมู่บ้านสุขใจ ซอย 5 ถ.เพชรเกษม แขวงบางหว้า เขตภาษีเจริญ กรุงเทพฯ 10160"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>

              {/* Courier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  เลือกบริษัทขนส่งพัสดุ
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['Flash Express', 'Kerry Express', 'J&T Express', 'ไปรษณีย์ไทย EMS'] as CourierType[]).map((c) => (
                    <label
                      key={c}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        courier === c
                          ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="courier"
                        checked={courier === c}
                        onChange={() => setCourier(c)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น ฝากห่อของขวัญ, ฝากไว้ที่ป้อมยาม"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Order items preview summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดสินค้ารวม ({cart.length} รายการ)</span>
                  <span className="font-semibold text-slate-800">{formatTHB(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่ง</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {shippingFee === 0 ? 'ฟรี (โปรโมชั่น)' : formatTHB(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-amber-800 font-black">{formatTHB(netAmount)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>ต่อไป: สแกนชำระเงิน PromptPay QR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PromptPay QR Code & Slip Upload */}
          {step === 2 && (
            <div className="space-y-5">
              {/* PromptPay QR Container */}
              <div className="bg-gradient-to-b from-blue-950 to-blue-900 text-white p-5 rounded-3xl shadow-xl text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="px-2.5 py-1 bg-white rounded text-[11px] font-black text-blue-950 tracking-wide uppercase">
                    Thai QR Payment
                  </div>
                  <span className="text-xs font-semibold text-blue-200">พร้อมเพย์ PromptPay</span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-amber-300 my-1">
                  {formatTHB(netAmount)}
                </div>
                <p className="text-xs text-blue-200/90">
                  สแกนจ่ายได้ทุกแอปธนาคารไทย ยอดตรง ไม่ต้องพิมพ์จำนวนเงิน
                </p>

                {/* QR Display */}
                <div className="mt-4 inline-block bg-white p-3 rounded-2xl shadow-inner">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="PromptPay QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 animate-pulse text-blue-900" />
                    </div>
                  )}
                </div>

                {/* Account details */}
                <div className="mt-3 text-xs text-blue-100 space-y-0.5">
                  <p className="font-semibold">{settings.promptpayName}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-mono text-amber-300 font-bold text-sm">
                      พร้อมเพย์: {settings.promptpayId}
                    </span>
                    <button
                      onClick={handleCopyPromptPay}
                      className="p-1 px-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      คัดลอก
                    </button>
                  </div>
                </div>
              </div>

              {/* Slip Upload Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-300/80">
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  แนบหลักฐานสลิปการโอนเงิน <span className="text-rose-500">*</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  เมื่อแนบสลิปแล้ว พนักงานจะทำการตรวจสอบยอดชำระเงินและกดยืนยันออเดอร์ในระบบทันที
                </p>

                {slipImage ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-300">
                    <img
                      src={slipImage}
                      alt="Uploaded slip"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        แนบสลิปเรียบร้อยแล้ว
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        ยอดที่ต้องชำระ: {formatTHB(netAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSlipImage('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                    >
                      เปลี่ยนรูป
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-colors text-xs font-semibold text-slate-700">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>อัปโหลดรูปสลิปจากเครื่อง</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleSimulateSlip}
                      className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>กดเพื่อจำลองแนบสลิป</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="button"
                  disabled={!slipImage || isSubmitting}
                  onClick={handleSubmitOrder}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    !slipImage || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/25 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <span>กำลังบันทึกคำสั่งซื้อ...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>ยืนยันการชำระเงินและส่งคำสั่งซื้อ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Success & Tracking Link */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  ขอบคุณที่สั่งซื้อของฝากสานะกิมหยง!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  ระบบได้รับยอดชำระและหลักฐานสลิปเรียบร้อยแล้ว พนักงานกำลังตรวจสอบยอดและเตรียมสินค้าเพื่อจัดส่งค่ะ
                </p>
              </div>

              {/* Order ID Card */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl max-w-sm mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>รหัสคำสั่งซื้อของคุณ:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdOrderId);
                      addToast('success', 'คัดลอกรหัสออเดอร์แล้ว');
                    }}
                    className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอก
                  </button>
                </div>
                <div className="text-lg font-mono font-black text-amber-900 tracking-wider">
                  {createdOrderId}
                </div>

                <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-800/90 flex items-start gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    เมื่อพนักงานยืนยันยอดและออกเลขพัสดุแล้ว ระบบจะแจ้งเตือนสถานะพร้อมเลขพัสดุให้คุณทราบโดยอัตโนมัติ
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>ติดตามสถานะพัสดุ</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-3 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors"
                >
                  กลับหน้าแรก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
