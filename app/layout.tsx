import type { Metadata } from 'next';
import "./globals.scss";
import Script from 'next/script';
import dynamic from "next/dynamic";

// Dynamically import providers to handle blockchain-specific functionality
const ClientProviders = dynamic(
  () => import("./ClientProviders"),
  {
    ssr: false,
  }
);

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Bitgrass - Tokenized Carbon Credits',
    description: 'Carbon Credit and RWA',
    other: {
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: 'https://dev.bitgrass.com/image.png',
        button: {
          title: 'Launch Bitgrass',
          action: {
            type: 'launch_miniapp',
            name: 'Bitgrass',
            url: 'https://dev.bitgrass.com',
            splashImageUrl: 'https://dev.bitgrass.com/splash.png',
            splashBackgroundColor: '#eeccff',
          },
        },
      }),
    },
  };
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Prevent dark mode flash - apply dark class immediately (dark is default) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isLight = localStorage.getItem('ynexlighttheme') === 'light';
                if (!isLight) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-header-styles', 'dark');
                  document.documentElement.setAttribute('data-menu-styles', 'dark');
                }
              })();
            `,
          }}
        />
        {/* PWA Meta + Icons */}
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {/* Google Tag Manager - Script */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXXX');`,
          }}
        />
        
        {/* Google Tag Manager - NoScript (for users with JS disabled) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
