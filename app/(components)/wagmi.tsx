'use client';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

/* 👉  Get createConfig and WagmiProvider from Privy’s package */
import { createConfig as createPrivyConfig } from '@privy-io/wagmi';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    throw new Error(
      'Set NEXT_PUBLIC_WC_PROJECT_ID in your env to enable WalletConnect.',
    );
  }

  return useMemo(() => {
    // RainbowKit wallets
    const rainbowConnectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [coinbaseWallet],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet, metaMaskWallet],
        },
      ],
      {
        appName: 'Bitgrass',
        projectId,
      },
    );

    // Privy’s createConfig auto-adds PrivyConnector
    return createPrivyConfig({
      chains: [base],
      connectors: rainbowConnectors,
      multiInjectedProviderDiscovery: false,
      ssr: true,
      transports: { [base.id]: http() },
    });
  }, [projectId]);
}
