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

interface ProductSuggestion extends Suggestion {
  productId: string
}

export default function StickyNoteScreen() {
  const { partner, userId } = useAuth()
  const [customerName, setCustomerName] = useState("")
  const [productName, setProductName] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [customerSuggestions, setCustomerSuggestions] = useState<Suggestion[]>([])
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([])
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
    setSelectedProductId("")

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
        productId: product._id,
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

  const handleSelectProduct = (suggestion: ProductSuggestion) => {
    setProductName(suggestion.name)
    setSelectedProductId(suggestion.productId)
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
    if (!selectedProductId) {
      Alert.alert("Validation Error", "Please select a product from suggestions")
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
        items: [
          {
            productId: selectedProductId,
            quantity: Number(quantity),
          },
        ],
        notes: notes.trim(),
      })

      Alert.alert("Success", "Sticky note order created successfully", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName("")
            setProductName("")
            setSelectedProductId("")
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
          setSelectedProductId("")
          setQuantity("")
          setNotes("")
        },
      },
    ])
  }

  const renderSuggestion = ({ item }: { item: Suggestion | ProductSuggestion }, onSelect: (item: any) => void) => (
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
            This order will be visible to the manager and can be processed from the admin dashboard.
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
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  form: {
    padding: 20,
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  notesInput: {
    alignItems: "flex-start",
  },
  notesIcon: {
    marginTop: 4,
  },
  notesTextInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    maxHeight: 200,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
})
