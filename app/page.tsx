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
 
      // 👉 Before auto-login: prompt to add Mini App (ignore errors/rejections)
      if (isMiniApp) {
        try {
          await frameSdk.actions.addMiniApp();
        } catch (err) {
          // RejectedByUser / NotAllowed / manifest/domain issues → continue to login
          console.warn('addMiniApp skipped:', (err as any)?.message ?? err);
        }
      }
 
      if (ready && !authenticated) {
        try {
          if (!isMiniApp) {
            // Web: just go straight to dashboard
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