"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import api from "@/src/services/api"
import type { Order } from "@/src/types"
import type { Partner } from "@/src/types" // Assuming Partner type is defined

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null) // Assuming partner state is used
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
    fetchPartnerDetails() // Assuming partner details are fetched
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${id}`)
      setOrder(response.data)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch order details")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const fetchPartnerDetails = async () => {
    try {
      const response = await api.get(`/api/partners/${id}`) // Assuming partner ID is the same as order ID
      setPartner(response.data)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch partner details")
    }
  }

  const handleCall = () => {
    if (!order?.customer?.phone) {
      Alert.alert("Error", "Phone number not available")
      return
    }
    Linking.openURL(`tel:${order.customer.phone}`)
  }

  const handleOpenMaps = () => {
    if (!order?.customer?.address) {
      Alert.alert("Error", "Address not available")
      return
    }
    const address = encodeURIComponent(order.customer.address)
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`
    Linking.openURL(url)
  }

  const handleStatusUpdate = async (newStatus: "on_the_way" | "delivered") => {
    if (!order || !partner) return

    const statusMap = {
      on_the_way: "On the Way",
      delivered: "Delivered",
    } as const

    Alert.alert("Confirm Status Change", `Change status to ${statusMap[newStatus]}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            setUpdating(true)
            await updateOrderStatus(order._id, statusMap[newStatus], partner._id)
            Alert.alert("Success", "Order status updated successfully")
            router.back()
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update status")
          } finally {
            setUpdating(false)
          }
        },
      },
    ])
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, partnerId: string) => {
    await api.put(`/api/delivery/orders/${orderId}/status`, {
      status: newStatus,
      partnerId: partnerId,
    })
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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

  const statusColor = order.status === "pending" ? "#FF9500" : order.status === "on_the_way" ? "#007AFF" : "#34C759"

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {order.status === "on_the_way" ? "On the Way" : order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{order.customer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{order.customer.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{order.customer.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
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

      {order.status === "pending" && (
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => handleStatusUpdate("on_the_way")}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.statusButtonText}>Mark as On the Way</Text>
          )}
        </TouchableOpacity>
      )}

      {order.status === "on_the_way" && (
        <TouchableOpacity
          style={[styles.statusButton, styles.deliveredButton]}
          onPress={() => handleStatusUpdate("delivered")}
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
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 16,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  mapsButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusButton: {
    backgroundColor: "#007AFF",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deliveredButton: {
    backgroundColor: "#34C759",
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
})
