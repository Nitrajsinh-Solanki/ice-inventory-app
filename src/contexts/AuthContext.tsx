"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { DeliveryPartner } from "../types";
import {
  getPartnerData,
  getAdminUserId,
  savePartnerData,
  clearStorage,
  isLoggedIn as checkIsLoggedIn,
} from "../services/storage";
import { getPartnerProfile } from "../services/api";
import { stopLocationTracking } from "../services/location";

interface AuthContextType {
  partner: DeliveryPartner | null;
  adminUserId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (partner: DeliveryPartner, adminUserId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      const loggedIn = await checkIsLoggedIn();
      if (!loggedIn) return setIsLoading(false);

      const storedPartner = await getPartnerData();
      const storedAdminId = await getAdminUserId();

      if (!storedPartner || !storedAdminId) {
        setIsLoading(false);
        return;
      }

      const freshPartner = await getPartnerProfile(storedPartner._id);

      if (freshPartner.status === "deleted" || freshPartner.status === "rejected") {
        await logout();
        return;
      }

      setPartner(freshPartner);
      setAdminUserId(storedAdminId);
      setIsAuthenticated(true);
    } catch {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (partner: DeliveryPartner, adminUserId: string) => {
    await savePartnerData(partner, adminUserId);
    setPartner(partner);
    setAdminUserId(adminUserId);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    stopLocationTracking();
    await clearStorage();
    setPartner(null);
    setAdminUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ partner, adminUserId, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
