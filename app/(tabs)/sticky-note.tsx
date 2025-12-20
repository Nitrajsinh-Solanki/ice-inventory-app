"use client"

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../../src/constants/config"
import { useAuth } from "../../src/contexts/AuthContext"
import { createStickyNoteOrder, searchCustomers, searchProducts } from "../../src/services/api"

interface Suggestion {
  id: string
  name: string
}

export default function StickyNoteScreen() {
  const { partner, userId } = useAuth()
  const [customerName, setCustomerName] = useState("")
  const [productName, setProductName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [customerSuggestions, setCustomerSuggestions] = useState<Suggestion[]>([])
  const [productSuggestions, setProductSuggestions] = useState<Suggestion[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)

  const handleCustomerSearch = async (text: string) => {
    setCustomerName(text)

    if (text.length < 2 || !userId) {
      setCustomerSuggestions([])
      setShowCustomerSuggestions(false)
      return
    }

    try {
      setIsSearchingCustomers(true)
      const results = await searchCustomers(userId, text)
      const suggestions = results.map((customer) => ({
        id: customer._id,
        name: customer.name,
      }))
      setCustomerSuggestions(suggestions)
      setShowCustomerSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error("Customer search error:", error)
    } finally {
      setIsSearchingCustomers(false)
    }
  }

  const handleProductSearch = async (text: string) => {
    setProductName(text)

    if (text.length < 2 || !userId) {
      setProductSuggestions([])
      setShowProductSuggestions(false)
      return
    }

    try {
      setIsSearchingProducts(true)
      const results = await searchProducts(userId, text)
      const suggestions = results.map((product: any) => ({
        id: product._id,
        name: product.name,
      }))
      setProductSuggestions(suggestions)
      setShowProductSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error("Product search error:", error)
    } finally {
      setIsSearchingProducts(false)
    }
  }

  const handleSelectCustomer = (suggestion: Suggestion) => {
    setCustomerName(suggestion.name)
    setShowCustomerSuggestions(false)
  }

  const handleSelectProduct = (suggestion: Suggestion) => {
    setProductName(suggestion.name)
    setShowProductSuggestions(false)
  }

  const validateForm = () => {
    if (!customerName.trim()) {
      Alert.alert("Validation Error", "Please enter customer name")
      return false
    }
    if (!productName.trim()) {
      Alert.alert("Validation Error", "Please enter product name")
      return false
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid quantity")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !partner || !userId) return

    try {
      setIsSubmitting(true)
      await createStickyNoteOrder(partner._id, userId, {
        customerName: customerName.trim(),
        productName: productName.trim(),
        quantity: Number(quantity),
        notes: notes.trim(),
      })

      Alert.alert("Success", "Sticky note order created successfully", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName("")
            setProductName("")
            setQuantity("")
            setNotes("")
          },
        },
      ])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create sticky note order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    Alert.alert("Reset Form", "Are you sure you want to clear all fields?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setCustomerName("")
          setProductName("")
          setQuantity("")
          setNotes("")
        },
      },
    ])
  }

  const renderSuggestion = ({ item }: { item: Suggestion }, onSelect: (item: Suggestion) => void) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => onSelect(item)}>
      <Ionicons name="search" size={16} color={COLORS.textSecondary} />
      <Text style={styles.suggestionText}>{item.name}</Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Ionicons name="create-outline" size={32} color={COLORS.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Create Sticky Note</Text>
          <Text style={styles.subtitle}>Add a new order for the manager</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Customer Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter or search customer name"
              value={customerName}
              onChangeText={handleCustomerSearch}
              autoCapitalize="words"
            />
            {isSearchingCustomers && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
          {showCustomerSuggestions && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={customerSuggestions}
                renderItem={(props) => renderSuggestion(props, handleSelectCustomer)}
                keyExtractor={(item) => item.id}
                style={styles.suggestionsList}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Product Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cube-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter or search product name"
              value={productName}
              onChangeText={handleProductSearch}
              autoCapitalize="words"
            />
            {isSearchingProducts && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
          {showProductSuggestions && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={productSuggestions}
                renderItem={(props) => renderSuggestion(props, handleSelectProduct)}
                keyExtractor={(item) => item.id}
                style={styles.suggestionsList}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Quantity <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calculator-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <View style={[styles.inputContainer, styles.notesInput]}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} style={styles.notesIcon} />
            <TextInput
              style={[styles.input, styles.notesTextInput]}
              placeholder="Add any additional information"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={isSubmitting}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.error} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Create Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            This order will be visible on the manager's dashboard and can be processed accordingly.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  notesInput: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesTextInput: {
    minHeight: 100,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    maxHeight: 200,
  },
  suggestionsList: {
    padding: 4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
})
