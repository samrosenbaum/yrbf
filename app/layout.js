import './globals.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Your AI Boyfriend',
  description: 'Talk with your AI boyfriend anytime ❤️',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-14BGC467G0"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-14BGC467G0');

              // Custom event function to fire events
              window.trackEvent = function (action, label = '') {
                gtag('event', action, {
                  event_category: 'Chat',
                  event_label: label,
                });
              };
            `,
          }}
        />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
