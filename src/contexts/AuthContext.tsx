"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { DeliveryPartner } from "../types"
import {
  getPartnerData,
  getUserId,
  savePartnerData,
  clearStorage,
  isLoggedIn as checkIsLoggedIn,
} from "../services/storage"
import { getPartnerProfile } from "../services/api"
import { stopLocationTracking } from "../services/location"

interface AuthContextType {
  partner: DeliveryPartner | null
  userId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (partner: DeliveryPartner, userId: string) => Promise<void>
  logout: () => Promise<void>
  refreshPartner: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<DeliveryPartner | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    try {
      const isLoggedIn = await checkIsLoggedIn()

      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      const storedPartner = await getPartnerData()
      const storedUserId = await getUserId()

      if (storedPartner && storedUserId) {
        try {
          const freshPartner = await getPartnerProfile(storedPartner._id)

          if (freshPartner.status === "deleted" || freshPartner.status === "rejected") {
            await logout()
            return
          }

          setPartner(freshPartner)
          setUserId(storedUserId)
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Error verifying partner:", error)
          await logout()
        }
      }
    } catch (error) {
      console.error("Error loading partner data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (partnerData: DeliveryPartner, userIdData: string) => {
    await savePartnerData(partnerData, userIdData)
    setPartner(partnerData)
    setUserId(userIdData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    stopLocationTracking()
    await clearStorage()
    setPartner(null)
    setUserId(null)
    setIsAuthenticated(false)
  }

  const refreshPartner = async () => {
    if (!partner) return

    try {
      const freshPartner = await getPartnerProfile(partner._id)

      if (freshPartner.status === "deleted" || freshPartner.status === "rejected") {
        await logout()
        return
      }

      setPartner(freshPartner)
      await savePartnerData(freshPartner, userId!)
    } catch (error) {
      console.error("Error refreshing partner:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        partner,
        userId,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
