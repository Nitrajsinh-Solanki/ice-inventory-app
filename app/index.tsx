//app\index.tsx

"use client"

import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "../src/contexts/AuthContext"
import { COLORS } from "../src/constants/config"
import { LinearGradient } from "expo-linear-gradient"

export default function SplashScreen() {
  const router = useRouter()
  const { isAuthenticated, isLoading, partner } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (isAuthenticated && partner?.status === "approved") {
          router.replace("/(tabs)/orders")
        } else {
          router.replace("/(auth)/home")
        }
      }, 2000)
    }
  }, [isLoading, isAuthenticated, partner])

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🧊</Text>
        </View>
        <Text style={styles.title}>Ice Delivery</Text>
        <Text style={styles.subtitle}>Partner App</Text>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
})
