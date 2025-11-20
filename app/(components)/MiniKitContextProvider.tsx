'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { base } from 'viem/chains';
import { NEXT_PUBLIC_CDP_API_KEY } from './config';
import { WagmiProvider } from '@privy-io/wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { useWagmiConfig } from './wagmi';
import { useEffect, useState } from 'react';
import { addRpcUrlOverrideToChain } from '@privy-io/chains';

type Props = { children: ReactNode };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function WagmiWrapper({ children }: { children: ReactNode }) {
  const wagmiConfig = useWagmiConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
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
          {children}
        </MiniKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

// Configure Base chain with custom RPC - using Cloudflare's public Base RPC
const baseWithRpc = addRpcUrlOverrideToChain(base, 'https://base.llamarpc.com');

function OnchainProviders({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId="cmbqbbsqm00kljy0n1yzjeij7"
      config={{
        appearance: {
          landingHeader: 'Carbon Investment Made Easy',
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
        supportedChains: [baseWithRpc],
        defaultChain: baseWithRpc,
      }}
    >
      <WagmiWrapper>
        {children}
      </WagmiWrapper>
    </PrivyProvider>
  );
}

export default OnchainProviders;
