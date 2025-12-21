"use client"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "expo-router"
import { COLORS } from "../../src/constants/config"
import { useAuth } from "../../src/contexts/AuthContext"
import { getPendingOrders } from "../../src/services/api"
import type { Order } from "../../src/types"
import { startLocationTracking, requestLocationPermissions } from "../../src/services/location"

export default function OrdersScreen() {
  const router = useRouter()
  const { partner, userId, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
    initializeLocationTracking()
  }, [partner, userId])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, orders])

  const initializeLocationTracking = async () => {
    try {
      await requestLocationPermissions()
      await startLocationTracking()
    } catch (error) {
      console.error("Location tracking error:", error)
    }
  }

  const loadOrders = async () => {
    if (!partner || !userId) {
      setIsLoading(false)
      return
    }

    try {
      console.log("Fetching orders for partner:", partner._id, "userId:", userId)
      const data = await getPendingOrders(partner._id, userId)
      console.log("Orders fetched successfully:", data.length)
      setOrders(data)
      setFilteredOrders(data)
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      if (error.response?.status === 403 || error.response?.status === 404) {
        Alert.alert("Account Issue", "Your account has been deactivated or removed.", [
          { text: "OK", onPress: () => logout() },
        ])
      } else {
        Alert.alert("Error", error.response?.data?.error || "Failed to load orders")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }, [partner, userId])

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = orders.filter(
      (order) =>
        order.customerName?.toLowerCase().includes(query) ||
        order.customerAddress?.toLowerCase().includes(query) ||
        order.orderId?.toLowerCase().includes(query),
    )
    setFilteredOrders(filtered)
  }

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/(tabs)/order-details/${item._id}`)}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.orderId}</Text>
        <View
          style={[
            styles.statusBadge,
            item.deliveryStatus === "On the Way" ? styles.statusOnTheWay : styles.statusPending,
          ]}
        >
          <Text style={styles.statusText}>{item.deliveryStatus}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>👤 {item.customerName}</Text>
        <Text style={styles.customerAddress} numberOfLines={2}>
          📍 {item.customerAddress}
        </Text>
        <Text style={styles.customerContact}>📞 {item.customerContact}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {item.items.length} item{item.items.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Orders</Text>
        <Text style={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, address, or order ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No pending orders</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  customerAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customerContact: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
})
