//src\types\index.ts

export interface DeliveryPartner {
  _id: string
  name: string
  email: string
  phone: string
  adminEmail?: string
  status: "pending" | "approved" | "rejected" | "deleted"
  createdByUser: string
  lastLocation?: {
    latitude: number
    longitude: number
    updatedAt: Date
  }
}

export interface Order {
  _id: string
  orderId: string
  userId: string
  shopName: string
  customerId: string
  customerName: string
  customerContact: string
  customerAddress: string
  customerLat?: number
  customerLng?: number
  items: OrderItem[]
  total: number
  deliveryStatus: "Pending" | "On the Way" | "Delivered"
  deliveryPartnerId?: string
  deliveryAssignedAt?: Date
  deliveryCompletedAt?: Date
  createdAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Customer {
  _id: string
  name: string
  shopName: string
  // Changed from shopAddress to address to match backend
  address: string
  // Changed from contacts[] to phone (can be string or string[])
  phone: string | string[]
  lat?: number
  lng?: number
}

export interface StickyNoteOrder {
  customerName: string
  // Changed from single product fields to items array
  items: {
    productId: string
    quantity: number
  }[]
  notes?: string
}

export interface SearchHistory {
  _id: string
  partnerId: string
  customerId: string
  customerName: string
  searchedAt: Date
}

export interface DeliveredOrdersGroup {
  today: Order[]
  yesterday: Order[]
  thisWeek: Order[]
  older: Order[]
}
