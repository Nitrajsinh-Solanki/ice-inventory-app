"use client"

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  ScrollView,
} from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../../src/constants/config"
import { useAuth } from "../../src/contexts/AuthContext"
import { searchCustomers, getSearchHistory, saveSearchHistory } from "../../src/services/api"
import type { Customer } from "../../src/types"

interface SearchHistoryItem {
  _id: string
  customerId: string
  customerName: string
  searchedAt: string
}

export default function GoToScreen() {
  const { partner, userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = async () => {
    if (!partner) return

    try {
      const data = await getSearchHistory(partner._id)
      setSearchHistory(data.history || [])
    } catch (error) {
      console.error("Failed to load search history:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userId) {
      Alert.alert("Error", "Please enter a search term")
      return
    }

    try {
      setIsSearching(true)
      setShowResults(true)
      const results = await searchCustomers(userId, searchQuery.trim())
      setSearchResults(results)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to search customers")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowResults(false)

    // Save to search history
    if (partner) {
      try {
        await saveSearchHistory(partner._id, customer._id)
        await loadSearchHistory()
      } catch (error) {
        console.error("Failed to save search history:", error)
      }
    }
  }

  const handleCall = (phone: string) => {
    if (!phone) {
      Alert.alert("Error", "Phone number not available")
      return
    }
    Linking.openURL(`tel:${phone}`)
  }

  const handleOpenMaps = (address: string) => {
    if (!address) {
      Alert.alert("Error", "Address not available")
      return
    }
    const encodedAddress = encodeURIComponent(address)
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    Linking.openURL(url)
  }

  const handleHistoryItemPress = async (item: SearchHistoryItem) => {
    // Find customer from recent search or fetch details
    const existingCustomer = searchResults.find((c) => c._id === item.customerId)
    if (existingCustomer) {
      setSelectedCustomer(existingCustomer)
    } else {
      // You could fetch customer details here if needed
      Alert.alert("Info", "Please search for this customer again")
    }
  }

  const renderSearchResult = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => handleSelectCustomer(item)}>
      <View style={styles.resultHeader}>
        <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultShop}>{item.shopName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  )

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleHistoryItemPress(item)}>
      <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
      <Text style={styles.historyText}>{item.customerName}</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Go To Customer</Text>
        <Text style={styles.subtitle}>Search and navigate to any customer</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, shop, or address"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Search</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showResults ? (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={
              !isSearching ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color={COLORS.border} />
                  <Text style={styles.emptyText}>No customers found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              ) : null
            }
          />
        </View>
      ) : selectedCustomer ? (
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Ionicons name="person-circle" size={60} color={COLORS.primary} />
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.detailsName}>{selectedCustomer.name}</Text>
            <Text style={styles.detailsShop}>{selectedCustomer.shopName}</Text>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              {selectedCustomer.contacts.map((contact, index) => (
                <View key={index} style={styles.contactRow}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.contactText}>{contact}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.addressText}>{selectedCustomer.shopAddress}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(selectedCustomer.contacts[0])}>
                <Ionicons name="call" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.mapsButton]}
                onPress={() => handleOpenMaps(selectedCustomer.shopAddress)}
              >
                <Ionicons name="navigate" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Searches</Text>
          {searchHistory.length > 0 ? (
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.historyList}
            />
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="time-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No search history</Text>
              <Text style={styles.emptySubtext}>Your recent searches will appear here</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchSection: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  resultShop: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailsHeader: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  detailsShop: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  detailsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: "row",
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  mapsButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
