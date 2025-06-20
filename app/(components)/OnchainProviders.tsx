'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';      // ← use Privy’s provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { base } from 'viem/chains';

import { NEXT_PUBLIC_CDP_API_KEY } from './config';
import { useWagmiConfig } from './wagmi';

const queryClient = new QueryClient();

type Props = { children: React.ReactNode };

export default function OnchainProviders({ children }: Props) {
  const wagmiConfig = useWagmiConfig();

  return (
    <PrivyProvider
      appId="cmbqbbsqm00kljy0n1yzjeij7"
      config={{
  "appearance": {
    "accentColor": "#7fc447",
    "theme": "#F5F3EB",
    "showWalletLoginFirst": false,
    "logo": "/assets/images/brand-logos/main-logo.svg",
    "walletChainType": "ethereum-only",
    "walletList": [
      "coinbase_wallet",
      "detected_wallets",
      "metamask",
      "phantom"


    ]
  },
  "loginMethods": [
    "email",
    "wallet",
    "twitter"
  ],
  "fundingMethodConfig": {
    "moonpay": {
      "useSandbox": true
    }
  },
  "embeddedWallets": {
    "requireUserPasswordOnCreate": false,
    "showWalletUIs": true,
    "ethereum": {
      "createOnLogin": "users-without-wallets"
    },
    "solana": {
      "createOnLogin": "users-without-wallets"
    }
  },
  "mfa": {
    "noPromptOnMfaRequired": false
  },
}}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <OnchainKitProvider
            apiKey={NEXT_PUBLIC_CDP_API_KEY}
            chain={base}
            projectId="55dd698a-0763-4455-9c13-3db125f81623"
          >
            <RainbowKitProvider modalSize="compact">
              {children}
            </RainbowKitProvider>
          </OnchainKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
