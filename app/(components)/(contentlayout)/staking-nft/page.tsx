"use client"
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState, useEffect } from 'react'
import { createThirdwebClient, getContract, defineChain, prepareContractCall, sendTransaction, readContract } from "thirdweb"
import { isApprovedForAll, setApprovalForAll, balanceOf } from "thirdweb/extensions/erc721"
import { useConnectedAddress } from '../useConnectedAddress'
import { ethers } from "ethers"
import { encodeFunctionData } from "viem"

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

// Base chain with PublicNode RPC
const baseChain = defineChain({
    id: 8453,
    rpc: "https://base-rpc.publicnode.com",
})

// Contract addresses for different pools
const LEGENDARY_POOL_ADDRESS = "0x8Ce083356a01EF8229d69df897e348948182a72f" // Token ID 1-400
const PREMIUM_POOL_ADDRESS = "0xfdD53102A85AE52A201e2faa8Cc4668d7Bf8f81C" // Token ID 401-1200
const STANDARD_POOL_ADDRESS = "0xDBfB6672125776176Bd9F154A0b4bbC8F63192A6" // Token ID 1201-3200

const NFT_COLLECTION_ADDRESS = "0x23308734dfaaae503c686720fff26126fcdc22c7"
const REWARD_TOKEN_ADDRESS = "0x20429F731096e359910921994A267d32ef576720" // SCAN token

// Token ID ranges for each pool
const LEGENDARY_RANGE = { min: 1, max: 400 }
const PREMIUM_RANGE = { min: 401, max: 1200 }
const STANDARD_RANGE = { min: 1201, max: 3200 }

// Helper function to determine which pool a token belongs to
const getPoolForTokenId = (tokenId: number): { address: string; name: string } => {
    if (tokenId >= LEGENDARY_RANGE.min && tokenId <= LEGENDARY_RANGE.max) {
        return { address: LEGENDARY_POOL_ADDRESS, name: 'Legendary' }
    } else if (tokenId >= PREMIUM_RANGE.min && tokenId <= PREMIUM_RANGE.max) {
        return { address: PREMIUM_POOL_ADDRESS, name: 'Premium' }
    } else if (tokenId >= STANDARD_RANGE.min && tokenId <= STANDARD_RANGE.max) {
        return { address: STANDARD_POOL_ADDRESS, name: 'Standard' }
    }
    return { address: STANDARD_POOL_ADDRESS, name: 'Unknown' }
}

const StakingNFT = () => {
    const { address, client: walletClient, clientReady } = useConnectedAddress()
    const [selectedNFTs, setSelectedNFTs] = useState<string[]>([])
    const [ownedNFTs, setOwnedNFTs] = useState<any[]>([])
    const [stakedNFTs, setStakedNFTs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingNFTs, setLoadingNFTs] = useState(true)
    const [currentEarnings, setCurrentEarnings] = useState("0")
    const [totalEarned, setTotalEarned] = useState("0")
    const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [stakedTokenIds, setStakedTokenIds] = useState<string[]>([])
    const [toastType, setToastType] = useState<'stake' | 'unstake'>('stake')

    // Pool stats
    const [legendaryStats, setLegendaryStats] = useState({ staked: 0, totalStaked: 0, earnings: "0" })
    const [premiumStats, setPremiumStats] = useState({ staked: 0, totalStaked: 0, earnings: "0" })
    const [standardStats, setStandardStats] = useState({ staked: 0, totalStaked: 0, earnings: "0" })

    // Get contracts for all pools
    const legendaryPoolContract = getContract({
        client,
        chain: baseChain,
        address: LEGENDARY_POOL_ADDRESS,
    })

    const premiumPoolContract = getContract({
        client,
        chain: baseChain,
        address: PREMIUM_POOL_ADDRESS,
    })

    const standardPoolContract = getContract({
        client,
        chain: baseChain,
        address: STANDARD_POOL_ADDRESS,
    })

    const nftContract = getContract({
        client,
        chain: baseChain,
        address: NFT_COLLECTION_ADDRESS,
    })

    const rewardTokenContract = getContract({
        client,
        chain: baseChain,
        address: REWARD_TOKEN_ADDRESS,
    })

    // Helper to get contract for a specific pool
    const getContractForPool = (poolAddress: string) => {
        if (poolAddress === LEGENDARY_POOL_ADDRESS) return legendaryPoolContract
        if (poolAddress === PREMIUM_POOL_ADDRESS) return premiumPoolContract
        return standardPoolContract
    }

    // Fetch owned and staked NFTs
    useEffect(() => {
        const fetchNFTs = async () => {
            if (!address) {
                setLoadingNFTs(false)
                return
            }

            setLoadingNFTs(true)
            try {
                console.log("Fetching NFTs for address:", address)

                // Get user's NFT balance
                const balance = await balanceOf({
                    contract: nftContract,
                    owner: address,
                })

                console.log("NFT Balance:", balance.toString())

                // Fetch owned tokens using ownerOf in parallel batches
                const ownedNFTsList: any[] = []
                const targetBalance = Number(balance)
                const maxTokensToCheck = 3200
                const batchSize = 100 // Large batches for speed

                console.log(`User has ${targetBalance} NFTs, checking tokens 0-${maxTokensToCheck} in batches...`)

                try {
                    for (let start = 0; start < maxTokensToCheck && ownedNFTsList.length < targetBalance; start += batchSize) {
                        const end = Math.min(start + batchSize, maxTokensToCheck)

                        // Create batch of promises
                        const promises = []
                        for (let i = start; i < end; i++) {
                            promises.push(
                                readContract({
                                    contract: nftContract,
                                    method: "function ownerOf(uint256 tokenId) view returns (address)",
                                    params: [BigInt(i)]
                                })
                                    .then(owner => ({ tokenId: i, owner }))
                                    .catch((error) => {
                                        // Log errors for tokens we know exist
                                        if (i === 531 || i === 1213) {
                                            console.error(`Error fetching token ${i}:`, error.message || error)
                                        }
                                        return null
                                    })
                            )
                        }

                        // Execute batch in parallel
                        const results = await Promise.all(promises)

                        // Debug: check if we got any valid results
                        const validCount = results.filter(r => r !== null).length
                        if (start === 500 || start === 1200) {
                            console.log(`Batch ${start}-${end}: ${validCount} valid results out of ${results.length}`)
                        }

                        // Process results
                        for (const result of results) {
                            if (result && result.owner.toLowerCase() === address.toLowerCase()) {
                                console.log(`Found owned NFT: #${result.tokenId}`)

                                ownedNFTsList.push({
                                    id: BigInt(result.tokenId),
                                    metadata: {
                                        id: result.tokenId,
                                        name: `NFT #${result.tokenId}`,
                                        image: null,
                                    }
                                })
                            }
                        }

                        // Log progress
                        if (start % 200 === 0) {
                            console.log(`Checked ${start + batchSize} tokens, found ${ownedNFTsList.length}/${targetBalance}`)
                        }

                        // Stop if we found all NFTs
                        if (ownedNFTsList.length >= targetBalance) {
                            console.log(`Found all ${targetBalance} NFTs, stopping search`)
                            break
                        }
                    }

                    console.log(`Finished checking, found ${ownedNFTsList.length} NFTs`)
                } catch (error) {
                    console.error("Error fetching NFTs:", error)
                }

                // Fetch staked NFTs from all 3 pools
                let stakedTokenIdsList: bigint[] = []
                let allStakedNFTs: any[] = []
                let totalEarnings = BigInt(0)

                try {
                    console.log("Fetching staked NFTs from all pools...")

                    // Fetch from Legendary Pool
                    try {
                        const legendaryInfo = await readContract({
                            contract: legendaryPoolContract,
                            method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                            params: [address]
                        })

                        if (legendaryInfo && legendaryInfo[0] && legendaryInfo[0].length > 0) {
                            const tokens = legendaryInfo[0] as bigint[]
                            stakedTokenIdsList = stakedTokenIdsList.concat(tokens)
                            allStakedNFTs = allStakedNFTs.concat(tokens.map(t => ({ tokenId: t, pool: 'Legendary' })))
                        }

                        // Set legendary stats (preserve totalStaked from Moralis)
                        setLegendaryStats(prev => ({
                            ...prev,
                            staked: legendaryInfo[0]?.length || 0
                        }))
                    } catch (error) {
                        console.log("No legendary staked NFTs:", error)
                    }

                    // Fetch from Premium Pool
                    try {
                        const premiumInfo = await readContract({
                            contract: premiumPoolContract,
                            method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                            params: [address]
                        })

                        if (premiumInfo && premiumInfo[0] && premiumInfo[0].length > 0) {
                            const tokens = premiumInfo[0] as bigint[]
                            stakedTokenIdsList = stakedTokenIdsList.concat(tokens)
                            allStakedNFTs = allStakedNFTs.concat(tokens.map(t => ({ tokenId: t, pool: 'Premium' })))
                        }

                        // Set premium stats (preserve totalStaked from Moralis)
                        setPremiumStats(prev => ({
                            ...prev,
                            staked: premiumInfo[0]?.length || 0
                        }))
                    } catch (error) {
                        console.log("No premium staked NFTs:", error)
                    }

                    // Fetch from Standard Pool
                    try {
                        const standardInfo = await readContract({
                            contract: standardPoolContract,
                            method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                            params: [address]
                        })

                        if (standardInfo && standardInfo[0] && standardInfo[0].length > 0) {
                            const tokens = standardInfo[0] as bigint[]
                            stakedTokenIdsList = stakedTokenIdsList.concat(tokens)
                            allStakedNFTs = allStakedNFTs.concat(tokens.map(t => ({ tokenId: t, pool: 'Standard' })))
                        }

                        // Set standard stats (preserve totalStaked from Moralis)
                        setStandardStats(prev => ({
                            ...prev,
                            staked: standardInfo[0]?.length || 0
                        }))
                    } catch (error) {
                        console.log("No standard staked NFTs:", error)
                    }

                    console.log(`Total staked NFTs: ${allStakedNFTs.length}`)
                    setStakedNFTs(allStakedNFTs)
                    setCurrentEarnings(ethers.formatUnits(totalEarnings.toString(), 18))

                } catch (error) {
                    console.log("Error fetching staked NFTs:", error)
                    setStakedNFTs([])
                    setCurrentEarnings("0")
                }

                // Calculate total earned per pool using Moralis API
                try {
                    console.log("Fetching total earned from Moralis API...")

                    const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_APY_KEY || ""

                    // Use Moralis to get token transfers for this wallet
                    const response = await fetch(
                        `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=base&contract_addresses=${encodeURIComponent('0x20429f731096e359910921994a267d32ef576720')}&limit=100&order=DESC`,
                        {
                            headers: {
                                'Accept': 'application/json',
                                'X-API-Key': moralisApiKey
                            }
                        }
                    )

                    const data = await response.json()
                    console.log("Moralis response:", data)

                    if (data.result && Array.isArray(data.result)) {
                        console.log(`Found ${data.result.length} SCAN token transfers`)

                        let totalAll = BigInt(0)
                        let legendaryTotal = BigInt(0)
                        let premiumTotal = BigInt(0)
                        let standardTotal = BigInt(0)

                        // Filter for transfers FROM staking contracts TO user
                        for (const tx of data.result) {
                            const fromAddress = tx.from_address?.toLowerCase()
                            const toAddress = tx.to_address?.toLowerCase()

                            if (toAddress === address.toLowerCase()) {
                                const value = BigInt(tx.value)

                                if (fromAddress === LEGENDARY_POOL_ADDRESS.toLowerCase()) {
                                    legendaryTotal += value
                                    totalAll += value
                                    console.log(`✅ Legendary claim: ${ethers.formatUnits(value.toString(), 18)} SCAN`)
                                } else if (fromAddress === PREMIUM_POOL_ADDRESS.toLowerCase()) {
                                    premiumTotal += value
                                    totalAll += value
                                    console.log(`✅ Premium claim: ${ethers.formatUnits(value.toString(), 18)} SCAN`)
                                } else if (fromAddress === STANDARD_POOL_ADDRESS.toLowerCase()) {
                                    standardTotal += value
                                    totalAll += value
                                    console.log(`✅ Standard claim: ${ethers.formatUnits(value.toString(), 18)} SCAN`)
                                }
                            }
                        }

                        // Update pool stats with total earned
                        setLegendaryStats(prev => ({
                            ...prev,
                            earnings: ethers.formatUnits(legendaryTotal.toString(), 18)
                        }))

                        setPremiumStats(prev => ({
                            ...prev,
                            earnings: ethers.formatUnits(premiumTotal.toString(), 18)
                        }))

                        setStandardStats(prev => ({
                            ...prev,
                            earnings: ethers.formatUnits(standardTotal.toString(), 18)
                        }))

                        const totalEarnedEther = ethers.formatUnits(totalAll.toString(), 18)
                        console.log(`Total earned: ${totalEarnedEther} SCAN`)
                        setTotalEarned(totalEarnedEther)
                    } else {
                        console.log("No transfers found")
                        setTotalEarned("0")
                    }
                } catch (error: any) {
                    console.error("Error fetching total earned:", error)
                    setTotalEarned("0")
                }

                // Filter out staked NFTs from owned list
                const unstakedNFTs = ownedNFTsList.filter(nft =>
                    !stakedTokenIdsList.some(stakedId => stakedId === nft.id)
                )

                console.log("Total NFTs found:", ownedNFTsList.length)
                console.log("Staked NFTs:", stakedTokenIdsList.length)
                console.log("Unstaked (available to stake):", unstakedNFTs.length)
                console.log("Unstaked NFTs list:", unstakedNFTs)
                setOwnedNFTs(unstakedNFTs)
            } catch (error) {
                console.error("Error fetching NFTs:", error)
            } finally {
                console.log("Setting loadingNFTs to false")
                setLoadingNFTs(false)
            }
        }

        if (address) {
            fetchNFTs()
        } else {
            setLoadingNFTs(false)
        }
    }, [address])

    // Fetch total staked counts for all pools (once on mount)
    useEffect(() => {
        const fetchTotalStaked = async () => {
            try {
                const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_APY_KEY || ""

                // Fetch NFTs owned by each pool contract
                const pools = [
                    { address: LEGENDARY_POOL_ADDRESS, name: 'Legendary' },
                    { address: PREMIUM_POOL_ADDRESS, name: 'Premium' },
                    { address: STANDARD_POOL_ADDRESS, name: 'Standard' }
                ]

                const poolCounts = { legendary: 0, premium: 0, standard: 0 }

                for (const pool of pools) {
                    try {
                        console.log(`\n=== Fetching NFTs for ${pool.name} Pool (${pool.address}) ===`)

                        let allNFTs: any[] = []
                        let cursor = null
                        let pageCount = 0

                        // Fetch all pages
                        do {
                            pageCount++
                            const url = cursor
                                ? `https://deep-index.moralis.io/api/v2.2/${pool.address}/nft?chain=base&format=decimal&limit=100&cursor=${cursor}`
                                : `https://deep-index.moralis.io/api/v2.2/${pool.address}/nft?chain=base&format=decimal&limit=100`

                            console.log(`Fetching page ${pageCount}:`, url)

                            const response = await fetch(url, {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-API-Key': moralisApiKey
                                }
                            })

                            const data: any = await response.json()
                            console.log(`Page ${pageCount} response:`, data)

                            if (data.result) {
                                console.log(`Page ${pageCount} has ${data.result.length} NFTs`)
                                allNFTs = allNFTs.concat(data.result)
                            }

                            cursor = data.cursor
                            console.log(`Next cursor:`, cursor)
                        } while (cursor)

                        console.log(`Total NFTs fetched for ${pool.name}:`, allNFTs.length)

                        // Filter for our NFT collection only
                        const ourNFTs = allNFTs.filter((item: any) => {
                            const matches = item.token_address?.toLowerCase() === NFT_COLLECTION_ADDRESS.toLowerCase()
                            if (matches) {
                                console.log(`Found our NFT: Token ID ${item.token_id}`)
                            }
                            return matches
                        })

                        console.log(`${pool.name} Pool has ${ourNFTs.length} NFTs from our collection (total NFTs: ${allNFTs.length})`)
                        console.log(`Looking for collection: ${NFT_COLLECTION_ADDRESS.toLowerCase()}`)

                        // Store count
                        if (pool.name === 'Legendary') poolCounts.legendary = ourNFTs.length
                        if (pool.name === 'Premium') poolCounts.premium = ourNFTs.length
                        if (pool.name === 'Standard') poolCounts.standard = ourNFTs.length

                    } catch (error) {
                        console.error(`Error fetching total staked for ${pool.name} pool:`, error)
                    }
                }

                console.log('\n=== Final Pool Counts ===')
                console.log('Legendary:', poolCounts.legendary)
                console.log('Premium:', poolCounts.premium)
                console.log('Standard:', poolCounts.standard)

                // Update all stats at once
                console.log('Updating Legendary stats with totalStaked:', poolCounts.legendary)
                setLegendaryStats(prev => {
                    console.log('Legendary prev state:', prev)
                    const newState = { ...prev, totalStaked: poolCounts.legendary }
                    console.log('Legendary new state:', newState)
                    return newState
                })

                console.log('Updating Premium stats with totalStaked:', poolCounts.premium)
                setPremiumStats(prev => {
                    console.log('Premium prev state:', prev)
                    const newState = { ...prev, totalStaked: poolCounts.premium }
                    console.log('Premium new state:', newState)
                    return newState
                })

                console.log('Updating Standard stats with totalStaked:', poolCounts.standard)
                setStandardStats(prev => {
                    console.log('Standard prev state:', prev)
                    const newState = { ...prev, totalStaked: poolCounts.standard }
                    console.log('Standard new state:', newState)
                    return newState
                })

            } catch (error) {
                console.error("Error fetching total staked:", error)
            }
        }

        fetchTotalStaked()
    }, [])

    // Separate effect for refreshing live earnings
    useEffect(() => {
        if (!address) return

        const refreshData = async () => {
            try {
                let totalCurrentEarnings = BigInt(0)

                // Legendary pool
                try {
                    // Get current live earnings and staked count
                    const stakeInfo = await readContract({
                        contract: legendaryPoolContract,
                        method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                        params: [address]
                    })

                    if (stakeInfo) {
                        const rewards = stakeInfo[1] as bigint
                        totalCurrentEarnings += rewards

                        const stakedTokens = stakeInfo[0] as bigint[]

                        // Update user's staked count
                        setLegendaryStats(prev => ({
                            ...prev,
                            staked: stakedTokens.length
                        }))
                    }
                } catch (error) {
                    // Silent fail
                }

                // Premium pool
                try {
                    // Get current live earnings and staked count
                    const stakeInfo = await readContract({
                        contract: premiumPoolContract,
                        method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                        params: [address]
                    })

                    if (stakeInfo) {
                        const rewards = stakeInfo[1] as bigint
                        totalCurrentEarnings += rewards

                        const stakedTokens = stakeInfo[0] as bigint[]

                        // Update user's staked count
                        setPremiumStats(prev => ({
                            ...prev,
                            staked: stakedTokens.length
                        }))
                    }
                } catch (error) {
                    // Silent fail
                }

                // Standard pool
                try {
                    // Get current live earnings and staked count
                    const stakeInfo = await readContract({
                        contract: standardPoolContract,
                        method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                        params: [address]
                    })

                    console.log('[Standard Pool] stakeInfo:', stakeInfo)

                    if (stakeInfo) {
                        const rewards = stakeInfo[1] as bigint
                        totalCurrentEarnings += rewards

                        const stakedTokens = stakeInfo[0] as bigint[]
                        console.log('[Standard Pool] Your staked tokens:', stakedTokens)
                        console.log('[Standard Pool] Your staked count:', stakedTokens.length)

                        // Update user's staked count
                        setStandardStats(prev => ({
                            ...prev,
                            staked: stakedTokens.length
                        }))
                    }
                } catch (error) {
                    console.error('[Standard Pool] Error:', error)
                }

                const rewardsInEther = ethers.formatUnits(totalCurrentEarnings.toString(), 18)
                setCurrentEarnings(rewardsInEther)
            } catch (error) {
                console.error("Error refreshing data:", error)
            }
        }

        // Refresh every 1 second
        const interval = setInterval(refreshData, 1000)
        return () => clearInterval(interval)
    }, [address])



    const handleSelectNFT = (tokenId: string) => {
        setSelectedNFTs(prev => {
            if (prev.includes(tokenId)) {
                return prev.filter(id => id !== tokenId)
            } else {
                return [...prev, tokenId]
            }
        })
    }

    const handleStake = async () => {
        if (!address || selectedNFTs.length === 0) {
            console.error("Please connect your wallet and select NFTs to stake")
            return
        }

        if (!walletClient) {
            console.error("Wallet not initialized. Please refresh the page.")
            return
        }

        console.log("🔍 Starting stake with address:", address)
        console.log("🔍 Address type:", typeof address)
        console.log("🔍 Address valid:", /^0x[a-fA-F0-9]{40}$/.test(address))

        setLoading(true)
        try {
            // Group NFTs by pool based on token ID
            const nftsByPool: { [key: string]: { tokenIds: bigint[], poolName: string } } = {}

            for (const tokenId of selectedNFTs) {
                const pool = getPoolForTokenId(parseInt(tokenId))
                if (!nftsByPool[pool.address]) {
                    nftsByPool[pool.address] = { tokenIds: [], poolName: pool.name }
                }
                nftsByPool[pool.address].tokenIds.push(BigInt(tokenId))
            }

            console.log("NFTs grouped by pool:", nftsByPool)

            // Check and approve for each pool if needed
            for (const [poolAddress, poolData] of Object.entries(nftsByPool)) {
                console.log(`Checking approval for ${poolData.poolName} pool...`)

                const approved = await isApprovedForAll({
                    contract: nftContract,
                    owner: address,
                    operator: poolAddress as `0x${string}`,
                })

                if (!approved) {
                    console.log(`Requesting approval for ${poolData.poolName} pool...`)

                    const approvalData = encodeFunctionData({
                        abi: [{
                            name: 'setApprovalForAll',
                            type: 'function',
                            stateMutability: 'nonpayable',
                            inputs: [
                                { name: 'operator', type: 'address' },
                                { name: 'approved', type: 'bool' }
                            ],
                            outputs: []
                        }],
                        functionName: 'setApprovalForAll',
                        args: [poolAddress as `0x${string}`, true]
                    })

                    console.log(`🔍 Sending approval tx with from: ${address}`)

                    const hash = await walletClient.sendTransaction({
                        from: address,
                        to: NFT_COLLECTION_ADDRESS,
                        data: approvalData,
                    })
                    console.log(`Approval tx hash for ${poolData.poolName}:`, hash)
                    await new Promise(resolve => setTimeout(resolve, 3000))
                }
            }

            // Stake NFTs in each pool (separate transaction per pool)
            for (const [poolAddress, poolData] of Object.entries(nftsByPool)) {
                console.log(`Staking ${poolData.tokenIds.length} NFTs in ${poolData.poolName} pool...`)

                const stakeData = encodeFunctionData({
                    abi: [{
                        name: 'stake',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
                        outputs: []
                    }],
                    functionName: 'stake',
                    args: [poolData.tokenIds]
                })

                console.log(`🔍 Sending stake tx with from: ${address}, to: ${poolAddress}`)

                const stakeHash = await walletClient.sendTransaction({
                    from: address,
                    to: poolAddress,
                    data: stakeData,
                })
                console.log(`Stake tx hash for ${poolData.poolName}:`, stakeHash)
            }

            console.log("All NFTs staked successfully!")
            setStakedTokenIds(selectedNFTs)
            setToastType('stake')
            setSelectedNFTs([])
            setShowSuccessToast(true)
            await new Promise(resolve => setTimeout(resolve, 3000))
            window.location.reload()
        } catch (error: any) {
            console.error("Error staking NFTs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleWithdraw = async () => {
        if (!address || selectedNFTs.length === 0) {
            console.error("Please select NFTs to withdraw")
            return
        }

        if (!walletClient) {
            console.error("Wallet not initialized. Please refresh the page.")
            return
        }

        setLoading(true)
        try {
            // Group NFTs by pool based on token ID
            const nftsByPool: { [key: string]: { tokenIds: bigint[], poolName: string } } = {}

            for (const tokenId of selectedNFTs) {
                const pool = getPoolForTokenId(parseInt(tokenId))
                if (!nftsByPool[pool.address]) {
                    nftsByPool[pool.address] = { tokenIds: [], poolName: pool.name }
                }
                nftsByPool[pool.address].tokenIds.push(BigInt(tokenId))
            }

            console.log("NFTs grouped by pool for withdrawal:", nftsByPool)

            // Withdraw NFTs from each pool (separate transaction per pool)
            for (const [poolAddress, poolData] of Object.entries(nftsByPool)) {
                console.log(`Withdrawing ${poolData.tokenIds.length} NFTs from ${poolData.poolName} pool...`)

                const withdrawData = encodeFunctionData({
                    abi: [{
                        name: 'withdraw',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
                        outputs: []
                    }],
                    functionName: 'withdraw',
                    args: [poolData.tokenIds]
                })

                console.log(`🔍 Sending withdraw tx with from: ${address}, to: ${poolAddress}`)

                const withdrawHash = await walletClient.sendTransaction({
                    from: address,
                    to: poolAddress,
                    data: withdrawData,
                })
                console.log(`Withdraw tx hash for ${poolData.poolName}:`, withdrawHash)
            }

            console.log("All NFTs withdrawn successfully!")
            setStakedTokenIds(selectedNFTs)
            setToastType('unstake')
            setSelectedNFTs([])
            setShowSuccessToast(true)
            await new Promise(resolve => setTimeout(resolve, 3000))
            window.location.reload()
        } catch (error: any) {
            console.error("Error withdrawing NFTs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClaimRewards = async () => {
        if (!address || !walletClient) {
            console.error("Wallet not connected")
            return
        }

        if (parseFloat(currentEarnings) === 0) {
            console.error("No rewards to claim")
            return
        }

        setLoading(true)
        try {
            console.log("Claiming rewards from all pools...")

            // Get current claimable rewards from each pool
            const pools = []

            // Check Legendary pool
            try {
                const legendaryInfo = await readContract({
                    contract: legendaryPoolContract,
                    method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                    params: [address]
                })
                if (legendaryInfo && legendaryInfo[1] && legendaryInfo[1] > BigInt(0)) {
                    pools.push({ address: LEGENDARY_POOL_ADDRESS, name: 'Legendary' })
                }
            } catch (error) {
                console.log("No legendary rewards to claim")
            }

            // Check Premium pool
            try {
                const premiumInfo = await readContract({
                    contract: premiumPoolContract,
                    method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                    params: [address]
                })
                if (premiumInfo && premiumInfo[1] && premiumInfo[1] > BigInt(0)) {
                    pools.push({ address: PREMIUM_POOL_ADDRESS, name: 'Premium' })
                }
            } catch (error) {
                console.log("No premium rewards to claim")
            }

            // Check Standard pool
            try {
                const standardInfo = await readContract({
                    contract: standardPoolContract,
                    method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                    params: [address]
                })
                if (standardInfo && standardInfo[1] && standardInfo[1] > BigInt(0)) {
                    pools.push({ address: STANDARD_POOL_ADDRESS, name: 'Standard' })
                }
            } catch (error) {
                console.log("No standard rewards to claim")
            }

            if (pools.length === 0) {
                console.error("No rewards available to claim")
                return
            }

            for (const pool of pools) {
                console.log(`Claiming rewards from ${pool.name} pool...`)

                const claimData = encodeFunctionData({
                    abi: [{
                        name: 'claimRewards',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [],
                        outputs: []
                    }],
                    functionName: 'claimRewards'
                })

                console.log(`🔍 Sending claim tx with from: ${address}, to: ${pool.address}`)

                const claimHash = await walletClient.sendTransaction({
                    from: address,
                    to: pool.address,
                    data: claimData,
                })
                console.log(`Claim tx hash for ${pool.name}:`, claimHash)
            }

            console.log("All rewards claimed successfully!")
            await new Promise(resolve => setTimeout(resolve, 3000))
            window.location.reload()
        } catch (error: any) {
            console.error("Error claiming rewards:", error)
            console.error("Error details:", error.message || error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Fragment>
            <Seo title={"Staking NFT"} />
            <div className='container'>
                {/* Title and Description Section */}
                <div className="grid grid-cols-12 gap-x-6 mt-10 mb-6 items-end">
                    {/* Left: Title + Description + Cards */}
                    <div className="col-span-12 md:col-span-6 flex flex-col">
                        <div className="w-full flex-grow">
                            <p className="text-4xl font-bold mb-1">Earn BCO2</p>
                            <p className='dark:text-white/60 mb-4'>
                                Stake your tokenized land plots (NFTs) to earn BCO2 rewards.<br />
                                The more NFTs you stake, the higher your earnings potential.
                            </p>
                        </div>
                            
                        {/* Available and Staked Plots Cards */}
                        <div className="flex flex-row gap-3 max-w-md">
                                {/* Available Plots */}
                                <div className="box flex-1 bg-primary/10">
                                    <div className="box-body !py-3 !px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <img src="../../../assets/images/svg/stakeI.svg" alt="Available" className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Available Plots
                                            </div>
                                            <div className="text-xl font-semibold ml-auto dark:text-white">
                                                {ownedNFTs.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Staked Plots */}
                                <div className="box flex-1 bg-secondary/10">
                                    <div className="box-body !py-3 !px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary/20 rounded-lg">
                                                <img src="../../../assets/images/svg/stakeIu.svg" alt="Staked" className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Staked Plots
                                            </div>
                                            <div className="text-xl font-semibold ml-auto dark:text-white">
                                                {stakedNFTs.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* Right: Total Earned and Current Earnings Cards */}
                    <div className="col-span-12 md:col-span-6 flex items-end justify-end mt-6 sm:mt-0">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {/* Total Earned */}
                            <div className="box relative overflow-hidden">
                                <div className="box-body">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            Total Earned
                                        </div>
                                        <div className="text-2xl font-semibold dark:text-white">
                                            {parseFloat(totalEarned).toFixed(4)} <span className="text-base">BCO2</span>
                                        </div>
                                    </div>
                                </div>
                                <img 
                                    src="../../../assets/images/svg/bigEarn.svg" 
                                    alt="Earnings" 
                                    className="absolute bottom-0 right-0 w-20 h-20 opacity-30"
                                />
                            </div>
                            {/* Current Earnings */}
                            <div className="box">
                                <div className="box-body">
                                    <div className="mb-3">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            Current Earnings
                                        </div>
                                        <div className="text-2xl font-semibold mb-2 dark:text-white">
                                            {parseFloat(currentEarnings).toFixed(4)} <span className="text-base">BCO2</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                            * BCO₂e = Bitgrass Carbon token
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClaimRewards}
                                        disabled={loading || parseFloat(currentEarnings) === 0}
                                        className="w-full bg-secondary text-white py-3 px-4 rounded-[0.25rem] hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Processing..." : "Claim BCO2"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-x-6 mt-6">
                    <div className="xl:col-span-12 col-span-12">
                        {/* Stats Cards - REMOVED OLD CARDS */}
                        <div className="grid grid-cols-12 gap-x-6 mb-6" style={{ display: 'none' }}>
                            <div className="xl:col-span-3 col-span-12">
                                <div className="box">
                                    <div className="box-body">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    Staked NFTs
                                                </div>
                                                <div className="text-2xl font-semibold">
                                                    {stakedNFTs.length}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <i className="bx bx-coin-stack text-2xl text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-3 col-span-12">
                                <div className="box">
                                    <div className="box-body">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    Current Earnings
                                                </div>
                                                <div className="text-2xl font-semibold">
                                                    {parseFloat(currentEarnings).toFixed(4)} Bco2
                                                </div>
                                            </div>
                                            <div className="p-3 bg-success/10 rounded-lg">
                                                <i className="bx bx-trending-up text-2xl text-success"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-3 col-span-12">
                                <div className="box">
                                    <div className="box-body">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    Available NFTs
                                                </div>
                                                <div className="text-2xl font-semibold">
                                                    {ownedNFTs.length}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-info/10 rounded-lg">
                                                <i className="bx bx-collection text-2xl text-info"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-3 col-span-12">
                                <div className="box">
                                    <div className="box-body">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    Total Earned
                                                </div>
                                                <div className="text-2xl font-semibold">
                                                    {parseFloat(totalEarned).toFixed(4)} Bco2
                                                </div>
                                            </div>
                                            <div className="p-3 bg-warning/10 rounded-lg">
                                                <i className="bx bx-wallet text-2xl text-warning"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pool Stats Table */}
                        <div className="mb-6 overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Table Headers */}
                                <div className="grid grid-cols-5 gap-4 mb-4 px-4">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pool Type</div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Your Staked Plots</div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Staked Plots</div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Your Earnings</div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</div>
                                </div>

                                {/* Pool Cards */}
                                <div className="grid grid-cols-1 gap-1">
                                {/* Legendary Pool */}
                                <div className="box border-1 dark:border-yellow-500/30 border-[#CA8A04]/30" style={{ marginBottom: '1rem' }}>
                                    <div className="box-body !p-3">
                                        <div className="grid grid-cols-5 gap-4 items-center">
                                            {/* Pool Type */}
                                            <div className="flex items-center gap-3">
                                                <img src="../../../assets/images/svg/lsvg.svg" alt="Legendary" className="w-10 h-10" />
                                                <div>
                                                    <h6 className="font-semibold text-sm mb-0">Legendary Pool</h6>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Asset ID 1-400</p>
                                                </div>
                                            </div>

                                            {/* Your Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{legendaryStats.staked}</p>
                                            </div>

                                            {/* Total Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{legendaryStats.totalStaked}<span className="text-sm text-gray-500 dark:text-gray-400"> / 400</span></p>
                                                <div className="w-1/2 bg-gray-300/50 dark:bg-gray-600/50 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-[#CA8A04] h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(legendaryStats.totalStaked / 400) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Your Earnings */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{parseFloat(legendaryStats.earnings).toFixed(4)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">BCo2</p>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <span style={{ fontSize: '12px' }} className="text-secondary text-sm rounded-sm !py-[0.35rem] !px-[0.35rem] badge !bg-secondary/10 ms-1 flex items-center gap-2">
                                                    <i className="bi bi-check-circle text-sm"></i>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Pool */}
                                <div className="box border-1 dark:border-blue-400/30 border-[#5ea9cc]/30" style={{ marginBottom: '1rem' }}>
                                    <div className="box-body !p-3">
                                        <div className="grid grid-cols-5 gap-4 items-center">
                                            {/* Pool Type */}
                                            <div className="flex items-center gap-3">
                                                <img src="../../../assets/images/svg/psvg.svg" alt="Premium" className="w-10 h-10" />
                                                <div>
                                                    <h6 className="font-semibold text-sm mb-0">Premium Pool</h6>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Asset ID 401-1200</p>
                                                </div>
                                            </div>

                                            {/* Your Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{premiumStats.staked}</p>
                                            </div>

                                            {/* Total Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{premiumStats.totalStaked}<span className="text-sm text-gray-500 dark:text-gray-400"> / 800</span></p>
                                                <div className="w-1/2 bg-gray-300/50 dark:bg-gray-600/50 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-[#5ea9cc] h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(premiumStats.totalStaked / 800) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Your Earnings */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{parseFloat(premiumStats.earnings).toFixed(4)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">BCo2</p>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <span style={{ fontSize: '12px' }} className="text-secondary text-sm rounded-sm !py-[0.35rem] !px-[0.35rem] badge !bg-secondary/10 ms-1 flex items-center gap-2">
                                                    <i className="bi bi-check-circle text-sm"></i>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Standard Pool */}
                                <div className="box border-1 dark:border-secondary/30 border-secondary/30 mb-4">
                                    <div className="box-body !p-3">
                                        <div className="grid grid-cols-5 gap-4 items-center">
                                            {/* Pool Type */}
                                            <div className="flex items-center gap-3">
                                                <img src="../../../assets/images/svg/ssvg.svg" alt="Standard" className="w-10 h-10" />
                                                <div>
                                                    <h6 className="font-semibold text-sm mb-0">Standard Pool</h6>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Asset ID 1201-3200</p>
                                                </div>
                                            </div>

                                            {/* Your Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{standardStats.staked}</p>
                                            </div>

                                            {/* Total Staked Plots */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{standardStats.totalStaked}<span className="text-sm text-gray-500 dark:text-gray-400"> / 2000</span></p>
                                                <div className="w-1/2 bg-gray-300/50 dark:bg-gray-600/50 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(standardStats.totalStaked / 2000) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Your Earnings */}
                                            <div>
                                                <p className="text-2xl font-bold dark:text-white">{parseFloat(standardStats.earnings).toFixed(4)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">BCo2</p>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <span style={{ fontSize: '12px' }} className="text-secondary text-sm rounded-sm !py-[0.35rem] !px-[0.35rem] badge !bg-secondary/10 ms-1 flex items-center gap-2">
                                                    <i className="bi bi-check-circle text-sm"></i>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>



                        {/* Main Content */}
                        <div className="box">
                            <div className="box-body">
                                <div className="md:flex block flex-wrap items-center justify-between mb-6">
                                    <div className="flex-grow">
                                        <nav className="nav nav-pills nav-style-3 flex md:mb-0 mb-4" aria-label="Tabs" role="tablist">
                                            <button
                                                onClick={() => setActiveTab('stake')}
                                                className={`nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary ${activeTab === 'stake' ? 'active' : ''}`}
                                            >
                                                <i className="ri-grid-line me-1"></i>
                                                Available Plots
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('unstake')}
                                                className={`nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary ${activeTab === 'unstake' ? 'active' : ''}`}
                                            >
                                                <i className="ri-lock-line me-1"></i>
                                                Staked Plots
                                            </button>
                                        </nav>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {!address ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Please connect your wallet to view your NFTs</p>
                                    </div>
                                ) : loadingNFTs ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
                                        <p className="mt-4 text-gray-500">Loading NFTs...</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'stake' && (
                                            <>
                                                {ownedNFTs.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <p className="text-gray-500">You don't have any NFTs to stake</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                                                            {ownedNFTs.map((nft) => {
                                                                const tokenId = Number(nft.id);
                                                                let tierImage = "/assets/images/apps/100m2v1.jpg";

                                                                if (tokenId >= 1 && tokenId <= 400) {
                                                                    tierImage = "/assets/images/apps/1000m2v1.jpg";
                                                                } else if (tokenId >= 401 && tokenId <= 1200) {
                                                                    tierImage = "/assets/images/apps/500m2v1.jpg";
                                                                }

                                                                return (
                                                                    <div
                                                                        key={nft.id.toString()}
                                                                        className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12"
                                                                    >
                                                                        <div className={`box overflow-hidden transition-all duration-200 ${selectedNFTs.includes(nft.id.toString()) ? 'ring-4 ring-primary' : ''}`}>
                                                                            <div className="relative aspect-[4/5]">
                                                                                <img
                                                                                    src={tierImage}
                                                                                    className="w-full h-full object-cover rounded-t-lg"
                                                                                    alt={nft.metadata?.name || `NFT #${nft.id}`}
                                                                                />

                                                                                {/* Plus icon for selection */}
                                                                                <button
                                                                                    onClick={() => handleSelectNFT(nft.id.toString())}
                                                                                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${selectedNFTs.includes(nft.id.toString())
                                                                                        ? 'bg-primary text-white scale-110'
                                                                                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white'
                                                                                        }`}
                                                                                >
                                                                                    {selectedNFTs.includes(nft.id.toString()) ? (
                                                                                        <i className="ri-check-line text-lg"></i>
                                                                                    ) : (
                                                                                        <i className="ri-add-line text-lg"></i>
                                                                                    )}
                                                                                </button>
                                                                            </div>

                                                                            <div className="box-body bg-camel">
                                                                                {/* Category Icon and Plot Name */}
                                                                                <div className="flex items-center mb-4">
                                                                                    <img
                                                                                        src={
                                                                                            tokenId >= 1 && tokenId <= 400
                                                                                                ? "/assets/images/svg/lsvg.svg"
                                                                                                : tokenId >= 401 && tokenId <= 1200
                                                                                                    ? "/assets/images/svg/psvg.svg"
                                                                                                    : "/assets/images/svg/ssvg.svg"
                                                                                        }
                                                                                        alt="Category"
                                                                                        className="w-8 h-8 me-3"
                                                                                    />
                                                                                    <p className="mb-0 font-semibold text-sm">
                                                                                        {tokenId >= 1 && tokenId <= 400
                                                                                            ? "Legendary"
                                                                                            : tokenId >= 401 && tokenId <= 1200
                                                                                                ? "Premium"
                                                                                                : "Standard"} Plot #{String(tokenId).padStart(3, '0')}
                                                                                    </p>
                                                                                </div>

                                                                                {/* Earn/day */}
                                                                                <div className="flex items-center justify-between mb-4">
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Earn / Day</span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <rect x="0.46875" y="0.46875" width="14.0625" height="14.0625" rx="7.03125" stroke="rgb(var(--primary))" stroke-width="0.9375" />
                                                                                            <path d="M11.1239 4.24193C11.1197 4.16941 11.089 4.10098 11.0376 4.04961C10.9863 3.99824 10.9178 3.96753 10.8453 3.96329C8.02445 3.79767 5.76496 4.64692 4.80158 6.2402C4.46764 6.78522 4.30309 7.41714 4.32878 8.05581C4.34555 8.46422 4.42865 8.86718 4.57481 9.24891C4.5834 9.27241 4.5978 9.29334 4.61666 9.30977C4.63552 9.32621 4.65823 9.3376 4.68268 9.34289C4.70712 9.34817 4.73251 9.34719 4.75648 9.34002C4.78044 9.33286 4.8022 9.31974 4.81973 9.3019L7.96925 6.10422C7.99679 6.07668 8.02948 6.05483 8.06547 6.03993C8.10145 6.02502 8.14002 6.01735 8.17897 6.01735C8.21791 6.01735 8.25648 6.02502 8.29247 6.03993C8.32845 6.05483 8.36115 6.07668 8.38869 6.10422C8.41623 6.13176 8.43807 6.16446 8.45298 6.20044C8.46788 6.23642 8.47556 6.27499 8.47556 6.31394C8.47556 6.35289 8.46788 6.39146 8.45298 6.42744C8.43807 6.46342 8.41623 6.49612 8.38869 6.52366L4.94683 10.0174L4.42104 10.5432C4.36636 10.5964 4.33372 10.6683 4.3296 10.7445C4.32548 10.8207 4.35019 10.8956 4.39881 10.9545C4.42544 10.9853 4.45814 11.0103 4.49487 11.028C4.5316 11.0456 4.57157 11.0555 4.61229 11.057C4.653 11.0585 4.69359 11.0515 4.73151 11.0366C4.76944 11.0218 4.80388 10.9992 4.8327 10.9704L5.45482 10.3483C5.97875 10.6017 6.5075 10.7399 7.0318 10.7585C7.07306 10.7599 7.11418 10.7607 7.15519 10.7607C7.75226 10.7622 8.33801 10.5977 8.84703 10.2857C10.4403 9.32228 11.2899 7.06315 11.1239 4.24193Z" fill="rgb(var(--primary))" />
                                                                                        </svg>
                                                                                        <span className="text-sm font-semibold">
                                                                                            {tokenId >= 1 && tokenId <= 400
                                                                                                ? "0.001"
                                                                                                : tokenId >= 401 && tokenId <= 1200
                                                                                                    ? "0.0005"
                                                                                                    : "0.00001"} BCo2
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Stake Button */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedNFTs([nft.id.toString()])
                                                                                        handleStake()
                                                                                    }}
                                                                                    disabled={loading}
                                                                                    className="ti-btn w-full text-white bg-primary dark:bg-secondary hover:bg-primary/80 dark:hover:bg-secondary/80 px-6 py-2 !font-medium"
                                                                                >
                                                                                    Stake
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Multi-stake button (only show if NFTs selected) */}
                                                        {selectedNFTs.length > 0 && (
                                                            <div className="mt-6 mb-4">
                                                                <button
                                                                    onClick={handleStake}
                                                                    disabled={loading}
                                                                    className="ti-btn ti-btn-primary w-full text-lg py-3"
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                                                            Staking...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="ri-lock-2-line mr-2"></i>
                                                                            Stake {selectedNFTs.length} Selected NFT{selectedNFTs.length !== 1 ? 's' : ''}
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {activeTab === 'unstake' && (
                                            <>
                                                {stakedNFTs.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <p className="text-gray-500">You don't have any staked NFTs</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                                                            {stakedNFTs.map((nft) => {
                                                                const tokenId = Number(nft.tokenId);
                                                                let tierImage = "/assets/images/apps/100m2v1.jpg";

                                                                if (tokenId >= 1 && tokenId <= 400) {
                                                                    tierImage = "/assets/images/apps/1000m2v1.jpg";
                                                                } else if (tokenId >= 401 && tokenId <= 1200) {
                                                                    tierImage = "/assets/images/apps/500m2v1.jpg";
                                                                }

                                                                return (
                                                                    <div
                                                                        key={nft.tokenId.toString()}
                                                                        className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12"
                                                                    >
                                                                        <div className={`box overflow-hidden transition-all duration-200 ${selectedNFTs.includes(nft.tokenId.toString()) ? 'ring-4 ring-danger' : ''}`}>
                                                                            <div className="relative aspect-[4/5]">
                                                                                <img
                                                                                    src={tierImage}
                                                                                    className="w-full h-full object-cover rounded-t-lg"
                                                                                    alt={`NFT #${nft.tokenId}`}
                                                                                />

                                                                                {/* Plus icon for selection */}
                                                                                <button
                                                                                    onClick={() => handleSelectNFT(nft.tokenId.toString())}
                                                                                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${selectedNFTs.includes(nft.tokenId.toString())
                                                                                        ? 'bg-danger text-white scale-110'
                                                                                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-danger hover:text-white'
                                                                                        }`}
                                                                                >
                                                                                    {selectedNFTs.includes(nft.tokenId.toString()) ? (
                                                                                        <i className="ri-check-line text-lg"></i>
                                                                                    ) : (
                                                                                        <i className="ri-add-line text-lg"></i>
                                                                                    )}
                                                                                </button>

                                                                                {/* Staking badge */}
                                                                                <div className="absolute top-3 left-3 z-10 bg-success/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                                    <i className="ri-lock-line"></i>
                                                                                    Staked
                                                                                </div>
                                                                            </div>

                                                                            <div className="box-body bg-camel">
                                                                                {/* Category Icon and Plot Name */}
                                                                                <div className="flex items-center mb-4">
                                                                                    <img
                                                                                        src={
                                                                                            tokenId >= 1 && tokenId <= 400
                                                                                                ? "/assets/images/svg/lsvg.svg"
                                                                                                : tokenId >= 401 && tokenId <= 1200
                                                                                                    ? "/assets/images/svg/ppsvg.svg"
                                                                                                    : "/assets/images/svg/ssvg.svg"
                                                                                        }
                                                                                        alt="Category"
                                                                                        className="w-8 h-8 me-3"
                                                                                    />
                                                                                    <p className="mb-0 font-semibold text-sm">
                                                                                        {tokenId >= 1 && tokenId <= 400
                                                                                            ? "Legendary"
                                                                                            : tokenId >= 401 && tokenId <= 1200
                                                                                                ? "Premium"
                                                                                                : "Standard"} Plot #{String(tokenId).padStart(3, '0')}
                                                                                    </p>
                                                                                </div>

                                                                                {/* Earn/day */}
                                                                                <div className="flex items-center justify-between mb-4">
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Earn / Day</span>
                                                                                    <div className="flex items-center gap-1">

                                                                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <rect x="0.46875" y="0.46875" width="14.0625" height="14.0625" rx="7.03125" stroke="rgb(var(--primary))" stroke-width="0.9375" />
                                                                                            <path d="M11.1239 4.24193C11.1197 4.16941 11.089 4.10098 11.0376 4.04961C10.9863 3.99824 10.9178 3.96753 10.8453 3.96329C8.02445 3.79767 5.76496 4.64692 4.80158 6.2402C4.46764 6.78522 4.30309 7.41714 4.32878 8.05581C4.34555 8.46422 4.42865 8.86718 4.57481 9.24891C4.5834 9.27241 4.5978 9.29334 4.61666 9.30977C4.63552 9.32621 4.65823 9.3376 4.68268 9.34289C4.70712 9.34817 4.73251 9.34719 4.75648 9.34002C4.78044 9.33286 4.8022 9.31974 4.81973 9.3019L7.96925 6.10422C7.99679 6.07668 8.02948 6.05483 8.06547 6.03993C8.10145 6.02502 8.14002 6.01735 8.17897 6.01735C8.21791 6.01735 8.25648 6.02502 8.29247 6.03993C8.32845 6.05483 8.36115 6.07668 8.38869 6.10422C8.41623 6.13176 8.43807 6.16446 8.45298 6.20044C8.46788 6.23642 8.47556 6.27499 8.47556 6.31394C8.47556 6.35289 8.46788 6.39146 8.45298 6.42744C8.43807 6.46342 8.41623 6.49612 8.38869 6.52366L4.94683 10.0174L4.42104 10.5432C4.36636 10.5964 4.33372 10.6683 4.3296 10.7445C4.32548 10.8207 4.35019 10.8956 4.39881 10.9545C4.42544 10.9853 4.45814 11.0103 4.49487 11.028C4.5316 11.0456 4.57157 11.0555 4.61229 11.057C4.653 11.0585 4.69359 11.0515 4.73151 11.0366C4.76944 11.0218 4.80388 10.9992 4.8327 10.9704L5.45482 10.3483C5.97875 10.6017 6.5075 10.7399 7.0318 10.7585C7.07306 10.7599 7.11418 10.7607 7.15519 10.7607C7.75226 10.7622 8.33801 10.5977 8.84703 10.2857C10.4403 9.32228 11.2899 7.06315 11.1239 4.24193Z" fill="rgb(var(--primary))" />
                                                                                        </svg>

                                                                                        <span className="text-sm font-semibold">
                                                                                            {tokenId >= 1 && tokenId <= 400
                                                                                                ? "0.001"
                                                                                                : tokenId >= 401 && tokenId <= 1200
                                                                                                    ? "0.0005"
                                                                                                    : "0.00001"} BCo2
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Unstake Button */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedNFTs([nft.tokenId.toString()])
                                                                                        handleWithdraw()
                                                                                    }}
                                                                                    disabled={loading}
                                                                                    className="ti-btn w-full text-white bg-primary dark:bg-secondary hover:bg-primary/80 dark:hover:bg-secondary/80 px-6 py-2 !font-medium"
                                                                                >
                                                                                    Unstake
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Multi-unstake button (only show if NFTs selected) */}
                                                        {selectedNFTs.length > 0 && (
                                                            <div className="mt-6 mb-4">
                                                                <button
                                                                    onClick={handleWithdraw}
                                                                    disabled={loading}
                                                                    className="ti-btn ti-btn-danger w-full text-lg py-3"
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                                                            Withdrawing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="ri-lock-unlock-line mr-2"></i>
                                                                            Unstake {selectedNFTs.length} Selected NFT{selectedNFTs.length !== 1 ? 's' : ''}
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:left-auto md:right-6 md:translate-x-0 max-w-[90vw] md:max-w-none">
                    <div
                        role="alert"
                        className="bg-camel shadow-lg rounded-md w-full max-w-2xl min-w-[320px] px-5 py-4"
                    >
                        <div className="flex items-center gap-4 w-full">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <img
                                    src={toastType === 'stake' ? '/assets/images/svg/Staked.svg' : '/assets/images/svg/Unstaked.svg'}
                                    alt={toastType === 'stake' ? 'Staked' : 'Unstaked'}
                                    width={30}
                                    height={30}
                                    className="rounded"
                                />
                            </div>

                            {/* Text */}
                            <div className="flex-1 text-center px-2">
                                <strong className="text-sm font-bold break-words">
                                    Plot #{stakedTokenIds.join(', #')} successfully {toastType === 'stake' ? 'staked' : 'unstaked'}
                                </strong>
                            </div>

                            {/* Checkmark */}
                            <div className="flex-shrink-0">
                                <i className="ri-check-line text-2xl text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    )
}

export default StakingNFT
