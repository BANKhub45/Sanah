import React from 'react';
import { useStore } from '../../context/StoreContext';
import { SalesDashboard } from './SalesDashboard';
import { OrderManagement } from './OrderManagement';
import { InventoryManagement } from './InventoryManagement';
import { StoreSettingsView } from './StoreSettingsView';
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Settings, 
  Store,
  CreditCard,
  Truck
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { adminTab, setAdminTab, orders } = useStore();

  const pendingSlipCount = orders.filter(
    (o) => o.channel === 'ONLINE' && o.orderStatus === 'PENDING_VERIFY'
  ).length;

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab('DASHBOARD')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            adminTab === 'DASHBOARD'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>สรุปยอดขาย (Dashboard)</span>
        </button>

        <button
          onClick={() => setAdminTab('ORDERS')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            adminTab === 'ORDERS'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>จัดการออเดอร์ & สลิป</span>
          {pendingSlipCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[11px] font-black rounded-full animate-pulse">
              {pendingSlipCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('INVENTORY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            adminTab === 'INVENTORY'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-amber-400" />
          <span>สต็อกสินค้า & ต้นทุน ราคาขาย</span>
        </button>

        <button
          onClick={() => setAdminTab('SETTINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            adminTab === 'SETTINGS'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span>ตั้งค่าร้านค้า & พร้อมเพย์</span>
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === 'DASHBOARD' && <SalesDashboard />}
      {adminTab === 'ORDERS' && <OrderManagement />}
      {adminTab === 'INVENTORY' && <InventoryManagement />}
      {adminTab === 'SETTINGS' && <StoreSettingsView />}
    </div>
  );
};
