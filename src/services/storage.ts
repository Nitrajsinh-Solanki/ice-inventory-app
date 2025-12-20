import AsyncStorage from "@react-native-async-storage/async-storage"
import type { DeliveryPartner } from "../types"

const KEYS = {
  PARTNER: "delivery_partner",
  USER_ID: "user_id",
  IS_LOGGED_IN: "is_logged_in",
}

export const savePartnerData = async (partner: DeliveryPartner, userId: string) => {
  try {
    await AsyncStorage.setItem(KEYS.PARTNER, JSON.stringify(partner))
    await AsyncStorage.setItem(KEYS.USER_ID, userId)
    await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, "true")
  } catch (error) {
    console.error("Error saving partner data:", error)
    throw error
  }
}

export const getPartnerData = async (): Promise<DeliveryPartner | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PARTNER)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error getting partner data:", error)
    return null
  }
}

export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.USER_ID)
  } catch (error) {
    console.error("Error getting user ID:", error)
    return null
  }
}

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN)
    return value === "true"
  } catch (error) {
    return false
  }
}

export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.PARTNER, KEYS.USER_ID, KEYS.IS_LOGGED_IN])
  } catch (error) {
    console.error("Error clearing storage:", error)
    throw error
  }
}
