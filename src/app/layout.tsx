import './globals.css'
import 'rsuite/dist/rsuite-no-reset.min.css';
import type { Metadata } from 'next'
import ClientOnlyScripts from '@/components/ClientOnlyScripts'

export const metadata: Metadata = {
  title: 'stock-admin',
  description: 'Stock management admin system',
  icons: { icon: '/assets/img/logo/PLC.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/assets/img/logo/PLC.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="/assets/css/vendor.min.css" rel="stylesheet" />
        <link href="/assets/css/default/app.min.css" rel="stylesheet" />
      </head>
      <body className="pace-top">
        {children}
        <ClientOnlyScripts />
      </body>
    </html>
  )
}
