'use client';

import { useMemo } from 'react';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

import { createConfig as createPrivyConfig } from '@privy-io/wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export function useWagmiConfig() {
  return useMemo(() => {
    // Direct connectors without RainbowKit to avoid WalletConnect
    const connectors = [
      coinbaseWallet({
        appName: 'Bitgrass',
        preference: 'smartWalletOnly',
      }),
      farcasterMiniApp(),
    ];

    return createPrivyConfig({
      chains: [base],
      connectors,
      multiInjectedProviderDiscovery: true,
      ssr: true,
      transports: { 
        [base.id]: http('https://base.llamarpc.com', {
          batch: true,
          retryCount: 3,
        })
      },
    });
  }, []);
}
