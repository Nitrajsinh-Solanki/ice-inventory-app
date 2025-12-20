export interface DeliveryPartner {
  _id: string
  name: string
  email: string
  phone: string
  adminEmail: string
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
  shopAddress: string
  contacts: string[]
  lat?: number
  lng?: number
}

export interface StickyNoteOrder {
  customerName: string
  productName: string
  quantity: number
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
  this_week: Order[]
  older: Order[]
}
