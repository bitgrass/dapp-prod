import { useState, useEffect, useMemo, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useWalletClient } from 'wagmi'

/**
 * Fetch the Farcaster wallet using Neynar API
 * Rule: the correct wallet is the address present in BOTH
 *   - verified_addresses.eth_addresses
 *   - auth_addresses[].address
 */
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

        // Find intersection
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

/**
 * Hook to ensure user has an embedded wallet (with proper safeguards)
 */
export function useEnsureEmbeddedWallet() {
  const { user, authenticated, createWallet } = usePrivy()
  const creatingWallet = useRef(false)
  const walletCreated = useRef(false)
  
  useEffect(() => {
    if (!authenticated || !user || creatingWallet.current || walletCreated.current) {
      return
    }

    const ensureWallet = async () => {
      // Check if user has any wallets at all
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
          creatingWallet.current = false // Allow retry on error
        }
      }
    }
    
    ensureWallet()
  }, [authenticated, user?.id, createWallet])

  // Reset flags when user changes
  useEffect(() => {
    creatingWallet.current = false
    walletCreated.current = false
  }, [user?.id])
}

/**
 * Check if we're in a Farcaster miniapp environment
 */
function isFarcasterMiniapp(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for Farcaster miniapp indicators
  return !!(
    window.parent !== window || // iframe
    (window as any).farcaster || // Farcaster SDK
    window.location.href.includes('farcaster') || // URL contains farcaster
    document.referrer.includes('warpcast.com') || // Referred from Warpcast
    navigator.userAgent.includes('Warpcast') || // Warpcast user agent
    // Additional checks for Farcaster web environment
    window.location.hostname.includes('warpcast') ||
    window.location.search.includes('frame') ||
    // Check for frame context
    window.self !== window.top
  )
}

/**
 * Comprehensive Farcaster wallet provider detection and setup
 */
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
      
      console.log('🔍 Setting up Farcaster wallet provider for address:', farcasterWallet)

      try {
        // Method 1: Try Farcaster SDK's standard wallet provider
        if ((window as any).sdk?.wallet?.getEthereumProvider) {
          console.log('🔍 Trying standard Farcaster SDK provider...')
          const sdkProvider = await (window as any).sdk.wallet.getEthereumProvider()
          if (sdkProvider && sdkProvider.request) {
            console.log('✅ Found Farcaster SDK provider')
            setProvider(sdkProvider)
            setIsLoading(false)
            return
          }
        }

        // Method 2: Try frame-based provider
        if ((window as any).sdk?.wallet?.ethereum) {
          console.log('🔍 Trying frame ethereum provider...')
          const frameProvider = (window as any).sdk.wallet.ethereum
          if (frameProvider && frameProvider.request) {
            console.log('✅ Found frame ethereum provider')
            setProvider(frameProvider)
            setIsLoading(false)
            return
          }
        }

        // Method 3: Try direct ethereum object in Farcaster context
        if ((window as any).ethereum && isFarcasterMiniapp()) {
          console.log('🔍 Trying injected ethereum in Farcaster context...')
          try {
            // First try to get existing accounts
            let accounts = []
            try {
              accounts = await (window as any).ethereum.request({ 
                method: 'eth_accounts' 
              })
              console.log('📋 Current ethereum accounts:', accounts)
            } catch (error) {
              console.log('⚠️ eth_accounts failed, trying eth_requestAccounts:', error)
              // If eth_accounts fails, try requesting accounts
              try {
                accounts = await (window as any).ethereum.request({ 
                  method: 'eth_requestAccounts' 
                })
                console.log('📋 Requested ethereum accounts:', accounts)
              } catch (requestError) {
                console.log('❌ eth_requestAccounts also failed:', requestError)
              }
            }
            
            // Check if any account matches (with better address comparison)
            const normalizedFarcaster = farcasterWallet.toLowerCase()
            const hasMatchingAccount = accounts.some((addr: string) => 
              addr.toLowerCase() === normalizedFarcaster
            )
            
            if (hasMatchingAccount) {
              console.log('✅ Found matching Farcaster wallet in injected ethereum')
              setProvider((window as any).ethereum)
              setIsLoading(false)
              return
            } else if (accounts.length > 0) {
              console.log('⚠️ Ethereum provider has accounts but none match Farcaster wallet')
              console.log('Expected:', normalizedFarcaster)
              console.log('Available:', accounts.map((a: string) => a.toLowerCase()))
            } else {
              console.log('⚠️ Ethereum provider has no accounts')
            }
          } catch (error) {
            console.log('❌ Error checking ethereum provider:', error)
          }
        }

        // Method 4: Try parent frame communication
        if (window.parent !== window) {
          console.log('🔍 Trying parent frame communication...')
          
          // Set up message listener for provider response
          const messagePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              window.removeEventListener('message', messageHandler)
              reject(new Error('Timeout waiting for provider'))
            }, 5000)

            const messageHandler = (event: MessageEvent) => {
              if (event.data?.type === 'ETHEREUM_PROVIDER_RESPONSE') {
                clearTimeout(timeout)
                window.removeEventListener('message', messageHandler)
                if (event.data.provider) {
                  resolve(event.data.provider)
                } else {
                  reject(new Error('No provider in response'))
                }
              }
            }

            window.addEventListener('message', messageHandler)
          })

          // Request provider from parent
          window.parent.postMessage({
            type: 'GET_ETHEREUM_PROVIDER',
            targetAddress: farcasterWallet
          }, '*')

          try {
            const parentProvider = await messagePromise
            if (parentProvider) {
              console.log('✅ Got provider from parent frame')
              setProvider(parentProvider)
              setIsLoading(false)
              return
            }
          } catch (error) {
            console.log('❌ Parent frame communication failed:', error)
          }
        }

        // Method 5: Try WalletConnect or other injected providers
        console.log('🔍 Checking alternative providers...')
        const providers = [
          { name: 'walletRouter', provider: (window as any).walletRouter?.getWallets() },
          { name: 'coinbaseWalletExtension', provider: (window as any).coinbaseWalletExtension },
          { name: 'trustwallet', provider: (window as any).trustwallet },
          { name: 'phantom', provider: (window as any).phantom?.ethereum },
          { name: 'metamask', provider: (window as any).MetaMask },
          { name: 'rainbow', provider: (window as any).rainbow },
          // Try all ethereum providers
          ...(((window as any).ethereum?.providers || []).map((p: any, i: number) => ({
            name: `ethereum.providers[${i}]`,
            provider: p
          })))
        ].filter(p => p.provider)

        console.log(`📋 Found ${providers.length} alternative providers to check`)

        for (const { name, provider: potentialProvider } of providers) {
          console.log(`🔍 Checking provider: ${name}`)
          if (potentialProvider && potentialProvider.request) {
            try {
              const accounts = await potentialProvider.request({ 
                method: 'eth_accounts' 
              })
              
              console.log(`📋 ${name} accounts:`, accounts)
              
              if (accounts.some((addr: string) => 
                addr.toLowerCase() === farcasterWallet.toLowerCase()
              )) {
                console.log(`✅ Found matching wallet in ${name}`)
                setProvider(potentialProvider)
                setIsLoading(false)
                return
              }
            } catch (error) {
              console.log(`❌ ${name} check failed:`, error)
            }
          }
        }
        
        console.log('❌ No matching providers found')

        // Method 6: Try to manually trigger wallet connection in Farcaster
        console.log('🔧 Attempting manual wallet connection in Farcaster environment...')
        
        // Try various methods to trigger wallet connection
        const connectionMethods = [
          // Method 6a: Check if we can trigger Farcaster wallet connection
          async () => {
            if ((window as any).sdk?.actions?.openUrl) {
              const walletUrl = `https://warpcast.com/~/add-cast-action?url=${encodeURIComponent(window.location.href)}`
              console.log('🔗 Trying to trigger wallet connection via Farcaster action')
              await (window as any).sdk.actions.openUrl(walletUrl)
              return null // This doesn't directly return a provider
            }
            return null
          },
          
          // Method 6b: Try EIP-1193 provider discovery
          async () => {
            if (typeof window !== 'undefined') {
              console.log('🔍 Checking for EIP-1193 providers...')
              
              // Wait for providers to be announced
              const providerPromise = new Promise((resolve) => {
                const timeout = setTimeout(() => resolve(null), 3000)
                
                window.addEventListener('eip6963:announceProvider', (event: any) => {
                  console.log('📢 EIP-6963 provider announced:', event.detail)
                  clearTimeout(timeout)
                  resolve(event.detail.provider)
                })
                
                // Request provider announcements
                window.dispatchEvent(new Event('eip6963:requestProvider'))
              })
              
              const discoveredProvider = await providerPromise
              if (discoveredProvider && (discoveredProvider as any).request) {
                try {
                  const accounts = await (discoveredProvider as any).request({ 
                    method: 'eth_accounts' 
                  })
                  
                  if (accounts.some((addr: string) => 
                    addr.toLowerCase() === farcasterWallet.toLowerCase()
                  )) {
                    console.log('✅ Found matching wallet via EIP-6963')
                    return discoveredProvider
                  }
                } catch (error) {
                  console.log('❌ EIP-6963 provider check failed:', error)
                }
              }
            }
            return null
          }
        ]
        
        for (let i = 0; i < connectionMethods.length; i++) {
          try {
            console.log(`🔧 Trying connection method ${i + 1}/${connectionMethods.length}`)
            const result = await connectionMethods[i]()
            if (result) {
              console.log(`✅ Connection method ${i + 1} succeeded`)
              setProvider(result)
              setIsLoading(false)
              return
            }
          } catch (error) {
            console.log(`❌ Connection method ${i + 1} failed:`, error)
          }
        }
        // Method 7: Create a proxy provider that prompts user to connect their wallet
        
        const proxyProvider = {
          isProxy: true,
          targetAddress: farcasterWallet,
          request: async (args: any) => {
            if (args.method === 'eth_accounts') {
              return [farcasterWallet]
            }
            
            if (args.method === 'eth_sendTransaction' || args.method === 'personal_sign') {
              // Show user a message to connect their actual wallet
              const userConfirmed = window.confirm(
                `To complete this transaction, please connect your Farcaster wallet (${farcasterWallet.slice(0, 6)}...${farcasterWallet.slice(-4)}) through your wallet app or browser extension.`
              )
              
              if (!userConfirmed) {
                throw new Error('User cancelled transaction')
              }
              
              // Try to detect if a wallet was connected after user confirmation
              if ((window as any).ethereum) {
                try {
                  const accounts = await (window as any).ethereum.request({ 
                    method: 'eth_requestAccounts' 
                  })
                  
                  if (accounts.some((addr: string) => 
                    addr.toLowerCase() === farcasterWallet.toLowerCase()
                  )) {
                    return await (window as any).ethereum.request(args)
                  }
                } catch (error) {
                  console.log('Failed to connect wallet after user confirmation:', error)
                }
              }
              
              throw new Error('Farcaster wallet not accessible for signing. Please ensure your wallet is connected.')
            }
            
            throw new Error(`Method ${args.method} not supported without direct wallet connection`)
          },
          getChainId: () => 8453 // Default to Base
        }

        console.log('⚠️ Using proxy provider - user will need to manually connect wallet')
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
 * Main hook: get connected address + wallet client with priority logic
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

  // State for storing the resolved wallet client
  const [walletClient, setWalletClient] = useState<any>(null)
  const [clientReady, setClientReady] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  // Ensure embedded wallet exists for users without wallets
  useEnsureEmbeddedWallet()

  const connectedAddress = useMemo(() => {
    // In Farcaster miniapp: ALWAYS use Farcaster wallet if available
    if (isMinitapp && farcasterWallet) {
      console.log('🎯 Using Farcaster wallet in miniapp environment:', farcasterWallet)
      return farcasterWallet as `0x${string}`
    }

    // In other environments: External wallet → Embedded wallet → Fallbacks
    
    // Priority 1: External wallet
    const externalWallet = wallets.find(w => w.walletClientType !== 'privy')
    if (externalWallet?.address) {
      console.log('🎯 Using external wallet in non-miniapp environment:', externalWallet.address)
      return externalWallet.address as `0x${string}`
    }

    // Priority 2: Embedded wallet
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
    if (embeddedWallet?.address) {
      console.log('🎯 Using embedded wallet in non-miniapp environment:', embeddedWallet.address)
      return embeddedWallet.address as `0x${string}`
    }

    // Final fallbacks
    if (wagmiAddress) {
      console.log('🎯 Using wagmi address fallback:', wagmiAddress)
      return wagmiAddress
    }
    if ((user as any)?.wallet?.address) {
      console.log('🎯 Using user wallet fallback:', (user as any).wallet.address)
      return (user as any).wallet.address as `0x${string}`
    }

    console.log('❌ No wallet address found')
    return undefined
  }, [farcasterWallet, wallets, wagmiAddress, user, isMinitapp])

  // Effect to resolve wallet client based on connected address
  useEffect(() => {
    const resolveWalletClient = async () => {
      try {
        setClientReady(false)
        setClientError(null)
        
        console.log('🔍 Resolving wallet client...', {
          isMinitapp,
          farcasterWallet,
          connectedAddress,
          walletsCount: wallets.length,
          fcProviderAvailable: !!fcProvider,
          fcProviderError,
          fcProviderLoading
        })

        // In Farcaster miniapp using Farcaster wallet
        if (
          isMinitapp &&
          farcasterWallet &&
          connectedAddress === farcasterWallet
        ) {
          if (fcProviderLoading) {
            console.log('⏳ Waiting for Farcaster provider...')
            return // Don't set ready yet
          }

          if (fcProvider) {
            console.log('🎯 Using Farcaster wallet provider for signing')
            setWalletClient(fcProvider)
            setClientError(fcProviderError)
            setClientReady(true)
            return
          }

          if (fcProviderError) {
            console.error('❌ Farcaster provider error:', fcProviderError)
            setWalletClient(null)
            setClientError(`Cannot access Farcaster wallet for signing: ${fcProviderError}`)
            setClientReady(true)
            return
          }

          // No provider and no error means still loading or failed silently
          console.log('❌ No Farcaster provider available')
          setWalletClient(null)
          setClientError('Farcaster wallet not accessible for signing in this environment')
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
        if (connectedAddress) {
          const matchingWallet = wallets.find(w => 
            w.address?.toLowerCase() === connectedAddress.toLowerCase()
          )
          
          if (matchingWallet) {
            console.log('🔍 Found matching wallet, getting provider...')
            
            if (matchingWallet.getEthereumProvider) {
              const provider = await matchingWallet.getEthereumProvider()
              if (provider) {
                setWalletClient(provider)
                setClientReady(true)
                console.log('✅ Got provider from matching wallet')
                return
              }
            }
            
            if ((matchingWallet as any).walletClient) {
              setWalletClient((matchingWallet as any).walletClient)
              setClientReady(true)
              console.log('✅ Got walletClient from matching wallet')
              return
            }
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

    resolveWalletClient()
  }, [isMinitapp, farcasterWallet, connectedAddress, wallets, wagmiClient, fcProvider, fcProviderError, fcProviderLoading])

  const shortAddress = useMemo(
    () =>
      connectedAddress
        ? `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`
        : '',
    [connectedAddress]
  )

  const result = useMemo(() => ({
    address: connectedAddress,
    client: walletClient,
    clientReady,
    clientError,
    shortAddress,
    farcasterWallet,
    isMinitapp,
    hasExternalWallet: wallets.some(w => w.walletClientType !== 'privy'),
    hasEmbeddedWallet: wallets.some(w => w.walletClientType === 'privy'),
    isUsingExternalWallet: connectedAddress && wallets.some(w => 
      w.walletClientType !== 'privy' && 
      w.address?.toLowerCase() === connectedAddress.toLowerCase()
    ),
    isUsingFarcasterWallet: connectedAddress === farcasterWallet,
    farcasterProviderError: fcProviderError,
    needsWalletConnection: isMinitapp && farcasterWallet && !fcProvider && !fcProviderError,
    _debug: {
      walletsCount: wallets.length,
      wagmiClientAvailable: !!wagmiClient,
      embeddedWalletAvailable: wallets.some(w => w.walletClientType === 'privy'),
      farcasterWalletMatches: connectedAddress === farcasterWallet,
      clientReady,
      hasClient: !!walletClient,
      fcProviderAvailable: !!fcProvider,
      fcProviderLoading,
      fcProviderError,
      priorityUsed: isMinitapp && farcasterWallet ? 'farcaster-wallet' : 
                    wallets.some(w => w.walletClientType !== 'privy' && w.address?.toLowerCase() === connectedAddress?.toLowerCase()) ? 'external' :
                    wallets.some(w => w.walletClientType === 'privy' && w.address?.toLowerCase() === connectedAddress?.toLowerCase()) ? 'embedded' :
                    'fallback'
    }
  }), [
    connectedAddress, 
    walletClient, 
    clientReady,
    clientError,
    shortAddress, 
    farcasterWallet, 
    isMinitapp, 
    wallets, 
    wagmiClient,
    fcProvider,
    fcProviderError,
    fcProviderLoading
  ])

  return result
}