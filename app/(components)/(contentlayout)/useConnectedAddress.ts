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
  const { user, ready, authenticated } = usePrivy()
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
    // Use Privy's ready state - when Privy is ready, we can determine wallet state
    if (!ready) {
      setIsWalletsLoading(true)
      return
    }

    // Privy is ready - check wallet state
    if (wallets.length > 0) {
      // Wallets detected - done loading immediately
      console.log('✅ Wallets detected, marking as loaded')
      setIsWalletsLoading(false)
      return
    }

    // No wallets yet - give a brief moment for wallets to populate
    // This handles the case where Privy is ready but wallets array hasn't updated yet
    const timer = setTimeout(() => {
      console.log('✅ No wallets detected after brief wait, marking as loaded')
      setIsWalletsLoading(false)
    }, 100) // 100ms to let wallets array populate

    return () => clearTimeout(timer)
  }, [ready, wallets.length])

  useEnsureEmbeddedWallet()

  // CRITICAL FIX: Stable address resolution that doesn't change on every render
  useEffect(() => {
    // Don't resolve address until wallets are loaded
    if (isWalletsLoading) {
      console.log('⏳ Waiting for wallets to load...')
      return
    }

    // If not authenticated, clear address immediately
    if (!authenticated) {
      console.log('❌ Not authenticated - clearing address')
      setStableAddress(undefined)
      return
    }

    const resolveStableAddress = () => {
      console.log('🔍 Resolving stable address...', {
        isMinitapp,
        farcasterWallet,
        walletsCount: wallets.length,
        wagmiAddress,
        authenticated,
        allWallets: wallets.map(w => ({
          address: w.address,
          type: w.walletClientType,
          connected: (w as any).connected,
          connectorType: (w as any).connectorType,
          walletBrand: (w as any).walletBrand
        }))
      })

      // In Farcaster miniapp environment: ONLY use Farcaster wallet
      if (isMinitapp) {
        if (farcasterWallet) {
          console.log('🎯 Using Farcaster wallet in miniapp:', farcasterWallet)
          setStableAddress(farcasterWallet as `0x${string}`)
          return
        } else {
          console.log('⚠️ In miniapp but no Farcaster wallet found')
          setStableAddress(undefined)
          return
        }
      }

      // In regular web (outside Farcaster): Use ACTIVE wallet only
      
      // Priority 1: Use wagmi's active address (this is the currently connected wallet)
      if (wagmiAddress) {
        // Find the wallet that matches this address to get its type
        const activeWallet = wallets.find(w => 
          w.address?.toLowerCase() === wagmiAddress.toLowerCase()
        )
        
        if (activeWallet) {
          console.log('🎯 Using active wallet from wagmi:', wagmiAddress, {
            walletClientType: activeWallet.walletClientType,
            isExternal: activeWallet.walletClientType !== 'privy',
            isEmbedded: activeWallet.walletClientType === 'privy'
          })
        } else {
          console.log('🎯 Using wagmi address (no matching wallet found):', wagmiAddress)
        }
        
        setStableAddress(wagmiAddress)
        return
      }

      // Priority 2: If no wagmi address, try to find any connected external wallet
      const externalWallet = wallets.find(w => 
        w.walletClientType !== 'privy' && 
        w.address &&
        (w as any).connected === true // Must be explicitly connected
      )
      if (externalWallet?.address) {
        console.log('🎯 Using connected external wallet:', externalWallet.address, {
          walletClientType: externalWallet.walletClientType,
          connected: (externalWallet as any).connected
        })
        setStableAddress(externalWallet.address as `0x${string}`)
        return
      }

      // Priority 3: If no external, try embedded wallet
      const embeddedWallet = wallets.find(w => 
        w.walletClientType === 'privy' && 
        w.address &&
        (w as any).connected === true // Must be explicitly connected
      )
      if (embeddedWallet?.address) {
        console.log('🎯 Using connected embedded wallet:', embeddedWallet.address, {
          walletClientType: embeddedWallet.walletClientType,
          connected: (embeddedWallet as any).connected
        })
        setStableAddress(embeddedWallet.address as `0x${string}`)
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
  }, [isWalletsLoading, isMinitapp, farcasterWallet, wallets, wagmiAddress, user, authenticated])

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
      wagmiAddress,
      wagmiClientAvailable: !!wagmiClient,
      stableAddress,
      priorityUsed: isMinitapp && farcasterWallet === stableAddress ? 'farcaster-wallet' :
        stableAddress === wagmiAddress ? 'wagmi-active' :
        wallets.some(w => w.walletClientType !== 'privy' && w.address?.toLowerCase() === stableAddress?.toLowerCase()) ? 'external' :
          wallets.some(w => w.walletClientType === 'privy' && w.address?.toLowerCase() === stableAddress?.toLowerCase()) ? 'embedded' :
            'fallback',
      allWallets: wallets.map(w => ({
        address: w.address?.slice(0, 10) + '...',
        type: w.walletClientType,
        isActive: w.address?.toLowerCase() === stableAddress?.toLowerCase()
      }))
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