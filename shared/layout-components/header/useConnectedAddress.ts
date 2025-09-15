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
      
      
      if (!hasAnyWallet ) {
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
  }, [authenticated, user?.id, createWallet]) // Only depend on user.id, not the entire user object

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
    navigator.userAgent.includes('Warpcast') // Warpcast user agent
  )
}

/**
 * Main hook: get connected address + wagmi client with priority logic
 * - In Farcaster miniapp: Force use of Farcaster wallet
 * - In other environments: Use external wallet if it matches Farcaster wallet, otherwise use priority logic
 */
export function useConnectedAddress() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const { address: wagmiAddress } = useAccount()
  const { data: wagmiClient } = useWalletClient()

  const farcaster = user?.farcaster as any
  const farcasterWallet = useFarcasterWallet(farcaster?.fid)
  const isMinitapp = isFarcasterMiniapp()

  // Ensure embedded wallet exists for users without wallets
  useEnsureEmbeddedWallet()

  const connectedAddress = useMemo(() => {
    // In Farcaster miniapp: Force use of Farcaster wallet
    if (isMinitapp && farcasterWallet) {
      return farcasterWallet as `0x${string}`
    }

    // In other environments: Check if external wallet matches Farcaster wallet
    if (farcasterWallet) {
      const externalWallet = wallets.find(w => w.walletClientType !== 'privy')
      
      // If external wallet matches Farcaster wallet, use external wallet for better UX
      if (externalWallet?.address?.toLowerCase() === farcasterWallet.toLowerCase()) {
        return externalWallet.address as `0x${string}`
      }
      
      // Otherwise use Farcaster wallet
      return farcasterWallet as `0x${string}`
    }

    // Fallback priority logic when no Farcaster wallet
    const externalWallet = wallets.find(w => w.walletClientType !== 'privy')
    if (externalWallet?.address) return externalWallet.address as `0x${string}`

    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
    if (embeddedWallet?.address) return embeddedWallet.address as `0x${string}`

    if (wagmiAddress) return wagmiAddress

    if ((user as any)?.wallet?.address) return (user as any).wallet.address as `0x${string}`

    return undefined
  }, [farcasterWallet, wallets, wagmiAddress, user, isMinitapp])

  const shortAddress = useMemo(
    () =>
      connectedAddress
        ? `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`
        : '',
    [connectedAddress]
  )

  return {
    address: connectedAddress,
    client: wagmiClient,
    shortAddress,
    farcasterWallet,
    isMinitapp,
    hasExternalWallet: wallets.some(w => w.walletClientType !== 'privy'),
    hasEmbeddedWallet: wallets.some(w => w.walletClientType === 'privy'),
    isUsingExternalWallet: connectedAddress && wallets.some(w => 
      w.walletClientType !== 'privy' && 
      w.address?.toLowerCase() === connectedAddress.toLowerCase()
    ),
  }
}