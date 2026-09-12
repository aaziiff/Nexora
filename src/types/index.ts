export type ProductCategory = 'home' | 'care' | 'kitchen' | 'bath' | 'everyday';

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  category_name?: string;
  price: number;
  original_price?: number;
  discount?: string;
  description: string;
  story?: string;
  benefits?: string[];
  features?: string[];
  specifications?: { label: string; value: string }[];
  images: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  in_stock: boolean;
  stock_count: number;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CategoryInfo {
  id: string;
  slug: ProductCategory;
  name: string;
  tagline: string;
  description: string;
  image: string;
  item_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 
  | 'ORDER PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'IN TRANSIT'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'RETURN_PICKED_UP'
  | 'REFUNDED'
  | 'REPLACED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'UPI';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image: string;
}

export type ReturnType = 'replacement' | 'refund' | 'REPLACEMENT' | 'REFUND';

export interface ReturnRequestItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ReturnBankDetails {
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
}

export interface ReturnRequest {
  id?: string;
  request_id?: string;
  return_type: ReturnType;
  reason: string;
  custom_reason?: string;
  items: ReturnRequestItem[];
  refund_method?: 'UPI' | 'BANK_TRANSFER';
  refund_upi_id?: string;
  refund_bank_details?: ReturnBankDetails;
  comments?: string;
  image_url?: string;
  images?: string[];
  status?: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PICKED_UP' | 'REFUNDED' | 'REPLACED';
  requested_at: string;
  admin_decision_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  refund_transaction_id?: string;
  replacement_courier?: string;
  replacement_tracking?: string;
  pickup_date?: string;
  pickup_scheduled_date?: string;
  pickup_courier?: string;
  pickup_tracking_number?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  upi_reference_id?: string;
  order_status: OrderStatus;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  return_request?: ReturnRequest;
  status_history: OrderStatusHistoryItem[];
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  location?: string;
}

export interface SiteSettings {
  announcement_text: string;
  announcement_enabled: boolean;
  free_shipping_threshold: number;
  upi_id: string;
  upi_name: string;
  upi_qr_image?: string;
  support_phone: string;
  support_email: string;
  instagram_handle: string;
  email_notifications_enabled?: boolean;
  emailjs_service_id?: string;
  emailjs_template_id?: string;
  emailjs_public_key?: string;
  resend_api_key?: string;
  sender_email?: string;
}

export interface EmailLog {
  id: string;
  order_number: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: 'sent' | 'simulated' | 'failed';
  error_message?: string;
  html_preview: string;
  timestamp: string;
}
