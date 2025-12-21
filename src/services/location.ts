import * as Location from "expo-location"
import { getPartnerData } from "./storage"
import { updateLocation } from "./api"
import { LOCATION_UPDATE_INTERVAL } from "../constants/config"

let locationInterval: NodeJS.Timeout | null = null

export const requestLocationPermissions = async () => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()

    if (foregroundStatus !== "granted") {
      throw new Error("Foreground location permission denied")
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()

    if (backgroundStatus !== "granted") {
      console.warn("Background location permission denied")
    }

    return { foregroundStatus, backgroundStatus }
  } catch (error) {
    console.error("Error requesting location permissions:", error)
    throw error
  }
}

export const startLocationTracking = async () => {
  try {
    const partner = await getPartnerData()
    if (!partner) {
      console.error("No partner data found for location tracking")
      return
    }

    // Clear existing interval if any
    if (locationInterval) {
      clearInterval(locationInterval)
    }

    // Start location updates
    locationInterval = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const lat = location.coords.latitude
        const lng = location.coords.longitude

        if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
          console.error("Invalid coordinates:", { lat, lng })
          return
        }

        await updateLocation(partner._id, lat, lng)
      } catch (error: any) {
        if (error?.response?.status !== 400 && error?.response?.status !== 403) {
          console.error("Error updating location:", error?.message || error)
        }
      }
    }, LOCATION_UPDATE_INTERVAL)

    console.log("Location tracking started")
  } catch (error) {
    console.error("Error starting location tracking:", error)
    throw error
  }
}

export const stopLocationTracking = () => {
  if (locationInterval) {
    clearInterval(locationInterval)
    locationInterval = null
    console.log("Location tracking stopped")
  }
}

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
  } catch (error) {
    console.error("Error getting current location:", error)
    throw error
  }
}
