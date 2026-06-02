'use client'

import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'

export function useCartWithNotifications() {
  const { addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getTotalWeight, items } = useCart()
  const { addNotification } = useNotification()

  const addItemWithNotification = (product: any, quantity: number = 1) => {
    // Check if item already exists in cart
    const existingItem = items.find(item => item.product_id === product.product_id)
    
    // Add item to cart
    addItem(product, quantity)
    
    // Show appropriate notification
    if (existingItem) {
      addNotification(
        `${product.product_name} quantity updated (${existingItem.quantity + quantity} total)`,
        'success',
        3000
      )
    } else {
      addNotification(
        `${product.product_name} added to cart!`,
        'success',
        3000
      )
    }
  }

  return {
    addItem: addItemWithNotification,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalWeight,
    items
  }
}
