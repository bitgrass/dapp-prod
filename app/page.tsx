'use client'
 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { useLoginToMiniApp } from '@privy-io/react-auth/farcaster';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
 
export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
 
  const { ready, authenticated } = usePrivy();
  const { initLoginToMiniApp, loginToMiniApp } = useLoginToMiniApp();

  useEffect(() => {
    try {
      sdk.actions.ready();
    } catch (err) {
      console.warn('SDK ready call failed:', err);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ready || hasRedirected) return;
    const init = async () => {

      const isMiniApp = await sdk.isInMiniApp();

      if (isMiniApp) {
        try {
          await sdk.actions.addMiniApp();
        } catch (err) {
          console.warn('addMiniApp skipped:', err);
        }
      }

      if (ready && !authenticated) {
        try {
          if (!isMiniApp) {
            // For web, just redirect
            setHasRedirected(true);
            router.push('/dashboard?tab=overview');
            return;
          }

          // Farcaster login for Mini App
          const { nonce } = await initLoginToMiniApp();
          const result = await sdk.actions.signIn({ nonce });

          await loginToMiniApp({
            message: result.message,
            signature: result.signature,
          });

          // After successful login, redirect
          setHasRedirected(true);
          router.push('/dashboard?tab=overview');
        } catch (err) {
          console.error('Login failed:', err);
          setHasRedirected(true);
          router.push('/dashboard?tab=overview');
        }
      } else if (authenticated) {
        setHasRedirected(true);
        router.push('/dashboard?tab=overview');
      }

      setIsLoading(false);
    };

    init();
  }, [mounted, ready, authenticated, hasRedirected, initLoginToMiniApp, loginToMiniApp, router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #7fc447',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div>Loading Bitgrass...</div>
      </div>
    );
  }
 
  return null;
}
