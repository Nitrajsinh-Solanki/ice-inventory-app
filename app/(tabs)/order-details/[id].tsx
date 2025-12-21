"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../../../src/constants/config"
import { useAuth } from "../../../src/contexts/AuthContext"
import { getPendingOrders, updateOrderStatus } from "../../../src/services/api"
import type { Order } from "../../../src/types"

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { partner, userId } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    if (!partner || !userId) return

    try {
      setLoading(true)
      const orders = await getPendingOrders(partner._id, userId)
      const foundOrder = orders.find((o) => o._id === id)

      if (!foundOrder) {
        Alert.alert("Error", "Order not found")
        router.back()
        return
      }

      setOrder(foundOrder)
    } catch (error: any) {
      console.error("Error fetching order:", error)
      Alert.alert("Error", error.response?.data?.error || "Failed to fetch order details")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    if (!order?.customerContact) {
      Alert.alert("Error", "Phone number not available")
      return
    }
    Linking.openURL(`tel:${order.customerContact}`)
  }

  const handleOpenMaps = () => {
    if (!order?.customerAddress) {
      Alert.alert("Error", "Address not available")
      return
    }

    let mapsUrl = ""
    if (order.customerLat && order.customerLng) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`
    } else {
      const address = encodeURIComponent(order.customerAddress)
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`
    }

    Linking.openURL(mapsUrl)
  }

  const handleStatusUpdate = async (newStatus: "On the Way" | "Delivered") => {
    if (!order || !partner) return

    Alert.alert("Confirm Status Change", `Change status to ${newStatus}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            setUpdating(true)
            await updateOrderStatus(order._id, newStatus, partner._id)
            Alert.alert("Success", "Order status updated successfully", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ])
          } catch (error: any) {
            console.error("Error updating status:", error)
            const errorMsg = error.response?.data?.error || "Failed to update status"
            Alert.alert("Error", errorMsg)
          } finally {
            setUpdating(false)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              order.deliveryStatus === "Pending" && styles.statusPending,
              order.deliveryStatus === "On the Way" && styles.statusOnTheWay,
              order.deliveryStatus === "Delivered" && styles.statusDelivered,
            ]}
          >
            <Text style={styles.statusText}>{order.deliveryStatus}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{order.customerContact}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{order.customerAddress}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <Text style={styles.orderIdText}>Order ID: #{order.orderId}</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.mapsButton]} onPress={handleOpenMaps}>
            <Ionicons name="navigate" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {order.deliveryStatus === "Pending" && (
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => handleStatusUpdate("On the Way")}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.statusButtonText}>Mark as On the Way</Text>
          )}
        </TouchableOpacity>
      )}

      {order.deliveryStatus === "On the Way" && (
        <TouchableOpacity
          style={[styles.statusButton, styles.deliveredButton]}
          onPress={() => handleStatusUpdate("Delivered")}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.statusButtonText}>Mark as Delivered</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusOnTheWay: {
    backgroundColor: "#dbeafe",
  },
  statusDelivered: {
    backgroundColor: "#d1fae5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  orderIdText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapsButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deliveredButton: {
    backgroundColor: "#10b981",
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  bottomSpacing: {
    height: 32,
  },
})
