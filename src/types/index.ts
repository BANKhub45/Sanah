export type ProductCategory = 
  | 'ถั่วและธัญพืช'
  | 'ขนมนำเข้าและมาเลเซีย'
  | 'ชา กาแฟ และเครื่องดื่ม'
  | 'ผลไม้อบแห้ง'
  | 'ของแห้งและของทานเล่น'
  | 'ชุดของฝากจัดเซ็ต';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  costPrice: number;    // ต้นทุน (บาท)
  sellPrice: number;    // ราคาขาย (บาท)
  stock: number;        // จำนวนในสต็อก
  minStock: number;     // สต็อกขั้นต่ำสำหรับแจ้งเตือน
  unit: string;         // หน่วย เช่น ถุง, กระปุก, แพ็ค, กล่อง, กก.
  weightGram: number;   // น้ำหนัก (กรัม)
  image: string;
  isBestSeller?: boolean;
  origin?: string;      // แหล่งกำเนิด เช่น ตลาดกิมหยง หาดใหญ่, มาเลเซีย
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
  unit: string;
  image?: string;
}

export type OrderChannel = 'ONLINE' | 'POS_STOREFRONT';

export type PaymentStatus = 'PENDING_VERIFY' | 'PAID' | 'REJECTED';

export type OrderStatus = 
  | 'PENDING_VERIFY'   // รอตรวจสอบยอดเงิน
  | 'PROCESSING'       // ยืนยันยอดเงินแล้ว กำลังจัดเตรียมสินค้า
  | 'SHIPPED'          // จัดส่งแล้ว มีเลขพัสดุ
  | 'DELIVERED'        // พัสดุส่งถึงปลายทางเรียบร้อย
  | 'CANCELLED';       // ยกเลิก

export type CourierType = 
  | 'Flash Express' 
  | 'J&T Express' 
  | 'Kerry Express' 
  | 'ไปรษณีย์ไทย EMS' 
  | 'รับเองหน้าร้าน';

export interface TrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
}

export interface Order {
  id: string;                      // e.g. SN-6901
  channel: OrderChannel;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  netAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'PROMPTPAY_QR' | 'CASH' | 'CREDIT_CARD';
  paymentStatus: PaymentStatus;
  slipImage?: string;             // URL or base64
  orderStatus: OrderStatus;
  courier?: CourierType;
  trackingNumber?: string;
  trackingSteps?: TrackingStep[];
  paidAt?: string;
  shippedAt?: string;
  notes?: string;
  cashReceived?: number;
  cashChange?: number;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT_ONLINE' | 'OUT_POS' | 'ADJUST';
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  operator: string;
}

export interface StoreSettings {
  storeName: string;
  branchName: string;
  address: string;
  phone: string;
  promptpayId: string;
  promptpayName: string;
  bankName: string;
  bankAccount: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  lineId: string;
  facebook: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
