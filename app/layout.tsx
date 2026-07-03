import './globals.css'
import { Toaster } from 'sonner'
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'BillMate Pro — GST Billing Suite',
  description: 'Professional GST billing for modern commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster richColors position="top-right" toastOptions={{
          className: 'toast-animate',
          style: {
            background: '#171f33',
            color: '#dae2fd',
            border: '1px solid #464554',
          }
        }} />
      </body>
    </html>
  )
}
