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
                            
                            const data : any = await response.json()
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
            setSelectedNFTs([])
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
            setSelectedNFTs([])
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
                if (legendaryInfo && legendaryInfo[1] && legendaryInfo[1] >BigInt(0)) {
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
                <div className="grid grid-cols-12 gap-x-6 mt-6">
                    <div className="xl:col-span-12 col-span-12">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-12 gap-x-6 mb-6">
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
                                                    {parseFloat(currentEarnings).toFixed(4)} SCAN
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
                                                    {parseFloat(totalEarned).toFixed(4)} SCAN
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

                        {/* Pool Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            {/* Legendary Pool */}
                            <div className="box bg-gradient-to-r from-[#CA8A04]/10 to-[#CA8A04]/5 border-2 dark:border-yellow-500/30 border-[#CA8A04]/30">
                                <div className="box-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-[#CA8A04]/20 flex items-center justify-center">
                                                <img src="../../../assets/images/brand-logos/Legendary.svg" alt="Legendary" className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-lg mb-0">Legendary Pool</h6>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Token ID 1-400</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Staked Plots</p>
                                            <p className="text-2xl font-bold">{legendaryStats.staked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Staked Plots</p>
                                            <p className="text-2xl font-bold">{legendaryStats.totalStaked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Earnings</p>
                                            <p className="text-2xl font-bold">{parseFloat(legendaryStats.earnings).toFixed(4)} SCAN</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Pool */}
                            <div className="box bg-gradient-to-r from-[#5ea9cc]/10 to-[#5ea9cc]/5 border-2 dark:border-blue-400/30 border-[#5ea9cc]/30">
                                <div className="box-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-[#5ea9cc]/20 flex items-center justify-center">
                                                <img src="../../../assets/images/brand-logos/Premium.svg" alt="Premium" className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-lg mb-0">Premium Pool</h6>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Token ID 401-1200</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Staked Plots</p>
                                            <p className="text-2xl font-bold">{premiumStats.staked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Staked Plots</p>
                                            <p className="text-2xl font-bold">{premiumStats.totalStaked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Earnings</p>
                                            <p className="text-2xl font-bold">{parseFloat(premiumStats.earnings).toFixed(4)} SCAN</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Standard Pool */}
                            <div className="box bg-gradient-to-r from-secondary/10 to-secondary/5 border-2 dark:border-secondary/30 border-secondary/30">
                                <div className="box-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-secondary/20 flex items-center justify-center">
                                                <img src="../../../assets/images/brand-logos/Standard.svg" alt="Standard" className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-lg mb-0">Standard Pool</h6>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Token ID 1201-3200</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Staked Plots</p>
                                            <p className="text-2xl font-bold">{standardStats.staked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Staked Plots</p>
                                            <p className="text-2xl font-bold">{standardStats.totalStaked}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Earnings</p>
                                            <p className="text-2xl font-bold">{parseFloat(standardStats.earnings).toFixed(4)} SCAN</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Claim Rewards Button */}
                        {parseFloat(currentEarnings) > 0 && (
                            <div className="mb-6">
                                <button
                                    onClick={handleClaimRewards}
                                    disabled={loading}
                                    className="ti-btn ti-btn-success w-full"
                                >
                                    {loading ? "Processing..." : "Claim All Rewards"}
                                </button>
                            </div>
                        )}

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
                                                <i className="ri-lock-line me-1"></i>
                                                Stake
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('unstake')}
                                                className={`nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary ${activeTab === 'unstake' ? 'active' : ''}`}
                                            >
                                                <i className="ri-lock-unlock-line me-1"></i>
                                                Unstake
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
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                                                            {ownedNFTs.map((nft) => (
                                                                <div
                                                                    key={nft.id.toString()}
                                                                    className="group relative"
                                                                    style={{
                                                                        perspective: '1000px'
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={`relative rounded-xl overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-y-2 ${
                                                                            selectedNFTs.includes(nft.id.toString())
                                                                                ? 'ring-4 ring-primary shadow-xl shadow-primary/50'
                                                                                : 'shadow-lg group-hover:shadow-2xl'
                                                                        }`}
                                                                        style={{
                                                                            transformStyle: 'preserve-3d',
                                                                            transition: 'transform 0.3s ease'
                                                                        }}
                                                                    >
                                                                        {/* Plus icon for multi-select */}
                                                                        <button
                                                                            onClick={() => handleSelectNFT(nft.id.toString())}
                                                                            className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                                                selectedNFTs.includes(nft.id.toString())
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

                                                                        {/* NFT Image */}
                                                                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                                                            {nft.metadata?.image ? (
                                                                                <img
                                                                                    src={nft.metadata.image}
                                                                                    alt={nft.metadata.name || `NFT #${nft.id}`}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <i className="bx bx-image text-5xl text-gray-400"></i>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* NFT Info & Stake Button (on hover) */}
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                                            <div className="text-white font-semibold mb-3 text-center">
                                                                                {nft.metadata?.name || `NFT #${nft.id}`}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedNFTs([nft.id.toString()])
                                                                                    handleStake()
                                                                                }}
                                                                                disabled={loading}
                                                                                className="w-full ti-btn ti-btn-primary !flex items-center justify-center"
                                                                            >
                                                                                <i className="ri-lock-line mr-1"></i>
                                                                                Stake Now
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Multi-stake button (only show if NFTs selected) */}
                                                        {selectedNFTs.length > 0 && (
                                                            <div className="sticky bottom-4 z-20">
                                                                <button
                                                                    onClick={handleStake}
                                                                    disabled={loading}
                                                                    className="ti-btn ti-btn-primary w-full shadow-2xl text-lg py-3"
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <span className="animate-spin mr-2">⏳</span>
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
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                                                            {stakedNFTs.map((nft) => (
                                                                <div
                                                                    key={nft.tokenId.toString()}
                                                                    className="group relative"
                                                                    style={{
                                                                        perspective: '1000px'
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={`relative rounded-xl overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-y-2 ${
                                                                            selectedNFTs.includes(nft.tokenId.toString())
                                                                                ? 'ring-4 ring-danger shadow-xl shadow-danger/50'
                                                                                : 'shadow-lg group-hover:shadow-2xl'
                                                                        }`}
                                                                        style={{
                                                                            transformStyle: 'preserve-3d',
                                                                            transition: 'transform 0.3s ease'
                                                                        }}
                                                                    >
                                                                        {/* Plus icon for multi-select */}
                                                                        <button
                                                                            onClick={() => handleSelectNFT(nft.tokenId.toString())}
                                                                            className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                                                selectedNFTs.includes(nft.tokenId.toString())
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
                                                                        <div className="absolute top-2 left-2 z-10 bg-success/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                            <i className="ri-lock-line"></i>
                                                                            Staked
                                                                        </div>

                                                                        {/* NFT Image */}
                                                                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                                                            <i className="bx bx-image text-5xl text-gray-400"></i>
                                                                        </div>

                                                                        {/* NFT Info & Unstake Button (on hover) */}
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                                            <div className="text-white font-semibold mb-3 text-center">
                                                                                NFT #{nft.tokenId.toString()}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedNFTs([nft.tokenId.toString()])
                                                                                    handleWithdraw()
                                                                                }}
                                                                                disabled={loading}
                                                                                className="w-full ti-btn ti-btn-danger !flex items-center justify-center"
                                                                            >
                                                                                <i className="ri-lock-unlock-line mr-1"></i>
                                                                                Unstake Now
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Multi-unstake button (only show if NFTs selected) */}
                                                        {selectedNFTs.length > 0 && (
                                                            <div className="sticky bottom-4 z-20">
                                                                <button
                                                                    onClick={handleWithdraw}
                                                                    disabled={loading}
                                                                    className="ti-btn ti-btn-danger w-full shadow-2xl text-lg py-3"
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <span className="animate-spin mr-2">⏳</span>
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
        </Fragment>
    )
}

export default StakingNFT
