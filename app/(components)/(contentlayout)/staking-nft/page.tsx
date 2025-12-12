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

// Contract addresses
const STAKING_CONTRACT_ADDRESS = "0xDBfB6672125776176Bd9F154A0b4bbC8F63192A6"
const NFT_COLLECTION_ADDRESS = "0x23308734dfaaae503c686720fff26126fcdc22c7"
const REWARD_TOKEN_ADDRESS = "0x20429F731096e359910921994A267d32ef576720" // SCAN token

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

    // Get contracts
    const stakingContract = getContract({
        client,
        chain: baseChain,
        address: STAKING_CONTRACT_ADDRESS,
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
                
                // Fetch staked NFTs info using getStakeInfo
                let stakedTokenIdsList: bigint[] = []
                try {
                    console.log("Fetching staked NFTs for address:", address)
                    const stakeInfo = await readContract({
                        contract: stakingContract,
                        method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                        params: [address]
                    })
                    
                    console.log("Stake info received:", stakeInfo)
                    
                    if (stakeInfo && stakeInfo[0] && stakeInfo[0].length > 0) {
                        console.log("Staked token IDs:", stakeInfo[0])
                        stakedTokenIdsList = stakeInfo[0] as bigint[]
                        
                        const stakedTokenIds = stakeInfo[0].map((tokenId: bigint) => ({
                            tokenId: tokenId
                        }))
                        console.log("Processed staked NFTs:", stakedTokenIds)
                        setStakedNFTs(stakedTokenIds)
                        
                        // Set current earnings from stakeInfo
                        const rewardsInWei = stakeInfo[1]
                        const rewardsInEther = ethers.formatUnits(rewardsInWei.toString(), 18)
                        console.log("Current earnings:", rewardsInEther)
                        setCurrentEarnings(rewardsInEther)
                    } else {
                        console.log("No staked NFTs found")
                        setStakedNFTs([])
                        setCurrentEarnings("0")
                    }
                } catch (error) {
                    console.log("No staked NFTs or error fetching:", error)
                    setStakedNFTs([])
                    setCurrentEarnings("0")
                }
                
                // Calculate total earned using Moralis API
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
                        
                        let total = BigInt(0)
                        let claimCount = 0
                        
                        // Filter for transfers FROM staking contract TO user
                        for (const tx of data.result) {
                            if (tx.from_address?.toLowerCase() === '0xdbfb6672125776176bd9f154a0b4bbc8f63192a6' && 
                                tx.to_address?.toLowerCase() === address.toLowerCase()) {
                                const amount = ethers.formatUnits(tx.value, 18)
                                console.log(`✅ Claim #${++claimCount}: ${amount} SCAN (tx: ${tx.transaction_hash})`)
                                total += BigInt(tx.value)
                            }
                        }
                        
                        const totalEarnedEther = ethers.formatUnits(total.toString(), 18)
                        console.log(`Total earned: ${totalEarnedEther} SCAN from ${claimCount} claims`)
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
    
    // Separate effect for refreshing rewards only (not NFTs)
    useEffect(() => {
        if (!address || stakedNFTs.length === 0) return
        
        const refreshRewards = async () => {
            try {
                const stakeInfo = await readContract({
                    contract: stakingContract,
                    method: "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
                    params: [address]
                })
                
                if (stakeInfo && stakeInfo[1]) {
                    const rewardsInWei = stakeInfo[1]
                    const rewardsInEther = ethers.formatUnits(rewardsInWei.toString(), 18)
                    setCurrentEarnings(rewardsInEther)
                }
            } catch (error) {
                console.error("Error refreshing rewards:", error)
            }
        }
        
        // Refresh rewards every 10 seconds
        const interval = setInterval(refreshRewards, 10000)
        return () => clearInterval(interval)
    }, [address, stakedNFTs.length])



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

        setLoading(true)
        try {
            console.log("Checking approval...")
            // Check if approved
            const approved = await isApprovedForAll({
                contract: nftContract,
                owner: address,
                operator: STAKING_CONTRACT_ADDRESS,
            })

            console.log("Approved:", approved)

            // If not approved, approve first
            if (!approved) {
                console.log("Requesting approval...")
                
                // Use wagmi/viem to send approval transaction
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
                    args: [STAKING_CONTRACT_ADDRESS, true]
                })
                
                const hash = await walletClient.sendTransaction({
                    to: NFT_COLLECTION_ADDRESS as `0x${string}`,
                    data: approvalData as `0x${string}`,
                    account: address as `0x${string}`,
                })
                console.log("Approval tx hash:", hash)
                
                // Wait a bit for the transaction to be mined
                console.log("Waiting for approval transaction to be confirmed...")
                await new Promise(resolve => setTimeout(resolve, 3000))
            }

            // Stake all selected NFTs in one transaction
            console.log("Staking NFTs:", selectedNFTs)
            const tokenIds = selectedNFTs.map(id => BigInt(id))
            
            // Encode stake function call
            const stakeData = encodeFunctionData({
                abi: [{
                    name: 'stake',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
                    outputs: []
                }],
                functionName: 'stake',
                args: [tokenIds]
            })
            
            const stakeHash = await walletClient.sendTransaction({
                to: STAKING_CONTRACT_ADDRESS as `0x${string}`,
                data: stakeData as `0x${string}`,
                account: address as `0x${string}`,
            })
            console.log("Stake tx hash:", stakeHash)

            console.log("NFTs staked successfully!")
            // Refresh NFTs after staking
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
            console.log("Withdrawing NFTs:", selectedNFTs)
            const tokenIds = selectedNFTs.map(id => BigInt(id))
            
            // Encode withdraw function call
            const withdrawData = encodeFunctionData({
                abi: [{
                    name: 'withdraw',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
                    outputs: []
                }],
                functionName: 'withdraw',
                args: [tokenIds]
            })
            
            const withdrawHash = await walletClient.sendTransaction({
                to: STAKING_CONTRACT_ADDRESS as `0x${string}`,
                data: withdrawData as `0x${string}`,
                account: address as `0x${string}`,
            })
            console.log("Withdraw tx hash:", withdrawHash)

            console.log("NFTs withdrawn successfully!")
            // Refresh NFTs after withdrawal
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
            console.log("Claiming rewards...")
            
            // Encode claimRewards function call (no parameters)
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
            
            const claimHash = await walletClient.sendTransaction({
                to: STAKING_CONTRACT_ADDRESS as `0x${string}`,
                data: claimData as `0x${string}`,
                account: address as `0x${string}`,
            })
            console.log("Claim tx hash:", claimHash)
            console.log("Transaction sent, waiting for confirmation...")

            // Wait a bit for transaction to be mined
            await new Promise(resolve => setTimeout(resolve, 3000))
            
            console.log("Rewards claimed successfully!")
            // Trigger refresh
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

                        {/* Claim Rewards Button */}
                        {stakedNFTs.length > 0 && parseFloat(currentEarnings) > 0 && (
                            <div className="mb-6">
                                <button
                                    onClick={handleClaimRewards}
                                    disabled={loading}
                                    className="ti-btn ti-btn-success w-full"
                                >
                                    {loading ? "Processing..." : "Claim Rewards"}
                                </button>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="box">
                            <div className="box-header">
                                <div className="flex items-center justify-between w-full">
                                    <h5 className="box-title">NFT Staking</h5>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('stake')}
                                            className={`ti-btn ${activeTab === 'stake' ? 'ti-btn-primary' : 'ti-btn-outline-primary'}`}
                                        >
                                            Stake
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('unstake')}
                                            className={`ti-btn ${activeTab === 'unstake' ? 'ti-btn-primary' : 'ti-btn-outline-primary'}`}
                                        >
                                            Unstake
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="box-body">
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
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                                            {ownedNFTs.map((nft) => (
                                                                <div
                                                                    key={nft.id.toString()}
                                                                    onClick={() => handleSelectNFT(nft.id.toString())}
                                                                    className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                                                                        selectedNFTs.includes(nft.id.toString())
                                                                            ? 'border-primary bg-primary/10'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                                                    }`}
                                                                >
                                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                                                                        {nft.metadata?.image ? (
                                                                            <img
                                                                                src={nft.metadata.image}
                                                                                alt={nft.metadata.name || `NFT #${nft.id}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <i className="bx bx-image text-4xl text-gray-400"></i>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm font-medium text-center">
                                                                        {nft.metadata?.name || `#${nft.id}`}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={handleStake}
                                                            disabled={loading || selectedNFTs.length === 0}
                                                            className="ti-btn ti-btn-primary w-full"
                                                        >
                                                            {loading ? "Staking..." : `Stake ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`}
                                                        </button>
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
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                                            {stakedNFTs.map((nft) => (
                                                                <div
                                                                    key={nft.tokenId.toString()}
                                                                    onClick={() => handleSelectNFT(nft.tokenId.toString())}
                                                                    className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                                                                        selectedNFTs.includes(nft.tokenId.toString())
                                                                            ? 'border-primary bg-primary/10'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                                                    }`}
                                                                >
                                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                                                                        <i className="bx bx-image text-4xl text-gray-400"></i>
                                                                    </div>
                                                                    <div className="text-sm font-medium text-center">
                                                                        #{nft.tokenId.toString()}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={handleWithdraw}
                                                            disabled={loading || selectedNFTs.length === 0}
                                                            className="ti-btn ti-btn-danger w-full"
                                                        >
                                                            {loading ? "Withdrawing..." : `Withdraw ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`}
                                                        </button>
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
