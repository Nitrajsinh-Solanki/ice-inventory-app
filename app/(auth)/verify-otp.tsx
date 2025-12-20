"use client"

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect } from "react"
import { useRouter, useLocalSearchParams } from "expo-router"
import { COLORS } from "../../src/constants/config"
import { verifyOTP, getPartnerProfile, resendOTP } from "../../src/services/api"
import { useAuth } from "../../src/contexts/AuthContext"

export default function VerifyOTPScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { login } = useAuth()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP")
      return
    }

    try {
      setIsLoading(true)
      console.log("[v0] Verifying OTP for email:", params.email)
      const response = await verifyOTP(params.email as string, otp)
      console.log("[v0] OTP verification response:", JSON.stringify(response, null, 2))

      if (response.partnerId && response.token) {
        console.log("[v0] Fetching partner profile for partnerId:", response.partnerId)
        const profileResponse = await getPartnerProfile(response.partnerId)
        console.log("[v0] Partner profile:", JSON.stringify(profileResponse, null, 2))

        const partnerProfile = profileResponse.partner || profileResponse

        if (partnerProfile.status !== "approved") {
          Alert.alert("Account Not Approved", "Your account is pending approval. Please wait for admin approval.")
          router.replace("/(auth)/home")
          return
        }

        const userId = response.partnerId || partnerProfile.id
        console.log("[v0] Calling login function with userId:", userId)
        await login(partnerProfile, userId)
        console.log("[v0] Login completed, navigating to orders...")

        router.replace("/(tabs)/orders")
      } else {
        console.log("[v0] No partnerId or token in response")
        Alert.alert("Error", "Invalid response from server")
      }
    } catch (error: any) {
      console.log("[v0] OTP verification error:", error)
      Alert.alert("Verification Failed", error.response?.data?.error || "Invalid OTP or server error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend || isResending) return

    try {
      setIsResending(true)
      await resendOTP(params.email as string)
      Alert.alert("Success", "OTP has been resent to your email")

      // Reset countdown
      setCanResend(false)
      setCountdown(60)
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to resend OTP")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {params.email}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleResendOTP} disabled={!canResend || isResending}>
            {isResending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={[styles.linkText, !canResend && styles.linkTextDisabled]}>
                {canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    flex: 1,
  },
  otpInput: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  linkTextDisabled: {
    color: COLORS.textSecondary,
  },
})
