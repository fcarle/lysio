import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'

export const metadata = {
  title: 'Lysio - Provider & Client Platform',
  description: 'Connect with providers and clients',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <Header />
            <div className="pt-16">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <script src="https://tabtitle.io/api/script"></script>
        <script dangerouslySetInnerHTML={{ __html: "new TabTitle('7a7b46e7-8983-42c8-9bf7-06580c839a20');" }} />
      </body>
    </html>
  )
} 