import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Save, 
  Check, 
  ShieldAlert,
  Phone,
  MapPin
} from 'lucide-react';

export const StoreSettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, addToast } = useStore();
  const [form, setForm] = useState<StoreSettings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          ตั้งค่าร้านค้า & บัญชีรับเงิน
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          จัดการข้อมูลร้านสานะกิมหยง บัญชี PromptPay สำหรับลูกค้าสแกนจ่าย และเงื่อนไขค่าจัดส่ง
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-amber-600" />
            ข้อมูลร้านค้าหน้าร้าน (ตลาดกิมหยง หาดใหญ่)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อร้าน</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">สาขา</label>
              <input
                type="text"
                required
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                ที่อยู่ร้าน (จะแสดงบนใบปะหน้าพัสดุและใบเสร็จ)
              </label>
              <textarea
                rows={2}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">LINE ID</label>
              <input
                type="text"
                value={form.lineId}
                onChange={(e) => setForm({ ...form, lineId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* PromptPay & Bank Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-amber-600" />
            ตั้งค่าบัญชีรับเงิน PromptPay QR (ระบบจะเจน QR อัตโนมัติจากเบอร์นี้)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                หมายเลขพร้อมเพย์ (เบอร์โทร 10 หลัก หรือเลขบัตร ปชช./นิติบุคคล 13 หลัก)
              </label>
              <input
                type="text"
                required
                value={form.promptpayId}
                onChange={(e) => setForm({ ...form, promptpayId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อบัญชีพร้อมเพย์</label>
              <input
                type="text"
                required
                value={form.promptpayName}
                onChange={(e) => setForm({ ...form, promptpayName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ธนาคาร</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">เลขที่บัญชีธนาคาร</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Promotion */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-amber-600" />
            ตั้งค่าอัตราค่าจัดส่ง & โปรโมชั่นส่งฟรี
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ยอดสั่งซื้อขั้นต่ำสำหรับส่งฟรี (บาท)
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">ปัจจุบัน: สั่งครบ {form.freeShippingThreshold} บาท ส่งฟรีทั่วประเทศ</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ค่าจัดส่งมาตรฐานปกติ (บาท)
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.defaultShippingFee}
                onChange={(e) => setForm({ ...form, defaultShippingFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">คิดเมื่อยอดสั่งซื้อไม่ถึงเกณฑ์ส่งฟรี</span>
            </div>
          </div>
        </div>

        {/* Save button & Reset button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่? (สินค้าและออเดอร์จะกลับเป็นค่าเดิม)')) {
                resetToDefaultData();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลตัวอย่างเป็นค่าเริ่มต้น</span>
          </button>
        </div>
      </form>
    </div>
  );
};
