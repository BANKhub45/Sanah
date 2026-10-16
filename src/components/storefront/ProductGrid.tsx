import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatTHB } from '../../utils/formatters';
import { Plus, Check, Star, AlertTriangle, Eye, Flame, Package } from 'lucide-react';

interface ProductGridProps {
  searchQuery: string;
  selectedCategory: ProductCategory | 'ทั้งหมด';
  setSelectedCategory: (c: ProductCategory | 'ทั้งหมด') => void;
  onSelectProduct: (p: Product) => void;
}

const CATEGORIES: (ProductCategory | 'ทั้งหมด')[] = [
  'ทั้งหมด',
  'ถั่วและธัญพืช',
  'ขนมนำเข้าและมาเลเซีย',
  'ชา กาแฟ และเครื่องดื่ม',
  'ผลไม้อบแห้ง',
  'ของแห้งและของทานเล่น',
  'ชุดของฝากจัดเซ็ต',
];

export const ProductGrid: React.FC<ProductGridProps> = ({
  searchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
}) => {
  const { products, addToCart, cart } = useStore();
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC'>('POPULAR');

  // Filter products
  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    const matchQuery =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'PRICE_ASC') return a.sellPrice - b.sellPrice;
    if (sortBy === 'PRICE_DESC') return b.sellPrice - a.sellPrice;
    // Default POPULAR: best seller first, then stock
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return 0;
  });

  const getItemCountInCart = (prodId: string) => {
    const item = cart.find((c) => c.product.id === prodId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Sort bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Horizontal scrollable categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs sm:text-sm text-slate-500">
          <span>พบ {sorted.length} รายการ</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="POPULAR">เรียงตาม: ยอดนิยม / แนะนำ</option>
            <option value="PRICE_ASC">ราคา: ต่ำไปสูง</option>
            <option value="PRICE_DESC">ราคา: สูงไปต่ำ</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบสินค้าที่ตรงกับการค้นหา</h3>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะคะ</p>
          <button
            onClick={() => {
              setSelectedCategory('ทั้งหมด');
            }}
            className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            ดูสินค้าทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sorted.map((product) => {
            const inCartQty = getItemCountInCart(product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-square w-full overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
                    {product.isBestSeller && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] sm:text-xs font-extrabold shadow-md">
                        <Flame className="w-3 h-3 fill-current" />
                        ขายดี
                      </span>
                    )}
                    {product.origin && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-medium">
                        {product.origin}
                      </span>
                    )}
                  </div>

                  {/* Stock Alert Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {isOutOfStock ? (
                      <span className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold shadow">
                        สินค้าหมด
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        เหลือ {product.stock}
                      </span>
                    ) : null}
                  </div>

                  {/* Hover Quick View overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      ดูรายละเอียด
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-amber-700 font-semibold tracking-wide uppercase">
                      {product.category}
                    </span>
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mt-0.5 hover:text-amber-700 cursor-pointer transition-colors leading-snug"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer: Price + Add Button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base sm:text-lg font-black text-amber-800">
                        {formatTHB(product.sellPrice)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        / {product.unit}
                      </span>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all shadow-sm ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                          : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                      }`}
                      title={isOutOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
                    >
                      {inCartQty > 0 ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="text-[9px] font-black">{inCartQty}</span>
                        </div>
                      ) : (
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
