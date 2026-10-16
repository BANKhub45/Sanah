import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatTHB } from '../../utils/formatters';
import { X, ShoppingBag, ShieldCheck, Flame, Plus, Minus, MapPin, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenAI: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenAI,
}) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.isBestSeller && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-md">
              <Flame className="w-4 h-4 fill-current" />
              ของฝากยอดฮิต
            </div>
          )}
          {product.origin && (
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {product.origin}
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="text-amber-700 font-semibold">{product.category}</span>
              <span>รหัส: {product.sku}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-800">
                {formatTHB(product.sellPrice)}
              </span>
              <span className="text-xs text-slate-500">/ {product.unit}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Storage Tips */}
            <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                เคล็ดลับความสดใหม่จากสานะกิมหยง:
              </p>
              <p className="text-amber-700/90 leading-normal">
                ปิดซิปล็อคหรือฝาให้สนิท เก็บในที่แห้งพ้นแสงแดด หรือแช่ในตู้เย็นเพื่อรักษาความกรอบมันได้นานถึง 3-6 เดือน
              </p>
            </div>

            {/* Stock indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">สถานะสต็อก:</span>
              <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isOutOfStock ? 'สินค้าหมดชั่วคราว' : `พร้อมส่ง (คงเหลือ ${product.stock} ${product.unit})`}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">จำนวน:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-amber-800 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/20 active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ใส่ตะกร้า ({formatTHB(product.sellPrice * quantity)})</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAI();
                }}
                className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                title="ถาม AI เพิ่มเติมเกี่ยวกับสินค้านี้"
              >
                <Sparkles className="w-5 h-5 text-amber-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
