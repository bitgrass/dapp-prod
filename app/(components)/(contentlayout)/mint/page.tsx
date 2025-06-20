"use client"
import Pageheader from '@/shared/layout-components/page-header/pageheader'
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { NFTMintCard } from '@coinbase/onchainkit/nft';
import { NFTMedia } from '@coinbase/onchainkit/nft/view';
import {
    NFTCreator,
    NFTCollectionTitle,
    NFTQuantitySelector,
    NFTAssetCost,
    NFTMintButton,
} from '@coinbase/onchainkit/nft/mint';
// import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import Link from 'next/link';
import { NFTCard } from '@coinbase/onchainkit/nft';
import { nftInfo } from '@/shared/data/tokens/data';

const Nftdetails = () => {


    return (
        <Fragment>
            <Seo title={"NFT Details"} />
            <div className='container'>
                <div className="box custom-box overflow-hidden mt-6">
                    <div className="box-body">

                        <div className="grid grid-cols-12 md:gap-x-[3rem]">
                            <div className="xl:col-span-4 col-span-12">
                                <div>
                                    <NFTMintCard
                                        contractAddress={nftInfo.address as any}
                                        className="mintNFT">
                                                                            <NFTCreator />


  <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
    <img
      src="../../assets/images/apps/100m2.jpg" 
      alt="Custom NFT Preview"
      className="object-cover w-full h-full"
    />
  </div>

                            <p className="text-[1.5rem] font-bold mb-0">Bitgrass</p>
                                <NFTQuantitySelector />
                                <NFTAssetCost />
                                <NFTMintButton />
                            </NFTMintCard>

                        </div>
                    </div>
                    <div className="xl:col-span-8 col-span-12">
                        <div className="xxl:mt-0 mt-4">
                            <p className="text-[1.125rem] font-semibold mb-0">Bitgrass NFT Collection - Standard</p>
                            <p className="text-[1.125rem] mb-4">
                                <i className="ri-circle-fill text-success align-middle"></i>
                                <span className="font-semibold  dark:text-white/50"><Link className="text-[0.875rem] ms-2" href="#!" scroll={false}>Live on July 1, 2025 </Link></span>
                            </p>
                            <div className="grid grid-cols-12 mb-6">
                                <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                    <p className="mb-1 text-[.9375rem] font-semibold">Price</p>
                                    <div className="flex items-center font-semibold">
                                        <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1 "><img src="../../../assets/images/brand-logos/eth.png" alt="" /></span>
                                        0.05 ETH
                                    </div>                                        </div>
                                <div className="xxl:col-span-4 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-12  col-span-12 xxl:mt-0 mt-4">
                                    <p className="mb-1 text-[.9375rem] font-semibold">Creator</p>
                                    <div className="flex items-center font-semibold">
                                        <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1 "><img src="../../../assets/images/faces/faviconDark.png" alt="" /></span>
                                        Bitgrass
                                    </div>
                                </div>
                                <div className="xxl:col-span-5 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-12 col-span-12 xxl:mt-0 mt-4">
                                    <p className="mb-1 text-[.9375rem] font-semibold">Published</p>
                                    <span className="block font-semibold mt-2">Soon</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-[.9375rem] font-semibold mb-1">Description :</p>
                                <p>
                                    <b>Discover the Bitgrass NFT </b>—a <b> Tokenized 100m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>. <br />
                                    This NFT offers multiple utilities: Boost your $BTG APY, earn Carbon credits or $BTG by staking your Landplot, or choose to burn it to offset your carbon footprint. Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.                                        </p>
                            </div>
                            <div className="mb-4">
                                <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                    <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-4 sm:col-span-4 col-span-12">
                                        <div className="ecommerce-assurance">
                                            <p className="mb-4 !inline-flex">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                    <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path><path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                </svg>                                                    </p>
                                            <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership
                                            </p>
                                        </div>
                                    </div>
                                    <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-4 sm:col-span-4 col-span-12 sm:mt-0 mt-4">
                                        <div className="ecommerce-assurance">
                                            <p className="mb-4 !inline-flex">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                    <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                </svg>                                                    </p>
                                            <p className="text-[0.875rem] font-semibold mb-0">
                                                Backed by Real Land

                                            </p>
                                        </div>
                                    </div>
                                    <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-4 sm:col-span-4 col-span-12 sm:mt-0 mt-4">
                                        <div className="ecommerce-assurance">
                                            <p className="mb-4 !inline-flex">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                    <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path><path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path><path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path><path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path><path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path><path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
                                                </svg>                                                    </p>
                                            <p className="text-[0.875rem] font-semibold mb-0">
                                                Community Governance

                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-[.9375rem] font-semibold mb-2">NFT Details :</p>
                                <div className="table-responsive">
                                    <table className="table table-bordered whitespace-nowrap min-w-full">
                                        <tbody>
                                            <tr className="border-b border-defaultborder">
                                                <th scope="row" className="font-semibold text-start">
                                                    Type
                                                </th>
                                                <td>ERC-721</td>
                                            </tr>
                                            <tr className="border-b border-defaultborder">
                                                <th scope="row" className="font-semibold text-start">
                                                    Rarity
                                                </th>
                                                <td>

                                                    Standard                                                        </td>
                                            </tr>
                                            <tr className="border-b border-defaultborder">
                                                <th scope="row" className="font-semibold text-start">
                                                    Total Supply                                                        </th>
                                                <td>
                                                    3.200 NFTs                                                        </td>
                                            </tr>
                                            <tr className="border-b border-defaultborder">
                                                <th scope="row" className="font-semibold text-start">
                                                    Covered Area                                                        </th>
                                                <td>
                                                    100m² (each NFT corresponds to real-world land-plot)                                                        </td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="font-semibold text-start">
                                                    Utility                                                        </th>
                                                <td>

                                                    Stake to earn carbon credits or $BTG / Burn to offset your carbon footprint


                                                </td>
                                            </tr>
                                            <tr className="border-b border-defaultborder">
                                                <th scope="row" className="font-semibold text-start">
                                                    Carbon removal Potential
                                                </th>
                                                <td>
                                                    up to 0.1 TCO2                                                     </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
            </div >
        </Fragment >
    )
}

export default Nftdetails