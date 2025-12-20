import axios from "axios"
import { API_BASE_URL } from "../constants/config"
import type { DeliveryPartner, Order, Customer, StickyNoteOrder, DeliveredOrdersGroup } from "../types"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Auth APIs
export const registerPartner = async (data: {
  name: string
  email: string
  phone: string
  adminEmail: string
  password: string
}) => {
  const response = await api.post("/delivery/register", data)
  return response.data
}

export const loginPartner = async (email: string, password: string) => {
  const response = await api.post("/delivery/login-otp", { email, password })
  return response.data
}

export const verifyOTP = async (email: string, otp: string) => {
  const response = await api.post("/delivery/verify-otp", { email, otp })
  return response.data
}

export const resendOTP = async (email: string) => {
  const response = await api.post("/delivery/resend-otp", { email })
  return response.data
}

// Partner Profile APIs
export const getPartnerProfile = async (partnerId: string) => {
  const response = await api.get(`/delivery/profile?partnerId=${partnerId}`)
  return response.data as DeliveryPartner
}

// Order APIs
export const getPendingOrders = async (partnerId: string, userId: string) => {
  const response = await api.get(`/delivery/orders?partnerId=${partnerId}&userId=${userId}`)
  return response.data as Order[]
}

export const getDeliveredOrders = async (partnerId: string) => {
  const response = await api.get(`/delivery/delivered-orders?partnerId=${partnerId}`)
  return response.data as { total: number; groups: DeliveredOrdersGroup }
}

export const updateOrderStatus = async (
  orderId: string,
  status: "Pending" | "On the Way" | "Delivered",
  partnerId: string,
) => {
  const response = await api.patch("/delivery/update-order-status", {
    orderId,
    partnerId,
    status,
  })
  return response.data
}

// Customer Search APIs
export const searchCustomers = async (userId: string, query: string) => {
  const response = await api.get(`/delivery/search-customers?userId=${userId}&q=${query}`)
  return response.data.customers as Customer[]
}

export const getCustomerDetails = async (customerId: string) => {
  const response = await api.get(`/delivery/customer-details?customerId=${customerId}`)
  return response.data as Customer
}

// Search History APIs
export const saveSearchHistory = async (partnerId: string, customerId: string) => {
  const response = await api.post("/delivery/search-history", {
    partnerId,
    customerId,
  })
  return response.data
}

export const getSearchHistory = async (partnerId: string) => {
  const response = await api.get(`/delivery/search-history?partnerId=${partnerId}`)
  return response.data
}

// Sticky Note APIs
export const createStickyNoteOrder = async (partnerId: string, userId: string, data: StickyNoteOrder) => {
  const response = await api.post("/delivery/sticky-notes", {
    partnerId,
    userId,
    ...data,
  })
  return response.data
}

export const searchProducts = async (userId: string, query: string) => {
  const response = await api.get(`/delivery/search-products?userId=${userId}&q=${query}`)
  return response.data.products
}

// Location Tracking APIs
export const updateLocation = async (partnerId: string, latitude: number, longitude: number) => {
  const response = await api.post("/delivery/update-location", {
    partnerId,
    latitude,
    longitude,
  })
  return response.data
}

export default api
