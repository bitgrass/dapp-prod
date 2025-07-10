'use client'

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const router = useRouter();

  useEffect(() => {
    // 1. Mark Farcaster Frame as ready (if used)
    if (!isFrameReady) {
      setFrameReady();
    }

    // 2. Mark Mini App as ready (this removes Warpcast splash screen)
    sdk.actions.ready();

    // 3. Redirect user to dashboard
    router.push('/dashboard?tab=overview');
  }, [isFrameReady, setFrameReady, router]);

  return null;
}