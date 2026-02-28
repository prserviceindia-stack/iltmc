import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'ILTMC - Intrepidus Leones Tripura Motorcycle Club',
  description: 'Elite motorcycle club based in Tripura, India. Est. 2013. Brotherhood, Freedom, Respect.',
  keywords: 'motorcycle club, Tripura, ILTMC, bikers, riding club, India',
  openGraph: {
    title: 'ILTMC - Intrepidus Leones Tripura Motorcycle Club',
    description: 'Elite motorcycle club based in Tripura, India. Est. 2013.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
