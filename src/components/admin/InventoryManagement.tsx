import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { formatTHB, formatThaiDate } from '../../utils/formatters';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  History, 
  X,
  Layers,
  TrendingUp,
  Percent
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, stockLogs } = useStore();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'LOGS'>('PRODUCTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ทั้งหมด');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Stock Adjust Modal state
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('รับสินค้าเข้าสต็อก');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'ถั่วและธัญพืช' as ProductCategory,
    description: '',
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 10,
    unit: 'ถุง (500 กรัม)',
    weightGram: 500,
    image: '',
    isBestSeller: false,
    origin: 'ตลาดกิมหยง หาดใหญ่',
  });

  const categories: ProductCategory[] = [
    'ถั่วและธัญพืช',
    'ขนมนำเข้าและมาเลเซีย',
    'ชา กาแฟ และเครื่องดื่ม',
    'ผลไม้อบแห้ง',
    'ของแห้งและของทานเล่น',
    'ชุดของฝากจัดเซ็ต',
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'ทั้งหมด' || p.category === categoryFilter;
    const matchQuery =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `KMY-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'ถั่วและธัญพืช',
      description: '',
      costPrice: 100,
      sellPrice: 160,
      stock: 20,
      minStock: 10,
      unit: 'ถุง (500 กรัม)',
      weightGram: 500,
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
      isBestSeller: false,
      origin: 'ตลาดกิมหยง หาดใหญ่',
    });
    setIsAddEditOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      weightGram: p.weightGram,
      image: p.image,
      isBestSeller: !!p.isBestSeller,
      origin: p.origin || 'ตลาดกิมหยง หาดใหญ่',
    });
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsAddEditOpen(false);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustModalProduct && adjustQty !== 0) {
      adjustStock(adjustModalProduct.id, adjustQty, adjustReason, 'ผู้จัดการร้าน');
      setAdjustModalProduct(null);
      setAdjustQty(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            จัดการสต็อกสินค้า & ต้นทุน ราคาขาย
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ควบคุมสต็อกสินค้าตลาดกิมหยง ปรับต้นทุน กำหนดราคาขาย และตรวจเช็คประวัติการตัดสต็อก
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'PRODUCTS' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>รายการสินค้า ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'LOGS' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติการตัด/เติมสต็อก</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {activeTab === 'PRODUCTS' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาตามชื่อสินค้า หรือ SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3.5 px-4">สินค้า / SKU</th>
                    <th className="py-3.5 px-3">หมวดหมู่</th>
                    <th className="py-3.5 px-3 text-right">ต้นทุน</th>
                    <th className="py-3.5 px-3 text-right">ราคาขาย</th>
                    <th className="py-3.5 px-3 text-right">กำไร / หน่วย</th>
                    <th className="py-3.5 px-3 text-center">คงเหลือในสต็อก</th>
                    <th className="py-3.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const profitPerUnit = p.sellPrice - p.costPrice;
                    const marginPercent = p.sellPrice > 0 ? ((profitPerUnit / p.sellPrice) * 100).toFixed(0) : '0';
                    const isOutOfStock = p.stock <= 0;
                    const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                              <span className="font-mono text-[11px] text-slate-400">
                                {p.sku} | {p.unit}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium">
                            {p.category}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                          {formatTHB(p.costPrice)}
                        </td>

                        {/* Sell Price */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatTHB(p.sellPrice)}
                        </td>

                        {/* Profit & Margin */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-mono font-bold text-emerald-700">
                            +{formatTHB(profitPerUnit)}
                          </span>
                          <span className="text-[10px] text-emerald-600/80 block">
                            ({marginPercent}%)
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {p.stock}
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                ใกล้หมด
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="text-[10px] text-rose-600 font-bold mt-0.5">
                                สินค้าหมด!
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setAdjustModalProduct(p);
                                setAdjustQty(0);
                                setAdjustReason('รับสินค้าเข้าสต็อก');
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
                              title="ปรับสต็อกด่วน"
                            >
                              ปรับสต็อก
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="แก้ไขสินค้า"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`ต้องการลบ "${p.name}" หรือไม่?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบสินค้า"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Stock Logs / Audit Trail View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">
              ประวัติการตัดสต็อก & รับเข้าสต็อกสินค้าทั้งหมด
            </h3>
            <span className="text-xs text-slate-400">{stockLogs.length} รายการบันทึก</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {stockLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    log.type === 'IN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.type === 'OUT_POS'
                      ? 'bg-amber-100 text-amber-800'
                      : log.type === 'OUT_ONLINE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {log.type === 'IN' ? 'รับเข้า' : log.type === 'OUT_POS' ? 'POS หน้าร้าน' : log.type === 'OUT_ONLINE' ? 'ออนไลน์' : 'ปรับยอด'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{log.productName}</h4>
                    <p className="text-slate-500 mt-0.5">{log.reason}</p>
                    <span className="text-[11px] text-slate-400">
                      โดย: {log.operator} | {formatThaiDate(log.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right sm:self-center">
                  <div>
                    <span className={`font-mono font-black text-sm ${log.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {log.previousStock} ➔ {log.newStock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Quick Adjust Stock */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">ปรับยอดสต็อกสินค้า</h3>
              <button
                onClick={() => setAdjustModalProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 block">สินค้า:</span>
                <h4 className="font-bold text-slate-800 text-sm">{adjustModalProduct.name}</h4>
                <p className="text-slate-500">สต็อกปัจจุบัน: <strong className="text-amber-800">{adjustModalProduct.stock}</strong> {adjustModalProduct.unit}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  จำนวนที่ต้องการปรับ (+ หรือ -)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                    placeholder="ใส่จำนวน เช่น 20 หรือ -5"
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAdjustQty(10)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustQty(50)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold"
                    >
                      +50
                    </button>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ผลลัพธ์ใหม่: {Math.max(0, adjustModalProduct.stock + adjustQty)} {adjustModalProduct.unit}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สาเหตุการปรับยอด</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="รับสินค้าเข้าสต็อกล็อตใหม่">รับสินค้าเข้าสต็อกล็อตใหม่</option>
                  <option value="ปรับลดยอดสินค้าชำรุด/สูญหาย">ปรับลดยอดสินค้าชำรุด/สูญหาย</option>
                  <option value="นับสต็อกประจำสัปดาห์">นับสต็อกประจำสัปดาห์</option>
                  <option value="นำสินค้าไปแจกชิมหน้าร้าน">นำสินค้าไปแจกชิมหน้าร้าน</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={adjustQty === 0}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:bg-slate-200 disabled:text-slate-400 shadow-md"
                >
                  บันทึกการปรับสต็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Product */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัส SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสินค้าของฝาก</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น เม็ดมะม่วงหิมพานต์เผาโบราณ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ราคาต้นทุน (บาท)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">จำนวนสต็อก</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เตือนเมื่อต่ำกว่า</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="เช่น ถุง (500 กรัม), กระปุก, ห่อ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แหล่งที่มา</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="เช่น ตลาดกิมหยง หาดใหญ่, มาเลเซีย"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ลิงก์รูปภาพ (URL)</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายสินค้า</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="จุดเด่น รสชาติ ความอร่อย..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>ตั้งเป็นสินค้าขายดีประจำร้าน (Best Seller)</span>
              </label>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                >
                  {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
