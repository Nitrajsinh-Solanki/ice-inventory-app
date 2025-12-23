// src/services/api.ts
import axios from "axios";
import { API_BASE_URL } from "../constants/config";
import type { DeliveryPartner, Order, Customer, StickyNoteOrder, DeliveredOrdersGroup } from "../types";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// ---------------- AUTH ----------------

export const registerPartner = async (data: {
  name: string;
  email: string;
  phone: string;
  adminEmail: string;
  password: string;
}) => {
  const res = await api.post("/delivery/register", data);
  return res.data;
};

export const loginPartner = async (email: string, password: string) => {
  const res = await api.post("/delivery/login-otp", { email, password });
  return res.data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const res = await api.post("/delivery/verify-otp", { email, otp });
  return res.data;
};

export const resendOTP = async (email: string) => {
  const res = await api.post("/delivery/resend-otp", { email });
  return res.data;
};

// ---------------- PROFILE ----------------

export const getPartnerProfile = async (partnerId: string) => {
  const res = await api.get(`/delivery/profile?partnerId=${partnerId}`);
  return res.data as DeliveryPartner;
};

// ---------------- ORDERS ----------------
// backend expects adminUserId (createdByUser) not partner userId

export const getPendingOrders = async (adminUserId: string, partnerId?: string) => {
  const url = partnerId
    ? `/delivery/orders?userId=${adminUserId}&partnerId=${partnerId}`
    : `/delivery/orders?userId=${adminUserId}`;

  const res = await api.get(url);
  return res.data as Order[];
};

export const getDeliveredOrders = async (partnerId: string) => {
  const res = await api.get(`/delivery/delivered-orders?partnerId=${partnerId}`);
  return res.data as { total: number; groups: DeliveredOrdersGroup };
};

export const updateOrderStatus = async (
  orderId: string,
  status: "Pending" | "On the Way" | "Delivered",
  partnerId: string
) => {
  const res = await api.patch("/delivery/update-order-status", {
    orderId,
    partnerId,
    status,
  });
  return res.data;
};

// ---------------- CUSTOMERS ----------------

export const searchCustomers = async (adminUserId: string, query: string) => {
  const res = await api.get(`/delivery/search-customers?userId=${adminUserId}&q=${query}`);
  return res.data.customers as Customer[];
};

export const getCustomerDetails = async (customerId: string) => {
  const res = await api.get(`/delivery/customer-details?customerId=${customerId}`);
  return res.data as Customer;
};

// ---------------- SEARCH HISTORY ----------------

export const saveSearchHistory = async (partnerId: string, customerId: string) => {
  const res = await api.post("/delivery/search-history", {
    partnerId,
    customerId,
  });
  return res.data;
};

export const getSearchHistory = async (partnerId: string) => {
  const res = await api.get(`/delivery/search-history?partnerId=${partnerId}`);
  return res.data;
};

// ---------------- STICKY NOTES ----------------

export const createStickyNoteOrder = async (partnerId: string, adminUserId: string, data: StickyNoteOrder) => {
  const res = await api.post("/delivery/sticky-notes", {
    partnerId,
    userId: adminUserId,
    customerName: data.customerName,
    items: data.items,
    notes: data.notes,
  });
  return res.data;
};

export const searchProducts = async (adminUserId: string, query: string) => {
  const res = await api.get(`/delivery/search-products?userId=${adminUserId}&q=${query}`);
  return res.data.products;
};

// ---------------- LOCATION ----------------

export const updateLocation = async (partnerId: string, latitude: number, longitude: number) => {
  const res = await api.post("/delivery/update-location", {
    partnerId,
    latitude,
    longitude,
  });
  return res.data;
};
