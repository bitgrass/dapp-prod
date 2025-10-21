'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { base } from 'viem/chains';
import { NEXT_PUBLIC_CDP_API_KEY } from './config';
import { WagmiProvider } from '@privy-io/wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useWagmiConfig } from './wagmi';

type Props = { children: ReactNode };

const queryClient = new QueryClient();

function PrivyWrapper({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId="cmbqbbsqm00kljy0n1yzjeij7"
      config={{
        appearance: {
          accentColor: '#7fc447',
          theme: '#F5F3EB',
          logo: '/assets/images/brand-logos/main-logo.svg',
          walletChainType: 'ethereum-only',
          walletList: [
            'coinbase_wallet',
            'metamask',
            'phantom',
          ],
        },
        loginMethods: [
          'email',
          'wallet',
          'twitter',

        ],
        fundingMethodConfig: {
          moonpay: { useSandbox: true },
        },
        embeddedWallets: {
          showWalletUIs: false,
          ethereum: { createOnLogin: 'off' },
        },
        supportedChains: [base],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

function OnchainProviders({ children }: Props) {
  const wagmiConfig = useWagmiConfig();

  return (
    <PrivyWrapper>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <MiniKitProvider
            apiKey={NEXT_PUBLIC_CDP_API_KEY}
            chain={base as any}
            projectId="55dd698a-0763-4455-9c13-3db125f81623"
            config={{
              appearance: { theme: 'base', mode: 'light' },
              wallet: {
                display: 'modal',
                termsUrl: '#',
                privacyUrl: '#',
              },
            }}
          >
            <RainbowKitProvider modalSize="compact">
              {children}
            </RainbowKitProvider>
          </MiniKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyWrapper>
  );
}

export default OnchainProviders;
