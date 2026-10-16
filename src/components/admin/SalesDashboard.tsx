import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatTHB, formatThaiDate } from '../../utils/formatters';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Store,
  Globe,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  const { orders, products, setAdminTab, setIsChatOpen } = useStore();
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // Filter orders by date range
  const filteredOrders = orders.filter((o) => {
    if (o.orderStatus === 'CANCELLED') return false;
    if (dateRange === 'ALL') return true;

    const orderTime = new Date(o.createdAt).getTime();
    const now = Date.now();
    if (dateRange === 'TODAY') {
      return now - orderTime < 24 * 3600 * 1000;
    }
    if (dateRange === 'WEEK') {
      return now - orderTime < 7 * 24 * 3600 * 1000;
    }
    if (dateRange === 'MONTH') {
      return now - orderTime < 30 * 24 * 3600 * 1000;
    }
    return true;
  });

  // Financial calculations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.netAmount, 0);
  const totalCost = filteredOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + o.profit, 0);
  const profitMarginPercent = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Sales Channel breakdown
  const onlineOrders = filteredOrders.filter((o) => o.channel === 'ONLINE');
  const posOrders = filteredOrders.filter((o) => o.channel === 'POS_STOREFRONT');

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.netAmount, 0);
  const posRevenue = posOrders.reduce((sum, o) => sum + o.netAmount, 0);

  // Pending slip approvals
  const pendingSlipOrders = orders.filter(
    (o) => o.channel === 'ONLINE' && o.orderStatus === 'PENDING_VERIFY'
  );

  // Low stock products alert
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Top selling products aggregated
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((it) => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = {
          name: it.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productSalesMap[it.productId].quantity += it.quantity;
      productSalesMap[it.productId].revenue += it.totalPrice;
      productSalesMap[it.productId].profit += (it.unitPrice - it.costPrice) * it.quantity;
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            รายงานสรุปยอดขาย & ผลกำไร
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลรายได้ ต้นทุน กำไรสุทธิ และยอดขายแยกตามช่องทางแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRange('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'TODAY' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setDateRange('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'WEEK' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={() => setDateRange('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'MONTH' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setDateRange('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
          </div>

          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            title="ให้ AI ช่วยวิเคราะห์ยอดขาย"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">วิเคราะห์ยอดด้วย AI</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-5 rounded-3xl shadow-lg shadow-amber-600/20 relative overflow-hidden">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดขายรวม (Revenue)</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            {formatTHB(totalRevenue)}
          </div>
          <div className="mt-2 text-xs text-amber-100 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>จากคำสั่งซื้อทั้งหมด {filteredOrders.length} บิล</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-3xl shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">กำไรสุทธิ (Net Profit)</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            {formatTHB(totalProfit)}
          </div>
          <div className="mt-2 text-xs text-emerald-100 flex items-center gap-1 font-semibold">
            <span>อัตรากำไร (Margin): {profitMarginPercent}%</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ต้นทุนสินค้า (Cost)</span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatTHB(totalCost)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            คำนวณจากราคาต้นทุนต่อหน่วยจริง
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div 
          onClick={() => setAdminTab('INVENTORY')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-amber-400 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">สินค้าใกล้หมด</span>
            <AlertTriangle className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-300'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lowStockProducts.length} <span className="text-base font-normal text-slate-400">รายการ</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-semibold group-hover:underline flex items-center gap-1">
            <span>คลิกเพื่อดูและเติมสต็อก</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Pending Slip Verification Alert Banner */}
      {pendingSlipOrders.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/30 flex items-center justify-center shrink-0 border border-purple-400/40">
              <AlertTriangle className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base sm:text-lg">
                  มี {pendingSlipOrders.length} ออเดอร์ใหม่รอตรวจสอบสลิปการชำระเงิน!
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse">
                  ด่วน
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                ลูกค้าชำระเงินผ่าน PromptPay QR และแนบสลิปเรียบร้อย รอพนักงานกดยืนยันเพื่อเตรียมจัดส่ง
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminTab('ORDERS')}
            className="px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0 active:scale-95"
          >
            ไปตรวจสอบสลิปทันที
          </button>
        </div>
      )}

      {/* Middle Grid: Sales Channels Breakdown & Top Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Channel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-amber-600" />
              สัดส่วนยอดขายตามช่องทาง
            </h3>

            <div className="space-y-4">
              {/* Online Channel */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-800">คำสั่งซื้อออนไลน์</span>
                  </div>
                  <span className="text-xs font-bold text-blue-800 font-mono">
                    {onlineOrders.length} บิล
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">ยอดขายรวม:</span>
                  <span className="text-base font-black text-blue-900">{formatTHB(onlineRevenue)}</span>
                </div>
              </div>

              {/* POS Storefront Channel */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-800">ขายหน้าร้าน (POS กิมหยง)</span>
                  </div>
                  <span className="text-xs font-bold text-amber-800 font-mono">
                    {posOrders.length} บิล
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">ยอดขายรวม:</span>
                  <span className="text-base font-black text-amber-900">{formatTHB(posRevenue)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            ตัดสต็อกสินค้าอัตโนมัติแบบเรียลไทม์ทุกช่องทาง
          </div>
        </div>

        {/* Top 5 Best Sellers Ranking */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              อันดับสินค้าขายดี (Top Best Sellers)
            </h3>
            <span className="text-xs text-slate-400">เรียงตามจำนวนที่ขายได้</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                ยังไม่มีรายการขายในช่วงเวลาที่เลือก
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0 
                        ? 'bg-amber-500 text-white' 
                        : idx === 1 
                        ? 'bg-slate-300 text-slate-800' 
                        : idx === 2 
                        ? 'bg-amber-700/60 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        ขายได้ {p.quantity} ชิ้น | กำไร {formatTHB(p.profit)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-amber-800 text-sm sm:text-base">
                      {formatTHB(p.revenue)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
