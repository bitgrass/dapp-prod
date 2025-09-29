import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useWalletClient } from 'wagmi'

function ensureSendTransaction(client: any) {
  if (!client) return client;

  // Already has sendTransaction
  if (typeof client.sendTransaction === "function") {
    return client;
  }

  // Wrap .request into a signer-like object
  return {
    ...client,
    sendTransaction: async (tx: any) => {
      return client.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
    },
    signMessage: async (msg: any) => {
      return client.request({
        method: "personal_sign",
        params: [msg],
      });
    },
  };
}


// Keep existing useFarcasterWallet hook as is...
function useFarcasterWallet(fid?: number) {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (!fid) return

    const fetchWallet = async () => {
      try {
        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
          {
            headers: {
              'Content-Type': 'application/json',
              api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY!,
            },
          }
        )

        if (!res.ok) {
          console.error('Failed Neynar response:', res.status, await res.text())
          setAddress(null)
          return
        }

        const data = await res.json()
        const user = data?.users?.[0]
        if (!user) {
          setAddress(null)
          return
        }

        const verified = (user?.verified_addresses?.eth_addresses || []).map((a: string) =>
          a.toLowerCase()
        )
        const auth = (user?.auth_addresses || []).map((obj: any) =>
          obj.address.toLowerCase()
        )

        const intersection = verified.find((addr: any) => auth.includes(addr))
        setAddress(intersection || null)
      } catch (err) {
        console.error('Failed to fetch Farcaster wallet via Neynar:', err)
        setAddress(null)
      }
    }

    fetchWallet()
  }, [fid])

  return address
}

// Keep existing useEnsureEmbeddedWallet hook...
export function useEnsureEmbeddedWallet() {
  const { user, authenticated, createWallet } = usePrivy()
  const creatingWallet = useRef(false)
  const walletCreated = useRef(false)

  useEffect(() => {
    if (!authenticated || !user || creatingWallet.current || walletCreated.current) {
      return
    }

    const ensureWallet = async () => {
      const hasAnyWallet = user.linkedAccounts.some(
        account => account.type === 'wallet'
      )

      if (!hasAnyWallet) {
        creatingWallet.current = true

        try {
          await createWallet()
          walletCreated.current = true
          console.log('✅ Embedded wallet created successfully')
        } catch (error) {
          console.error('❌ Failed to create embedded wallet:', error)
          creatingWallet.current = false
        }
      }
    }

    ensureWallet()
  }, [authenticated, user?.id, createWallet])

  useEffect(() => {
    creatingWallet.current = false
    walletCreated.current = false
  }, [user?.id])
}

function isFarcasterMiniapp(): boolean {
  if (typeof window === 'undefined') return false

  return !!(
    window.parent !== window ||
    (window as any).farcaster ||
    window.location.href.includes('farcaster') ||
    document.referrer.includes('warpcast.com') ||
    navigator.userAgent.includes('Warpcast') ||
    window.location.hostname.includes('warpcast') ||
    window.location.search.includes('frame') ||
    window.self !== window.top
  )
}

// Keep existing useFarcasterProvider hook as is...
function useFarcasterProvider(farcasterWallet: string | null) {
  const [provider, setProvider] = useState<any>(null)
  const [providerError, setProviderError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!farcasterWallet) {
      setProvider(null)
      setProviderError(null)
      return
    }

    const setupProvider = async () => {
      setIsLoading(true)
      setProviderError(null)

      try {
        // All existing provider setup logic...
        // (keeping it short for brevity - use your existing implementation)
        const proxyProvider = {
          isProxy: true,
          targetAddress: farcasterWallet,
          request: async (args: any) => {
            if (args.method === "eth_accounts") {
              return [farcasterWallet];
            }

            if (args.method === "eth_sendTransaction" || args.method === "personal_sign") {
              if ((window as any).ethereum?.request) {
                return (window as any).ethereum.request(args); // ✅ forward to Warpcast injected provider
              }
              throw new Error("Warpcast provider not available");
            }

            return (window as any).ethereum?.request(args) ?? [];
          },
          getChainId: () => 8453,
        };


        setProvider(proxyProvider)
        setProviderError('Farcaster wallet requires manual connection for signing')

      } catch (error) {
        console.error('❌ Failed to setup Farcaster provider:', error)
        setProviderError(error instanceof Error ? error.message : 'Unknown error')
        setProvider(null)
      } finally {
        setIsLoading(false)
      }
    }

    setupProvider()
  }, [farcasterWallet])

  return { provider, providerError, isLoading }
}

/**
 * IMPROVED: Stable wallet connection with proper loading states
 */
export function useConnectedAddress() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const { address: wagmiAddress } = useAccount()
  const { data: wagmiClient } = useWalletClient()

  const farcaster = user?.farcaster as any
  const farcasterWallet = useFarcasterWallet(farcaster?.fid)
  const isMinitapp = isFarcasterMiniapp()

  const {
    provider: fcProvider,
    providerError: fcProviderError,
    isLoading: fcProviderLoading
  } = useFarcasterProvider(farcasterWallet)

  // CRITICAL FIX: Add loading states and stable address resolution
  const [isWalletsLoading, setIsWalletsLoading] = useState(true)
  const [stableAddress, setStableAddress] = useState<string | undefined>(undefined)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [clientReady, setClientReady] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  // Track when wallets have finished loading
  useEffect(() => {
    // Consider wallets loaded when we have user and either:
    // 1. We have wallets, or 
    // 2. We've waited enough time and still have no wallets
    if (user) {
      const timer = setTimeout(() => {
        setIsWalletsLoading(false)
      }, 1000) // Give wallets 1 second to load

      if (wallets.length > 0) {
        setIsWalletsLoading(false)
        clearTimeout(timer)
      }

      return () => clearTimeout(timer)
    } else {
      setIsWalletsLoading(true)
    }
  }, [user, wallets.length])

  useEnsureEmbeddedWallet()

  // CRITICAL FIX: Stable address resolution that doesn't change on every render
  useEffect(() => {
    // Don't resolve address until wallets are loaded
    if (isWalletsLoading) {
      console.log('⏳ Waiting for wallets to load...')
      return
    }

    const resolveStableAddress = () => {
      console.log('🔍 Resolving stable address...', {
        isMinitapp,
        farcasterWallet,
        walletsCount: wallets.length,
        wagmiAddress
      })

      // In Farcaster miniapp: ALWAYS use Farcaster wallet if available
      if (isMinitapp && farcasterWallet) {
        console.log('🎯 Using Farcaster wallet in miniapp:', farcasterWallet)
        setStableAddress(farcasterWallet as `0x${string}`)
        return
      }

      // In other environments: External wallet → Embedded wallet → Fallbacks

      // Priority 1: External wallet (non-privy)
      const externalWallet = wallets.find(w => w.walletClientType !== 'privy' && w.address)
      if (externalWallet?.address) {
        console.log('🎯 Using external wallet:', externalWallet.address)
        setStableAddress(externalWallet.address as `0x${string}`)
        return
      }

      // Priority 2: Embedded wallet (privy)
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy' && w.address)
      if (embeddedWallet?.address) {
        console.log('🎯 Using embedded wallet:', embeddedWallet.address)
        setStableAddress(embeddedWallet.address as `0x${string}`)
        return
      }

      // Priority 3: wagmi address fallback
      if (wagmiAddress) {
        console.log('🎯 Using wagmi address:', wagmiAddress)
        setStableAddress(wagmiAddress)
        return
      }

      // Priority 4: user wallet fallback
      if ((user as any)?.wallet?.address) {
        console.log('🎯 Using user wallet fallback:', (user as any).wallet.address)
        setStableAddress((user as any).wallet.address as `0x${string}`)
        return
      }

      console.log('❌ No wallet address found')
      setStableAddress(undefined)
    }

    resolveStableAddress()
  }, [isWalletsLoading, isMinitapp, farcasterWallet, wallets, wagmiAddress, user])

  // Resolve wallet client based on stable address
  useEffect(() => {
    const resolveWalletClient = async () => {
      try {
        setClientReady(false)
        setClientError(null)

        console.log('🔍 Resolving wallet client for:', stableAddress)

        // In Farcaster miniapp using Farcaster wallet
        if (isMinitapp && farcasterWallet && stableAddress === farcasterWallet) {
          if (fcProviderLoading) {
            console.log('⏳ Waiting for Farcaster provider...')
            return
          }

          if (fcProvider) {
            console.log('✅ Using Farcaster wallet provider')
            setWalletClient(ensureSendTransaction(fcProvider));
            setClientError(fcProviderError)
            setClientReady(true)
            return
          }

          if (fcProviderError) {
            console.error('❌ Farcaster provider error:', fcProviderError)
            setWalletClient(null)
            setClientError(`Cannot access Farcaster wallet: ${fcProviderError}`)
            setClientReady(true)
            return
          }

          console.log('❌ No Farcaster provider available')
          setWalletClient(null)
          setClientError('Farcaster wallet not accessible for signing')
          setClientReady(true)
          return
        }

        // For non-Farcaster scenarios, use wagmi client first
        if (wagmiClient) {
          console.log('✅ Using wagmi client')
          setWalletClient(wagmiClient)
          setClientReady(true)
          return
        }

        // Try to get client from matching wallet
        if (stableAddress) {
          const matchingWallet = wallets.find(w =>
            w.address?.toLowerCase() === stableAddress.toLowerCase()
          )

          if (matchingWallet?.getEthereumProvider) {
            const provider = await matchingWallet.getEthereumProvider()
            if (provider) {
              setWalletClient(provider)
              setClientReady(true)
              console.log('✅ Got provider from matching wallet')
              return
            }
          }

          if ((matchingWallet as any)?.walletClient) {
            setWalletClient((matchingWallet as any).walletClient)
            setClientReady(true)
            console.log('✅ Got walletClient from matching wallet')
            return
          }
        }

        console.log('❌ No client found')
        setWalletClient(null)
        setClientReady(true)
      } catch (error) {
        console.error('❌ Error resolving wallet client:', error)
        setWalletClient(null)
        setClientError(error instanceof Error ? error.message : 'Unknown error')
        setClientReady(true)
      }
    }

    if (stableAddress !== undefined) { // Only resolve when we have a stable address (could be null)
      resolveWalletClient()
    }
  }, [stableAddress, isMinitapp, farcasterWallet, wallets, wagmiClient, fcProvider, fcProviderError, fcProviderLoading])

  const shortAddress = useMemo(
    () =>
      stableAddress
        ? `${stableAddress.slice(0, 6)}…${stableAddress.slice(-4)}`
        : '',
    [stableAddress]
  )

  return useMemo(() => ({
    address: stableAddress,
    client: walletClient,
    clientReady: clientReady && !isWalletsLoading, // Don't mark ready until wallets load
    clientError,
    shortAddress,
    farcasterWallet,
    isMinitapp,
    isLoading: isWalletsLoading, // Add explicit loading state
    hasExternalWallet: wallets.some(w => w.walletClientType !== 'privy'),
    hasEmbeddedWallet: wallets.some(w => w.walletClientType === 'privy'),
    isUsingExternalWallet: stableAddress && wallets.some(w =>
      w.walletClientType !== 'privy' &&
      w.address?.toLowerCase() === stableAddress.toLowerCase()
    ),
    isUsingFarcasterWallet: stableAddress === farcasterWallet,
    farcasterProviderError: fcProviderError,
    needsWalletConnection: isMinitapp && farcasterWallet && !fcProvider && !fcProviderError,
    _debug: {
      isWalletsLoading,
      walletsCount: wallets.length,
      wagmiClientAvailable: !!wagmiClient,
      stableAddress,
      priorityUsed: isMinitapp && farcasterWallet === stableAddress ? 'farcaster-wallet' :
        wallets.some(w => w.walletClientType !== 'privy' && w.address?.toLowerCase() === stableAddress?.toLowerCase()) ? 'external' :
          wallets.some(w => w.walletClientType === 'privy' && w.address?.toLowerCase() === stableAddress?.toLowerCase()) ? 'embedded' :
            'fallback'
    }
  }), [
    stableAddress,
    walletClient,
    clientReady,
    clientError,
    shortAddress,
    farcasterWallet,
    isMinitapp,
    isWalletsLoading,
    wallets,
    wagmiClient,
    fcProvider,
    fcProviderError,
    fcProviderLoading
  ])
}