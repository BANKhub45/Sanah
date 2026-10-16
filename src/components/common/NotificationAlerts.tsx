import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Bell, MessageSquare, Smartphone, X, ExternalLink } from 'lucide-react';

export const NotificationAlerts: React.FC = () => {
  const { notifications, dismissNotification, setTrackingSearchCode, setCurrentView } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-40 flex flex-col gap-3 max-w-md w-full pointer-events-none no-print">
      {notifications.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-amber-500/30 ring-1 ring-black/5 animate-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                item.channel === 'LINE' 
                  ? 'bg-emerald-500 text-white' 
                  : item.channel === 'SMS' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-amber-500 text-white'
              }`}>
                {item.channel === 'LINE' ? <MessageSquare className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                {item.channel === 'LINE' ? 'LINE Alert อัตโนมัติ' : item.channel === 'SMS' ? 'SMS แจ้งเตือน' : 'ระบบร้านค้า'}
              </span>
              <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
            </div>
            <button
              onClick={() => dismissNotification(item.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h5 className="font-semibold text-slate-800 text-sm mt-2">{item.title}</h5>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {item.content}
          </p>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>ผู้รับ: <strong className="text-slate-700">{item.recipient}</strong></span>
            <button
              onClick={() => {
                // If it looks like an order code or tracking, open tracking
                dismissNotification(item.id);
                setCurrentView('STOREFRONT');
              }}
              className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1"
            >
              ดูรายละเอียด <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
