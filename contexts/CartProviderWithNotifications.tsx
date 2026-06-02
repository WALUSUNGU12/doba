'use client'

import { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { NotificationProvider } from './NotificationContext'

interface CartProviderWithNotificationsProps {
  children: ReactNode
}

export function CartProviderWithNotifications({ children }: CartProviderWithNotificationsProps) {
  return (
    <NotificationProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </NotificationProvider>
  )
}
