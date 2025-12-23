"use client";

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
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../../src/constants/config";
import { verifyOTP, getPartnerProfile, resendOTP } from "../../src/services/api";
import { useAuth } from "../../src/contexts/AuthContext";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      // 1️⃣ Verify OTP
      const res = await verifyOTP(String(params.email), otp);

      if (!res.partnerId) {
        Alert.alert("Error", "Invalid OTP");
        return;
      }

      // 2️⃣ Fetch partner profile
      const partnerProfile = await getPartnerProfile(res.partnerId);

      // 3️⃣ Ensure account is approved
      if (partnerProfile.status !== "approved") {
        Alert.alert("Account Not Approved", "Your account is pending approval.");
        router.replace("/(auth)/home");
        return;
      }

      // 4️⃣ Extract adminUserId safely
      const adminUserId =
        partnerProfile.createdByUser
          ? String(partnerProfile.createdByUser)
          : null;

      if (!adminUserId) {
        Alert.alert(
          "Setup Error",
          "Your delivery account is not linked to any admin."
        );
        return;
      }

      // 5️⃣ Save to Auth Context
      await login(partnerProfile, adminUserId);

      // 6️⃣ Go to orders
      router.replace("/(tabs)/orders");
    } catch (error: any) {
      Alert.alert("Verification Failed", "Invalid OTP or server error");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;
    try {
      setIsResending(true);
      await resendOTP(String(params.email));
      Alert.alert("Success", "OTP resent to email");

      setCanResend(false);
      setCountdown(60);
    } catch (error: any) {
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {params.email}
          </Text>
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
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleResendOTP}
            disabled={!canResend || isResending}
          >
            {isResending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text
                style={[
                  styles.linkText,
                  !canResend && styles.linkTextDisabled,
                ]}
              >
                {canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 24 },
  header: { marginTop: 40, marginBottom: 60 },
  backButton: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  form: { flex: 1 },
  otpInput: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 28,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
  linkButton: { marginTop: 24, alignItems: "center" },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  linkTextDisabled: { color: COLORS.textSecondary },
});
