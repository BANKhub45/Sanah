import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  CartItem, 
  StoreSettings, 
  StockLog, 
  CourierType, 
  OrderStatus 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_SETTINGS, 
  INITIAL_STOCK_LOGS 
} from '../data/initialData';
import { generateOrderId, generateTrackingNumber } from '../utils/formatters';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface NotificationAlert {
  id: string;
  title: string;
  channel: 'LINE' | 'SMS' | 'SYSTEM';
  recipient: string;
  content: string;
  timestamp: string;
}

interface StoreContextType {
  // Navigation
  currentView: 'STOREFRONT' | 'ADMIN' | 'POS';
  setCurrentView: (view: 'STOREFRONT' | 'ADMIN' | 'POS') => void;
  adminTab: 'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'SETTINGS';
  setAdminTab: (tab: 'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'SETTINGS') => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, deltaQty: number, reason: string, operator?: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  createOnlineOrder: (params: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    courier: CourierType;
    paymentMethod: 'PROMPTPAY_QR';
    slipImage?: string;
    notes?: string;
  }) => Order;
  createPosOrder: (params: {
    items: { product: Product; quantity: number }[];
    paymentMethod: 'CASH' | 'PROMPTPAY_QR' | 'CREDIT_CARD';
    cashReceived?: number;
    discount?: number;
    customerName?: string;
  }) => Order;
  verifyOrderPayment: (orderId: string, isApproved: boolean, note?: string) => void;
  shipOrder: (orderId: string, courier: CourierType, trackingNumber: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Audit Logs & Settings
  stockLogs: StockLog[];
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDefaultData: () => void;

  // Toasts & Customer Notification System
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  notifications: NotificationAlert[];
  dismissNotification: (id: string) => void;

  // Active Modals state
  selectedOrderForLabel: Order | null;
  setSelectedOrderForLabel: (order: Order | null) => void;
  selectedOrderForReceipt: Order | null;
  setSelectedOrderForReceipt: (order: Order | null) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  trackingSearchCode: string;
  setTrackingSearchCode: (code: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'sanakimyong_products_v1',
  ORDERS: 'sanakimyong_orders_v1',
  SETTINGS: 'sanakimyong_settings_v1',
  STOCK_LOGS: 'sanakimyong_stocklogs_v1',
  CART: 'sanakimyong_cart_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'STOREFRONT' | 'ADMIN' | 'POS'>('STOREFRONT');
  const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'SETTINGS'>('DASHBOARD');

  // Load from local storage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_LOGS;
    } catch {
      return INITIAL_STOCK_LOGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI helpers
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [trackingSearchCode, setTrackingSearchCode] = useState('');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Toast helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotificationAlert = (alert: Omit<NotificationAlert, 'id' | 'timestamp'>) => {
    const newAlert: NotificationAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Product operations
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);

    // Log initial stock
    if (product.stock > 0) {
      const log: StockLog = {
        id: `log-${Date.now()}`,
        productId: id,
        productName: product.name,
        sku: product.sku,
        type: 'IN',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'เพิ่มสินค้าใหม่เข้าระบบ',
        timestamp: new Date().toISOString(),
        operator: 'ผู้ดูแลระบบ',
      };
      setStockLogs((prev) => [log, ...prev]);
    }
    addToast('success', 'เพิ่มสินค้าสำเร็จ', `เพิ่ม "${product.name}" ในระบบแล้ว`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      })
    );
    addToast('success', 'บันทึกข้อมูลสินค้าแล้ว');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'ลบสินค้าเรียบร้อย', prod?.name);
  };

  const adjustStock = (productId: string, deltaQty: number, reason: string, operator = 'พนักงาน') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const previousStock = p.stock;
          const newStock = Math.max(0, previousStock + deltaQty);

          const log: StockLog = {
            id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: deltaQty > 0 ? 'IN' : 'ADJUST',
            quantity: deltaQty,
            previousStock,
            newStock,
            reason: reason || (deltaQty > 0 ? 'รับสินค้าเข้าสต็อก' : 'ปรับลดยอดสต็อก'),
            timestamp: new Date().toISOString(),
            operator,
          };
          setStockLogs((l) => [log, ...l]);

          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    addToast('success', 'อัปเดตจำนวนสต็อกแล้ว');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      addToast('error', 'สินค้าหมด', `ขออภัย ${product.name} สินค้าในสต็อกหมดชั่วคราว`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          addToast('error', 'สต็อกไม่เพียงพอ', `ในสต็อกมีเหลือ ${product.stock} ${product.unit}`);
          return prev;
        }
        addToast('success', 'เพิ่มจำนวนสินค้าในตะกร้าแล้ว', `${product.name} (${newQty} ${product.unit})`);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        addToast('success', 'เพิ่มลงตะกร้าแล้ว', `${product.name} (1 ${product.unit})`);
        return [...prev, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('info', 'นำสินค้าออกจากตะกร้าแล้ว');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((c) => c.product.id === productId);
    if (item && quantity > item.product.stock) {
      addToast('error', 'สต็อกไม่พอ', `มีสินค้าเพียง ${item.product.stock} ${item.product.unit}`);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.product.id === productId ? { ...c, quantity } : c))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Online Checkout (Order creation)
  const createOnlineOrder = (params: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    courier: CourierType;
    paymentMethod: 'PROMPTPAY_QR';
    slipImage?: string;
    notes?: string;
  }): Order => {
    const orderId = generateOrderId();
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.sellPrice,
      costPrice: item.product.costPrice,
      totalPrice: item.product.sellPrice * item.quantity,
      unit: item.product.unit,
      image: item.product.image,
    }));

    const totalAmount = cartTotal;
    const shippingFee = totalAmount >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    const netAmount = totalAmount + shippingFee;
    const totalCost = orderItems.reduce((acc, it) => acc + it.costPrice * it.quantity, 0);
    const profit = totalAmount - totalCost;

    const newOrder: Order = {
      id: orderId,
      channel: 'ONLINE',
      createdAt: new Date().toISOString(),
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerAddress: params.customerAddress,
      items: orderItems,
      totalAmount,
      shippingFee,
      discount: 0,
      netAmount,
      totalCost,
      profit,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PENDING_VERIFY',
      slipImage: params.slipImage,
      orderStatus: 'PENDING_VERIFY',
      courier: params.courier,
      notes: params.notes,
      trackingSteps: [
        {
          status: 'PENDING_VERIFY',
          title: 'ชำระเงินและแนบสลิปเรียบร้อย',
          description: `ส่งคำสั่งซื้อผ่านระบบ PromptPay QR ยอด ${netAmount.toLocaleString()} บาท แนบหลักฐานสลิปแล้ว`,
          timestamp: new Date().toISOString(),
          isCompleted: true,
        },
        {
          status: 'PROCESSING',
          title: 'พนักงานตรวจสอบยอดชำระเงิน',
          description: 'พนักงานร้านสานะกิมหยงกำลังตรวจสอบสลิปและเตรียมหยิบสินค้าตัดสต็อก',
          timestamp: '',
          isCompleted: false,
        },
        {
          status: 'SHIPPED',
          title: 'จัดส่งพร้อมเลขพัสดุ',
          description: `ส่งมอบให้ ${params.courier} และแจ้งเตือนเลขพัสดุอัตโนมัติ`,
          timestamp: '',
          isCompleted: false,
        },
        {
          status: 'DELIVERED',
          title: 'พัสดุจัดส่งสำเร็จ',
          description: 'พัสดุจัดส่งถึงผู้รับเรียบร้อย ของฝากหาดใหญ่ถึงมือคุณอย่างปลอดภัย',
          timestamp: '',
          isCompleted: false,
        },
      ],
    };

    // Pre-deduct or hold stock on online order
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = orderItems.find((oi) => oi.productId === p.id);
        if (ordered) {
          const newStock = Math.max(0, p.stock - ordered.quantity);
          // Log stock change
          const log: StockLog = {
            id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'OUT_ONLINE',
            quantity: -ordered.quantity,
            previousStock: p.stock,
            newStock,
            reason: `สั่งซื้อออนไลน์ (ออเดอร์ ${orderId})`,
            timestamp: new Date().toISOString(),
            operator: 'ระบบออนไลน์อัตโนมัติ',
          };
          setStockLogs((logs) => [log, ...logs]);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Trigger system notification to staff
    addNotificationAlert({
      channel: 'SYSTEM',
      title: 'ออเดอร์ใหม่รอตรวจสอบสลิป',
      recipient: 'พนักงานร้านสานะกิมหยง',
      content: `ออเดอร์ ${orderId} จากคุณ ${params.customerName} ยอด ${netAmount} บาท แนบสลิปแล้ว`,
    });

    addToast('success', 'สั่งซื้อสำเร็จ!', `รหัสคำสั่งซื้อของคุณคือ ${orderId}`);
    return newOrder;
  };

  // POS Storefront Order (Real-time Instant Stock Deduction)
  const createPosOrder = (params: {
    items: { product: Product; quantity: number }[];
    paymentMethod: 'CASH' | 'PROMPTPAY_QR' | 'CREDIT_CARD';
    cashReceived?: number;
    discount?: number;
    customerName?: string;
  }): Order => {
    const orderId = `POS-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const discount = params.discount || 0;

    const orderItems = params.items.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      sku: it.product.sku,
      quantity: it.quantity,
      unitPrice: it.product.sellPrice,
      costPrice: it.product.costPrice,
      totalPrice: it.product.sellPrice * it.quantity,
      unit: it.product.unit,
      image: it.product.image,
    }));

    const totalAmount = orderItems.reduce((acc, it) => acc + it.totalPrice, 0);
    const netAmount = Math.max(0, totalAmount - discount);
    const totalCost = orderItems.reduce((acc, it) => acc + it.costPrice * it.quantity, 0);
    const profit = netAmount - totalCost;
    const cashReceived = params.cashReceived || (params.paymentMethod === 'CASH' ? netAmount : 0);
    const cashChange = params.paymentMethod === 'CASH' ? Math.max(0, cashReceived - netAmount) : 0;

    // Real-time Immediate Stock Deduction for Storefront POS
    setProducts((prev) =>
      prev.map((p) => {
        const match = orderItems.find((oi) => oi.productId === p.id);
        if (match) {
          const newStock = Math.max(0, p.stock - match.quantity);
          const log: StockLog = {
            id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'OUT_POS',
            quantity: -match.quantity,
            previousStock: p.stock,
            newStock,
            reason: `ขายหน้าร้าน POS (บิล ${orderId})`,
            timestamp: new Date().toISOString(),
            operator: 'แคชเชียร์หน้าร้าน',
          };
          setStockLogs((logs) => [log, ...logs]);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    const posOrder: Order = {
      id: orderId,
      channel: 'POS_STOREFRONT',
      createdAt: new Date().toISOString(),
      customerName: params.customerName || 'ลูกค้าหน้าร้าน (Walk-in)',
      customerPhone: '-',
      items: orderItems,
      totalAmount,
      shippingFee: 0,
      discount,
      netAmount,
      totalCost,
      profit,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      courier: 'รับเองหน้าร้าน',
      cashReceived,
      cashChange,
      paidAt: new Date().toISOString(),
      notes: 'ขายหน้าร้าน ตลาดกิมหยง ตัดสต็อกทันที',
    };

    setOrders((prev) => [posOrder, ...prev]);
    addToast('success', 'บันทึกการขายสำเร็จ', `ตัดสต็อกสินค้าเรียบร้อย ยอดชำระ ${netAmount} บาท`);
    return posOrder;
  };

  // Staff Slip Verification
  const verifyOrderPayment = (orderId: string, isApproved: boolean, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (isApproved) {
            const updatedSteps = (ord.trackingSteps || []).map((st) => {
              if (st.status === 'PROCESSING') {
                return {
                  ...st,
                  isCompleted: true,
                  timestamp: new Date().toISOString(),
                  description: 'พนักงานตรวจสอบสลิปยอดชำระเงินถูกต้อง ยืนยันคำสั่งซื้อเรียบร้อย และกำลังแพ็คสินค้า',
                };
              }
              return st;
            });

            // Automated notification to customer
            addNotificationAlert({
              channel: 'LINE',
              title: 'ยืนยันยอดชำระเงินสำเร็จ ✅',
              recipient: ord.customerPhone,
              content: `ร้านสานะกิมหยง ยืนยันยอดชำระเงิน ${ord.netAmount} บาท สำหรับออเดอร์ ${ord.id} แล้ว กำลังแพ็คของฝากอย่างดีค่ะ`,
            });

            addToast('success', 'ยืนยันยอดเงินสำเร็จ', `ออเดอร์ ${orderId} เปลี่ยนเป็นสถานะเตรียมจัดส่ง`);

            return {
              ...ord,
              paymentStatus: 'PAID',
              orderStatus: 'PROCESSING',
              paidAt: new Date().toISOString(),
              trackingSteps: updatedSteps,
              notes: note ? `${ord.notes || ''} [ตรวจสอบ: ${note}]` : ord.notes,
            };
          } else {
            // Rejected
            addToast('error', 'ปฏิเสธยอดชำระ', `ออเดอร์ ${orderId} ถูกปฏิเสธสลิป: ${note || 'สลิปไม่ถูกต้อง'}`);
            return {
              ...ord,
              paymentStatus: 'REJECTED',
              orderStatus: 'CANCELLED',
              notes: note ? `สลิปไม่ผ่าน: ${note}` : 'สลิปไม่ผ่านการตรวจสอบ',
            };
          }
        }
        return ord;
      })
    );
  };

  // Staff Shipping Fulfillment & Automated Tracking Alert
  const shipOrder = (orderId: string, courier: CourierType, trackingNumber: string) => {
    const finalTracking = trackingNumber || generateTrackingNumber(courier);

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedSteps = (ord.trackingSteps || []).map((st) => {
            if (st.status === 'SHIPPED') {
              return {
                ...st,
                isCompleted: true,
                timestamp: new Date().toISOString(),
                description: `พัสดุถูกส่งมอบให้ ${courier} เรียบร้อย เลขพัสดุติดตาม: ${finalTracking}`,
              };
            }
            return st;
          });

          // Trigger Automated Notification to Customer via LINE / SMS
          addNotificationAlert({
            channel: 'LINE',
            title: `พัสดุถูกจัดส่งแล้ว 🚚 (${courier})`,
            recipient: `${ord.customerName} (${ord.customerPhone})`,
            content: `ออเดอร์ ${ord.id} ของคุณส่งแล้ว! เลขพัสดุ: ${finalTracking} สามารถนำเลขนี้ไปเช็คสถานะการจัดส่งได้ทันที`,
          });

          addToast('success', 'จัดส่งและแจ้งเลขพัสดุแล้ว', `เลขพัสดุ: ${finalTracking} ส่งการแจ้งเตือนถึงลูกค้าอัตโนมัติ`);

          return {
            ...ord,
            courier,
            trackingNumber: finalTracking,
            orderStatus: 'SHIPPED',
            shippedAt: new Date().toISOString(),
            trackingSteps: updatedSteps,
          };
        }
        return ord;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, orderStatus: status };
        }
        return ord;
      })
    );
    addToast('info', 'อัปเดตสถานะออเดอร์แล้ว');
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addToast('success', 'บันทึกการตั้งค่าร้านค้าแล้ว');
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setStockLogs(INITIAL_STOCK_LOGS);
    setCart([]);
    localStorage.clear();
    addToast('info', 'รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOnlineOrder,
        createPosOrder,
        verifyOrderPayment,
        shipOrder,
        updateOrderStatus,
        stockLogs,
        settings,
        updateSettings,
        resetToDefaultData,
        toasts,
        addToast,
        removeToast,
        notifications,
        dismissNotification,
        selectedOrderForLabel,
        setSelectedOrderForLabel,
        selectedOrderForReceipt,
        setSelectedOrderForReceipt,
        isChatOpen,
        setIsChatOpen,
        trackingSearchCode,
        setTrackingSearchCode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
