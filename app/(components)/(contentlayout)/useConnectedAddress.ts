import { useState, useEffect, useMemo, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useWalletClient } from 'wagmi'

function ensureSendTransaction(client: any) {
  if (!client) return client;

  const hasRequest = typeof client.request === "function";
  const hasSendTransaction = typeof client.sendTransaction === "function";
  
  if (hasRequest && hasSendTransaction) {
    return client;
  }

  const wrappedClient = {
    ...client,
    request: hasRequest ? client.request.bind(client) : async (args: any) => {
      if (args.method === "eth_sendTransaction" && client.sendTransaction) {
        return client.sendTransaction(args.params[0]);
      }
      if (args.method === "eth_sendTransaction" && client.send) {
        return new Promise((resolve, reject) => {
          client.send(args.method, args.params, (err: any, result: any) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      }
      throw new Error(`Method ${args.method} not supported`);
    },
    sendTransaction: hasSendTransaction ? client.sendTransaction.bind(client) : async (tx: any) => {
      if (client.request) {
        return client.request({
          method: "eth_sendTransaction",
          params: [tx],
        });
      }
      throw new Error("sendTransaction not available");
    },
    signMessage: async (msg: any) => {
      if (client.request) {
        return client.request({
          method: "personal_sign",
          params: [msg],
        });
      }
      throw new Error("signMessage not available");
    },
  };

  return wrappedClient;
}

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
        const proxyProvider = {
          isProxy: true,
          targetAddress: farcasterWallet,
          request: async (args: any) => {
            if (args.method === "eth_accounts") {
              return [farcasterWallet];
            }

            if (args.method === "eth_sendTransaction" || args.method === "personal_sign") {
              if ((window as any).ethereum?.request) {
                return (window as any).ethereum.request(args);
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
 * Hook to ensure embedded wallet is created when needed
 * Now handles fallback when external wallet disconnects
 */
function useEnsureEmbeddedWallet() {
  const { user, authenticated, createWallet } = usePrivy()
  const { wallets } = useWallets()
  const creatingWallet = useRef(false)
  const hadExternalWallet = useRef(false)

  useEffect(() => {
    if (!authenticated || !user) {
      creatingWallet.current = false
      hadExternalWallet.current = false
      return
    }

    const ensureWallet = async () => {
      // Prevent concurrent creation attempts
      if (creatingWallet.current) {
        console.log('⏳ Already creating wallet, skipping...')
        return
      }

      // ONLY check the wallets array for active wallets
      const hasExternalWallet = wallets.some(w => w.walletClientType !== 'privy')
      const hasEmbeddedWallet = wallets.some(w => w.walletClientType === 'privy')

      const currentlyHasExternal = hasExternalWallet
      const currentlyHasEmbedded = hasEmbeddedWallet

      // Detect when external wallet was disconnected
      const externalWalletWasDisconnected = hadExternalWallet.current && !currentlyHasExternal

      console.log('🔍 Wallet state check:', {
        hasExternal: currentlyHasExternal,
        hasEmbedded: currentlyHasEmbedded,
        hadExternal: hadExternalWallet.current,
        disconnected: externalWalletWasDisconnected,
        walletsCount: wallets.length
      })

      // Update tracking
      hadExternalWallet.current = currentlyHasExternal

      // Create embedded wallet if:
      // 1. User has no wallets at all, OR
      // 2. External wallet was just disconnected and no embedded wallet exists
      const shouldCreateEmbedded = (
        (!currentlyHasExternal && !currentlyHasEmbedded) ||
        (externalWalletWasDisconnected && !currentlyHasEmbedded)
      )

      if (shouldCreateEmbedded) {
        creatingWallet.current = true
        
        if (externalWalletWasDisconnected) {
          console.log('🔄 External wallet disconnected, creating embedded wallet fallback...')
        } else {
          console.log('🔧 No wallet found, creating embedded wallet...')
        }

        try {
          await createWallet()
          console.log('✅ Embedded wallet created successfully')
        } catch (error) {
          console.error('❌ Failed to create embedded wallet:', error)
        } finally {
          creatingWallet.current = false
        }
      }
    }

    // Small delay to allow state to settle after wallet changes
    const timeoutId = setTimeout(() => {
      ensureWallet()
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [authenticated, user, wallets, createWallet])

  // Reset tracking when user changes
  useEffect(() => {
    creatingWallet.current = false
    hadExternalWallet.current = false
  }, [user?.id])
}

/**
 * Always prioritize external wallets over embedded wallets
 * Now properly handles disconnection of external wallets
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

  // Ensure embedded wallet is created when needed
  useEnsureEmbeddedWallet()

  const FORCE_EXTERNAL_PRIORITY = true

  const [isWalletsLoading, setIsWalletsLoading] = useState(true)
  const [stableAddress, setStableAddress] = useState<string | undefined>(undefined)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [clientReady, setClientReady] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  
  // Clear cached wallet address on mount - force fresh resolution
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('preferredWalletAddress')
        console.log('🗑️ Cleared cached wallet on mount - will resolve fresh')
      } catch {}
    }
  }, [])
  
  useEffect(() => {
    if (!authenticated) {
      try {
        sessionStorage.removeItem('preferredWalletAddress')
        console.log('🗑️ Cleared preferred wallet on disconnect')
      } catch {}
    }
  }, [authenticated])

  useEffect(() => {
    if (!ready) {
      setIsWalletsLoading(true)
      return
    }

    if (wallets.length > 0) {
      console.log('✅ Wallets detected, waiting for initialization...')
      const timer = setTimeout(() => {
        console.log('✅ Wallets fully loaded')
        setIsWalletsLoading(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      console.log('✅ No wallets detected, marking as loaded')
      setIsWalletsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [ready, wallets.length])

  console.log("wallets---", wallets)

  useEffect(() => {
    if (isWalletsLoading) {
      console.log('⏳ Waiting for wallets to load...')
      return
    }

    if (!authenticated) {
      console.log('❌ Not authenticated - clearing address')
      setStableAddress(undefined)
      return
    }

    const resolveAddress = () => {
      console.log('🔍 Resolving address...', {
        isMinitapp,
        farcasterWallet,
        walletsCount: wallets.length,
        wagmiAddress,
        forceExternal: FORCE_EXTERNAL_PRIORITY,
        allWallets: wallets.map(w => ({
          address: w.address?.slice(0, 10) + '...',
          type: w.walletClientType,
        }))
      })

      // PRIORITY 1: Farcaster miniapp
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

      // PRIORITY 2: Active external wallets (must be in wallets array to be considered active)
      const externalWallets = wallets.filter(w => 
        w.walletClientType !== 'privy' && w.address
      )

      if (externalWallets.length > 0) {
        const externalWallet = externalWallets[0]
        console.log('🎯 Using ACTIVE external wallet:', externalWallet.address)
        setStableAddress(externalWallet.address as `0x${string}`)
        return
      }

      // CRITICAL: At this point, NO external wallet is active
      // Do NOT check linkedAccounts for external wallets
      // linkedAccounts may contain disconnected wallets

      console.log('✅ No active external wallet, falling back to embedded wallet')

      // PRIORITY 3: Embedded wallet via wagmi
      if (wagmiAddress) {
        console.log('🎯 Using embedded wallet via wagmi:', wagmiAddress)
        setStableAddress(wagmiAddress)
        return
      }

      // PRIORITY 4: Embedded wallet from wallets array
      const embeddedWallet = wallets.find(w => 
        w.walletClientType === 'privy' && w.address
      )
      
      if (embeddedWallet?.address) {
        console.log('🎯 Using embedded wallet from wallets array:', embeddedWallet.address)
        setStableAddress(embeddedWallet.address as `0x${string}`)
        return
      }

      // PRIORITY 5: Embedded wallet from linkedAccounts (last resort)
      const embeddedWalletAccount = user?.linkedAccounts?.find(
        (acc: any) => acc.type === 'wallet' && acc.walletClientType === 'privy' && acc.address
      )

      if (embeddedWalletAccount) {
        console.log('🎯 Using embedded wallet from linkedAccounts:', (embeddedWalletAccount as any).address)
        setStableAddress((embeddedWalletAccount as any).address as `0x${string}`)
        return
      }

      // PRIORITY 6: User wallet fallback
      if ((user as any)?.wallet?.address) {
        console.log('🎯 Using user wallet fallback:', (user as any).wallet.address)
        setStableAddress((user as any).wallet.address as `0x${string}`)
        return
      }

      console.log('⏳ No wallet available')
      setStableAddress(undefined)
    }

    resolveAddress()
  }, [
    isWalletsLoading, 
    isMinitapp, 
    farcasterWallet, 
    wallets, 
    wagmiAddress, 
    user, 
    authenticated,
    FORCE_EXTERNAL_PRIORITY
  ])

  useEffect(() => {
    const resolveWalletClient = async () => {
      try {
        setClientReady(false)
        setClientError(null)

        console.log('🔍 Resolving wallet client for:', stableAddress)

        // Farcaster miniapp
        if (isMinitapp && farcasterWallet && stableAddress === farcasterWallet) {
          if (fcProviderLoading) {
            console.log('⏳ Waiting for Farcaster provider...')
            return
          }

          if (fcProvider) {
            console.log('✅ Using Farcaster wallet provider')
            setWalletClient(ensureSendTransaction(fcProvider))
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

        // Get client from matching wallet
        if (stableAddress) {
          const matchingWallet = wallets.find(w =>
            w.address?.toLowerCase() === stableAddress.toLowerCase()
          )

          // For EXTERNAL wallets, use their provider directly
          if (matchingWallet?.walletClientType !== 'privy') {
            console.log('🎯 Found external wallet, getting its provider...')
            
            if (matchingWallet?.getEthereumProvider) {
              try {
                const provider = await matchingWallet.getEthereumProvider()
                if (provider) {
                  setWalletClient(ensureSendTransaction(provider))
                  setClientReady(true)
                  console.log('✅ Got provider from external wallet')
                  return
                }
              } catch (err) {
                console.error('Failed to get external wallet provider:', err)
              }
            }

            if ((matchingWallet as any)?.walletClient) {
              setWalletClient(ensureSendTransaction((matchingWallet as any).walletClient))
              setClientReady(true)
              console.log('✅ Got walletClient from external wallet')
              return
            }
          }
        }

        // Use wagmi client for embedded wallets
        if (wagmiClient) {
          console.log('✅ Using wagmi client for embedded wallet')
          setWalletClient(wagmiClient)
          setClientReady(true)
          return
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

    if (stableAddress !== undefined) {
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

  // Determine if using external wallet - ONLY check wallets array
  const isUsingExternalWallet = useMemo(() => {
    if (!stableAddress) return false
    
    // ONLY check active wallets array, not linkedAccounts
    return wallets.some(w =>
      w.walletClientType !== 'privy' &&
      w.address?.toLowerCase() === stableAddress.toLowerCase()
    )
  }, [stableAddress, wallets])

  return useMemo(() => ({
    address: stableAddress,
    client: walletClient,
    clientReady: clientReady && !isWalletsLoading,
    clientError,
    shortAddress,
    farcasterWallet,
    isMinitapp,
    isLoading: isWalletsLoading,
    hasExternalWallet: wallets.some(w => w.walletClientType !== 'privy'),
    hasEmbeddedWallet: wallets.some(w => w.walletClientType === 'privy'),
    isUsingExternalWallet,
    isUsingFarcasterWallet: stableAddress === farcasterWallet,
    farcasterProviderError: fcProviderError,
    needsWalletConnection: isMinitapp && farcasterWallet && !fcProvider && !fcProviderError,
    needsExternalWalletReconnection: isUsingExternalWallet && !walletClient && clientReady,
    _debug: {
      isWalletsLoading,
      walletsCount: wallets.length,
      wagmiAddress,
      wagmiClientAvailable: !!wagmiClient,
      stableAddress,
      forceExternal: FORCE_EXTERNAL_PRIORITY,
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
    fcProviderLoading,
    wagmiAddress,
    isUsingExternalWallet
  ])
}