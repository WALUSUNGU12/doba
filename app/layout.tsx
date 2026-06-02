import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProviderWithNotifications } from '@/contexts/CartProviderWithNotifications'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DOBADoba - Mzuzu\'s Local Marketplace',
  description: 'Connect with local sellers in Mzuzu. Buy and sell goods with GPS-tracked delivery services.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <CartProviderWithNotifications>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </CartProviderWithNotifications>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
