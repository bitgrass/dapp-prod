'use client'

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { sdk as frameSdk } from '@farcaster/miniapp-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { useLoginToFrame } from '@privy-io/react-auth/farcaster';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const router = useRouter();

  const { ready, authenticated } = usePrivy();
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();

  useEffect(() => {
    const doLogin = async () => {
      if (!isFrameReady) setFrameReady();
      frameSdk.actions.ready();

      const isMiniApp = await frameSdk.isInMiniApp();

      // Prompt to add Mini App (ignore rejections)
      if (isMiniApp) {
        try {
          await frameSdk.actions.addMiniApp();
        } catch (err) {
          console.warn('addMiniApp skipped:', (err as any)?.message ?? err);
        }
      }

      if (ready && !authenticated) {
        try {
          if (!isMiniApp) {
            router.push('/dashboard?tab=overview');
            return;
          }

          const { nonce } = await initLoginToFrame();
          const result = await frameSdk.actions.signIn({ nonce });
          console.log("SignIn result:", result);

          await loginToFrame({
            message: result.message,
            signature: result.signature,
          });

          // ⬇️ NEW: get FID from Mini App context (your SDK exposes context as a Promise)
          try {
            const ctx: any = await (frameSdk as any).context; // in your SDK version, context is a Promise
            const fid = ctx?.user?.fid ?? ctx?.viewer?.fid;
            if (fid) {
              // Hit your server route to send a targeted welcome notification
              await fetch('/api/neynar-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fid,
                  title: '👋 Welcome!',
                  body: 'Thanks for adding our Mini App 🎉',
                  target_url: `${process.env.NEXT_PUBLIC_MINIAPP_BASE_URL}/dashboard?tab=overview`,
                }),
              });
            }
          } catch (e) {
            console.warn('Could not resolve FID from frame context:', e);
          }

          console.log("✅ Farcaster auto-login successful");
          router.push('/dashboard?tab=overview');
        } catch (err) {
          console.error("❌ Farcaster login failed:", err);
          router.push('/dashboard?tab=overview');
        }
      } else if (authenticated) {
        router.push('/dashboard?tab=overview');
      }
    };

    doLogin();
  }, [isFrameReady, setFrameReady, ready, authenticated, initLoginToFrame, loginToFrame, router]);

  return null;

}
