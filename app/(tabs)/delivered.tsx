"use client"

import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../../src/constants/config"
import { useAuth } from "../../src/contexts/AuthContext"
import { getDeliveredOrders } from "../../src/services/api"
import type { Order } from "../../src/types"

interface DeliveredSection {
  title: string
  data: Order[]
}

export default function DeliveredOrdersScreen() {
  const router = useRouter()
  const { partner, logout } = useAuth()
  const [sections, setSections] = useState<DeliveredSection[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeliveredOrders()
  }, [])

  const loadDeliveredOrders = async () => {
    if (!partner) return

    try {
      const data = await getDeliveredOrders(partner._id)
      setTotalOrders(data.total)

      const sectionData: DeliveredSection[] = []

      if (data.groups.today.length > 0) {
        sectionData.push({ title: "Today", data: data.groups.today })
      }
      if (data.groups.yesterday.length > 0) {
        sectionData.push({ title: "Yesterday", data: data.groups.yesterday })
      }
      if (data.groups.this_week.length > 0) {
        sectionData.push({ title: "This Week", data: data.groups.this_week })
      }
      if (data.groups.older.length > 0) {
        sectionData.push({ title: "Older", data: data.groups.older })
      }

      setSections(sectionData)
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        Alert.alert("Account Issue", "Your account has been deactivated or removed.", [
          { text: "OK", onPress: () => logout() },
        ])
      } else {
        Alert.alert("Error", "Failed to load delivered orders")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadDeliveredOrders()
    setRefreshing(false)
  }, [])

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/(tabs)/order-details/${item._id}`)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.orderId}>#{item.orderId}</Text>
        </View>
        <View style={styles.deliveredBadge}>
          <Text style={styles.deliveredText}>Delivered</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.customerAddress} numberOfLines={1}>
            {item.customerAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{formatDate(item.deliveryCompletedAt || item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {item.items.length} item{item.items.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderSectionHeader = ({ section }: { section: DeliveredSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} orders</Text>
    </View>
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
        <Text style={styles.title}>Delivered Orders</Text>
        <Text style={styles.subtitle}>
          {totalOrders} order{totalOrders !== 1 ? "s" : ""} completed
        </Text>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderOrderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>No delivered orders yet</Text>
            <Text style={styles.emptySubtext}>Your completed deliveries will appear here</Text>
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
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    marginTop: 12,
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
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  deliveredBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deliveredText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  customerAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
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
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
})
