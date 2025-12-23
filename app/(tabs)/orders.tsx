"use client";

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
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/constants/config";

import { useAuth } from "../../src/contexts/AuthContext";
import { getPendingOrders } from "../../src/services/api";
import type { Order } from "../../src/types";
import axios from "axios";

export default function OrdersScreen() {
  const router = useRouter();
  const { partner } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [ordersUserId, setOrdersUserId] = useState<string | null>(null);

  // ---------- PARTNER LOADING ----------
  useEffect(() => {
    if (!partner) {
      console.log("❌ No partner data in memory");
      setLoading(false);
      return;
    }

    resolveOrderAdminId();
  }, [partner]);

  // ---------- RESOLVE ORDER ADMIN ----------
  const resolveOrderAdminId = async (): Promise<void> => {
    try {
      // 1️⃣ USE createdByUser DIRECTLY
      if (partner && partner.createdByUser) {
        const adminId = String(partner.createdByUser);
        console.log("🟢 Using createdByUser:", adminId);

        setOrdersUserId(adminId);
        return loadOrders(adminId);
      }

      // 2️⃣ FALLBACK USING adminEmail
      if (partner && partner.adminEmail) {
        console.log("🟡 Resolving admin ID with adminEmail:", partner.adminEmail);

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/delivery/list?adminEmail=${
            partner.adminEmail
          }`
        );

        if (Array.isArray(res.data) && res.data.length > 0) {
          const adminId = String(res.data[0].createdByUser || "");
          if (adminId) {
            console.log("🟢 Resolved adminId:", adminId);

            setOrdersUserId(adminId);
            return loadOrders(adminId);
          }
        }
      }

      // 3️⃣ FAIL
      console.log("❌ No admin link found");
      Alert.alert(
        "Account issue",
        "Your account is not linked to any shop. Contact admin."
      );
      setLoading(false);
    } catch (error) {
      console.log("❌ Failed to resolve admin ID:", error);
      Alert.alert("Error", "Unable to load orders");
      setLoading(false);
    }
  };

  // ---------- LOAD ORDERS ----------
  const loadOrders = async (adminUserId: string): Promise<void> => {
    try {
      console.log("📦 Fetching orders for admin:", adminUserId);

      const data = await getPendingOrders(adminUserId);
      console.log("📦 Orders fetched:", data.length);

      setOrders(data);
      setFiltered(data);
    } catch (error) {
      console.log("❌ Order loading error:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ---------- REFRESH ----------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (ordersUserId) await loadOrders(ordersUserId);
    setRefreshing(false);
  }, [ordersUserId]);

  // ---------- SEARCH FILTER ----------
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(orders);
      return;
    }

    const q = search.toLowerCase();

    setFiltered(
      orders.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerAddress?.toLowerCase().includes(q)
      )
    );
  }, [search, orders]);

  // ---------- OPEN ORDER ----------
  const openOrder = (id: string): void => {
    router.push({
      pathname: "/(tabs)/order-details/[id]",
      params: { id },
    });
  };

  // ---------- LOADING UI ----------
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ---------- EMPTY UI ----------
  if (!filtered.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>📦 No active orders</Text>

        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  }

  // ---------- SUCCESS UI ----------
  return (
    <View style={styles.container}>
      <Text style={styles.head}>Pending Orders</Text>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search orders..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      <FlatList<Order>
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openOrder(item._id)}>
            <Text>#{item.orderId}</Text>
            <Text>{item.customerName}</Text>
            <Text>{item.customerAddress}</Text>
            <Text>₹ {item.total}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  head: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  searchWrap: {
    flexDirection: "row",
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 6 },
  input: { flex: 1 },
  card: {
    padding: 14,
    marginVertical: 6,
    backgroundColor: COLORS.card,
    borderRadius: 10,
  },
  empty: { fontSize: 18, opacity: 0.6 },
});
