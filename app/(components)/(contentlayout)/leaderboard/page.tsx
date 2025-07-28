"use client";
import { ProjectListdata } from '@/shared/data/apps/jobs/ProjectListdata';
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePrivy } from '@privy-io/react-auth';

const Select = dynamic(() => import("react-select"), { ssr: false });

const leaderboard = () => {
    const { authenticated, login } = usePrivy();

    const RankIcon = (
        <svg width="21" height="21" viewBox="0 0 21 21" fill="rgb(var(--primary))" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.6664 7.44917C19.6664 7.45819 19.6664 7.46639 19.6606 7.47542L17.8002 15.996C17.7429 16.296 17.5828 16.5667 17.3474 16.7614C17.112 16.956 16.8161 17.0625 16.5106 17.0624H4.48732C4.18201 17.0623 3.88629 16.9557 3.65107 16.7611C3.41586 16.5665 3.25585 16.2959 3.19861 15.996L1.33814 7.47542C1.33814 7.46639 1.33404 7.45819 1.3324 7.44917C1.28148 7.16706 1.32432 6.87605 1.45437 6.62058C1.58442 6.36512 1.79454 6.15925 2.05261 6.03445C2.31068 5.90965 2.60251 5.87277 2.88352 5.92944C3.16452 5.98612 3.41924 6.13323 3.60876 6.34831L6.37076 9.32522L9.30747 2.73893C9.30761 2.7362 9.30761 2.73346 9.30747 2.73073C9.41249 2.50297 9.58056 2.31006 9.79179 2.17485C10.003 2.03963 10.2486 1.96777 10.4994 1.96777C10.7502 1.96777 10.9957 2.03963 11.207 2.17485C11.4182 2.31006 11.5863 2.50297 11.6913 2.73073C11.6912 2.73346 11.6912 2.7362 11.6913 2.73893L14.628 9.32522L17.39 6.34831C17.5799 6.13483 17.8343 5.98915 18.1146 5.9334C18.3948 5.87765 18.6856 5.91487 18.9427 6.03942C19.1999 6.16396 19.4094 6.36902 19.5394 6.62345C19.6694 6.87789 19.7128 7.1678 19.6631 7.44917H19.6664Z" fill="rgb(var(--primary))" />
        </svg>);

    const StandardNFTIcon = (

        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5206)" />
            <path d="M6.14551 1.60449C7.39878 3.86517 9.19548 5.66262 11.4561 6.91602C9.19573 8.16927 7.39876 9.96624 6.14551 12.2266C4.89212 9.96599 3.09466 8.16929 0.833984 6.91602C3.09491 5.66261 4.8921 3.86542 6.14551 1.60449Z" stroke="url(#paint1_linear_420_5206)" stroke-opacity="0.5" stroke-width="0.643839" />
            <defs>
                <linearGradient id="paint0_linear_420_5206" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop offset="0.390566" stop-color="#C3F387" />
                    <stop offset="1" stop-color="#68C220" />
                </linearGradient>
                <linearGradient id="paint1_linear_420_5206" x1="6.1455" y1="-8.57683" x2="6.1455" y2="13.1942" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>);

    const PremiumNFTIcon = (

        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5208)" />
            <path d="M6.14551 1.49219C7.41144 3.81322 9.24744 5.64996 11.5684 6.91602C9.24769 8.18194 7.41143 10.0182 6.14551 12.3389C4.87945 10.0179 3.04271 8.18195 0.72168 6.91602C3.04296 5.64994 4.87943 3.81347 6.14551 1.49219Z" stroke="url(#paint1_linear_420_5208)" stroke-opacity="0.5" stroke-width="0.535243" />
            <defs>
                <linearGradient id="paint0_linear_420_5208" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#7DFFFF" />
                    <stop offset="0.855769" stop-color="#23B7E5" />
                </linearGradient>
                <linearGradient id="paint1_linear_420_5208" x1="6.1455" y1="-8.57683" x2="6.1455" y2="13.1942" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );

    const LegendaryNFTIcon = (

        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5211)" />
            <path d="M6.14551 1.41797C7.41955 3.77942 9.28123 5.64184 11.6426 6.91602C9.28148 8.19005 7.41954 10.052 6.14551 12.4131C4.87134 10.0517 3.00891 8.19006 0.647461 6.91602C3.00917 5.64183 4.87133 3.77967 6.14551 1.41797Z" stroke="url(#paint1_linear_420_5211)" stroke-opacity="0.5" stroke-width="0.466667" />
            <defs>
                <linearGradient id="paint0_linear_420_5211" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F8FF1E" />
                    <stop offset="0.855769" stop-color="#FCA400" />
                </linearGradient>
                <linearGradient id="paint1_linear_420_5211" x1="6.1455" y1="-8.57683" x2="6.1455" y2="13.1942" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>);

    const ClaimIcon = (
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.0839844" y="0.00170898" width="14" height="14" rx="7" fill="#B9E97D" />
            <path d="M10.7502 6.63543V7.85446L10.7388 8.10254L10.7271 8.23551L10.7094 8.37059C10.6981 8.45696 10.6797 8.54281 10.6549 8.62621L10.6225 8.73395L10.5836 8.84748L10.5599 8.9088L10.4981 9.04896L10.4171 9.21049L10.3379 9.351L10.2242 9.52515L10.2025 9.55405L10.1026 9.67407L9.99893 9.78724L9.95723 9.8349L9.83039 9.96402L9.79868 9.99275L9.66973 10.098L9.56058 10.1779L9.48017 10.2333L9.39029 10.2909L9.2419 10.3754L9.15745 10.4174L9.01256 10.481L8.87924 10.5317L8.68196 10.5923L8.5595 10.6214L8.39709 10.6511L8.33682 10.6589L7.95647 10.6836H5.10056V9.89657H7.91617L8.183 9.87677C8.25466 9.87151 8.32666 9.86083 8.39674 9.84523L8.43248 9.83735L8.63711 9.77656L8.66549 9.76587L8.84034 9.68756L8.92514 9.64288L9.10121 9.53426L9.13047 9.51341L9.27834 9.39305L9.32109 9.35363L9.4446 9.22556L9.48437 9.17913L9.60683 9.01515L9.64748 8.95243L9.74524 8.7767L9.78676 8.68945L9.85527 8.51881L9.88225 8.43804C9.9087 8.3585 9.9285 8.27634 9.94129 8.19364L9.95373 8.08852L9.96319 7.9764V5.83513H7.93247C7.63393 5.84161 7.35519 5.89837 7.10553 6.00419C6.86428 6.11089 6.63898 6.26927 6.45485 6.46163C6.32292 6.59724 6.20817 6.76718 6.09341 6.99651C6.01615 7.17013 5.96867 7.35917 5.9289 7.53788C5.90928 7.66489 5.89386 7.82467 5.88755 7.96606V8.17209H6.17593C6.2143 8.17209 6.25319 8.17052 6.29156 8.16754L6.50705 8.15107C6.56557 8.14651 6.62444 8.13845 6.6819 8.12689L6.71957 8.11936C6.77283 8.10867 6.82609 8.09466 6.87777 8.07731L6.94645 8.05436C7.0125 8.03246 7.07732 8.00478 7.13917 7.97254L7.20609 7.93733C7.29072 7.89318 7.37148 7.84079 7.44664 7.78175C7.49815 7.74146 7.54756 7.69748 7.59381 7.65123L7.69525 7.54979C7.74658 7.49846 7.79441 7.44274 7.83733 7.38405L7.86414 7.34779C7.90338 7.29417 7.93965 7.23776 7.97224 7.17995L8.01428 7.10899C8.05913 7.03348 8.09925 6.95429 8.13342 6.87335L8.15619 6.82009C8.17039 6.79206 8.1837 6.76332 8.19596 6.73459L8.26955 6.56062H9.01502L8.94879 6.81921C8.91025 6.96936 8.86242 7.11863 8.80653 7.26299C8.77955 7.33289 8.74819 7.40175 8.71332 7.46797C8.652 7.5843 8.5828 7.69801 8.50729 7.80575C8.44842 7.89002 8.38308 7.97096 8.31352 8.04648L8.24432 8.12111L8.09855 8.2667L7.93982 8.39635L7.73695 8.54088L7.56525 8.64022L7.35554 8.74517L7.26303 8.78476L7.05227 8.86045L7.0104 8.87271L6.81172 8.91809L6.73656 8.93052L6.39177 8.9731L5.92522 8.98729H5.52945L3.4043 8.97275V6.1214C3.40798 6.07795 3.4113 6.03047 3.41446 5.98194C3.42006 5.89872 3.42585 5.8127 3.43408 5.73544C3.44389 5.65888 3.46124 5.57285 3.47665 5.49682L3.48331 5.46423C3.56846 5.13574 3.6911 4.85174 3.84772 4.62013C3.98368 4.42338 4.12419 4.25729 4.27766 4.1124C4.39785 3.99712 4.53678 3.89779 4.65924 3.81019C4.96776 3.59925 5.32815 3.45103 5.73163 3.36886C5.8816 3.3375 6.03595 3.3333 6.18522 3.32927C6.2383 3.32787 6.29314 3.32629 6.34605 3.32366H6.3492L9.0257 3.32349V4.1103L6.12022 4.12414L5.93153 4.13851C5.76457 4.16391 5.64245 4.19299 5.53558 4.23259C5.27103 4.33315 5.06044 4.45702 4.9103 4.60086L4.9075 4.60331C4.74404 4.74171 4.61544 4.88275 4.52574 5.02221C4.43078 5.17568 4.34984 5.34229 4.2922 5.5033C4.23982 5.66238 4.21021 5.79851 4.2025 5.91799C4.19742 6.00016 4.19199 6.0995 4.18691 6.19428C4.1834 6.25648 4.18025 6.31675 4.1771 6.36913V8.17209H5.0904L5.11511 7.81556C5.12211 7.76668 5.12912 7.70974 5.13683 7.64948C5.16872 7.39579 5.20831 7.08026 5.27997 6.89332C5.41014 6.52751 5.63194 6.18447 5.93871 5.87507C6.15578 5.64363 6.40702 5.45442 6.68436 5.31391C7.05122 5.1282 7.43298 5.03394 7.81929 5.03394H10.7355L10.7502 6.63543Z" fill="#0F382B" />
        </svg>
    );

    const [searchTerm, setSearchTerm] = useState(""); // State for search input
    const [filteredData, setFilteredData] = useState(ProjectListdata); // State for filtered data
    const svgRemoval = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" style="fill: none; stroke: rgb(var(--primary));" viewBox="0 0 24 24">
                                                                <path d="M8 17L12 21L16 17" stroke:rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                                <path d="M12 12V21" stroke-width="2" stroke:rgb(var(--primary));" stroke-linecap="round" stroke-linejoin="round"/>
                                                                <path d="M20.8802 18.0899C21.7496 17.4786 22.4015 16.6061 22.7415 15.5991C23.0814 14.5921 23.0916 13.503 22.7706 12.4898C22.4496 11.4766 21.814 10.592 20.9562 9.9645C20.0985 9.33697 19.063 8.9991 18.0002 8.99993H16.7402C16.4394 7.82781 15.8767 6.73918 15.0943 5.81601C14.3119 4.89285 13.3303 4.15919 12.2234 3.67029C11.1164 3.18138 9.91302 2.94996 8.7037 2.99345C7.49439 3.03694 6.31069 3.3542 5.24173 3.92136C4.17277 4.48852 3.2464 5.29078 2.53236 6.26776C1.81833 7.24474 1.33523 8.37098 1.11944 9.56168C0.903647 10.7524 0.960787 11.9765 1.28656 13.142C1.61233 14.3074 2.19824 15.3837 3.00018 16.2899" stroke:rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                            </svg>`

    // Handle search input changes
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        // Filter the ProjectListdata based on the search term
        const filtered = ProjectListdata.filter((item) =>
            item.class.toLowerCase().includes(term) // Match project name
        );
        setFilteredData(filtered);
    };

    const Data = [
        { value: 'All Categories', label: 'All Categories' },
        { value: 'Biomass Removal', label: 'Biomass Removal' },

    ];
    const Data2 = [
        { value: 'All countries', label: 'All countries' },
        { value: 'Tunisia', label: 'Tunisia' },

    ];

    return (
        <Fragment>
            <Seo title={"Leaderboard"} />
            <div className='container'>
                {/* -------- HERO SECTION ABOVE TABLE -------- */}
                <div className="grid grid-cols-12 gap-x-6 mt-10 mb-6">
                    {/* Left: Title + Description */}
                    <div className="col-span-12 md:col-span-6 flex items-center">
                        <div className=" w-full p-4">
                            <p className="text-4xl font-bold mb-1 ">Leaderboard</p>
                            <p>
                                Early NFT Holders are eligible to earn $BTG via Vesting.<br />
                                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. <br />Aenean commodo ligula eget dolor.   </p>
                        </div>
                    </div>
                    {/* Right: Card */}
                    <div className="col-span-12 md:col-span-6 flex items-center justify-end mt-4 sm:mt-0">
                        <div className="box w-full h-full flex flex-col justify-center shadow-none" style={{ minHeight: 220 }}>

                            <div className="box-body pb-0 " style={{ paddingBottom: 0 }}>
                                {/* Rank Badge (Mobile only) */}
                                <div className="flex sm:hidden items-center justify-start mb-3">
                                    <div className="flex items-center gap-2 bg-camel rounded-sm px-3 py-2 text-sm font-semibold text-primary">
                                        {RankIcon}
                                        <span className="text-base">#00000</span>
                                    </div>
                                </div>

                                {/* Title + Rank Badge (Desktop only) */}
                                <div className="hidden sm:flex items-center justify-between mb-2">
                                    <div className="text-lg font-bold">Your available $BTG for claim</div>
                                    <div className="flex items-center gap-2 bg-camel rounded-sm px-3 py-2 text-sm font-semibold text-primary">
                                        {RankIcon}
                                        <span className="text-base">#00000</span>
                                    </div>
                                </div>

                                {/* Title (Mobile) */}
                                <div className="text-lg font-bold mb-2 sm:hidden">Your available $BTG for claim</div>

                                {/* Description */}
                                <div className="text-xs text-[#7d879c] dark:text-white/60 mb-5">
                                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                                    <br className="hidden sm:inline" />
                                    Aenean commodo ligula eget dolor. Check your eligibility.
                                </div>

                                {/* BTG Balance and NFT Counts */}
                                {authenticated ? (
                                    <>
                                        <div className="rounded-sm bg-camel flex flex-col items-center justify-center sm:flex-row sm:items-center sm:justify-between px-4 py-3 mb-5 gap-4 sm:gap-0 text-center sm:text-left">
                                            {/* BTG Icon + Balance */}
                                            <div className="flex items-center gap-1">
                                                <span className="inline-flex items-center justify-center rounded-full bg-[#d0f5a0] w-8 h-8 mr-2">
                                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="40" height="40" rx="20" fill="#B9E97D" />
                                                        <path d="M30.4755 18.9549V22.4378L30.443 23.1466L30.4095 23.5266L30.3589 23.9125C30.3269 24.1593 30.2743 24.4045 30.2032 24.6428L30.1106 24.9507L29.9995 25.275L29.9319 25.4502L29.7552 25.8507L29.524 26.3122L29.2977 26.7137L28.9728 27.2112L28.9108 27.2938L28.6254 27.6367L28.3291 27.9601L28.21 28.0962L27.8476 28.4651L27.757 28.5472L27.3885 28.8481L27.0767 29.0763L26.8469 29.2345L26.5901 29.3992L26.1662 29.6405L25.9249 29.7606L25.5109 29.9423L25.13 30.087L24.5664 30.2602L24.2165 30.3433L23.7524 30.4284L23.5802 30.4504L22.4935 30.521H14.3338V28.2724H22.3784L23.1407 28.2159C23.3455 28.2008 23.5512 28.1703 23.7514 28.1258L23.8535 28.1032L24.4382 27.9295L24.5193 27.899L25.0189 27.6752L25.2611 27.5476L25.7642 27.2372L25.8478 27.1777L26.2703 26.8338L26.3924 26.7212L26.7453 26.3553L26.8589 26.2226L27.2088 25.7541L27.325 25.5749L27.6043 25.0728L27.7229 24.8235L27.9186 24.336L27.9957 24.1052C28.0713 23.8779 28.1279 23.6432 28.1644 23.4069L28.2 23.1066L28.227 22.7862V16.6683H22.4249C21.572 16.6868 20.7756 16.849 20.0623 17.1513C19.373 17.4562 18.7293 17.9087 18.2032 18.4583C17.8262 18.8458 17.4984 19.3313 17.1705 19.9866C16.9497 20.4826 16.8141 21.0227 16.7005 21.5333C16.6444 21.8962 16.6003 22.3527 16.5823 22.7567V23.3453H17.4063C17.5159 23.3453 17.627 23.3408 17.7366 23.3323L18.3523 23.2853C18.5195 23.2723 18.6877 23.2492 18.8519 23.2162L18.9595 23.1947C19.1117 23.1641 19.2639 23.1241 19.4115 23.0745L19.6077 23.009C19.7965 22.9464 19.9817 22.8673 20.1584 22.7752L20.3496 22.6746C20.5914 22.5484 20.8221 22.3988 21.0369 22.2301C21.184 22.115 21.3252 21.9893 21.4573 21.8572L21.7472 21.5673C21.8938 21.4207 22.0305 21.2615 22.1531 21.0938L22.2297 20.9902C22.3418 20.837 22.4455 20.6758 22.5386 20.5106L22.6587 20.3079C22.7868 20.0922 22.9015 19.8659 22.9991 19.6347L23.0642 19.4825C23.1047 19.4024 23.1427 19.3203 23.1778 19.2382L23.388 18.7411H25.5179L25.3287 19.48C25.2186 19.909 25.0819 20.3354 24.9223 20.7479C24.8452 20.9476 24.7556 21.1444 24.656 21.3336C24.4808 21.6659 24.283 21.9908 24.0673 22.2987C23.8991 22.5394 23.7124 22.7707 23.5137 22.9864L23.3159 23.1997L22.8995 23.6157L22.446 23.9861L21.8663 24.399L21.3757 24.6829L20.7766 24.9827L20.5123 25.0958L19.9101 25.3121L19.7905 25.3471L19.2228 25.4768L19.0081 25.5123L18.023 25.6339L16.6899 25.6745H15.5592L9.4873 25.6329V17.4862C9.49782 17.3621 9.50733 17.2264 9.51634 17.0878C9.53236 16.85 9.54887 16.6042 9.5724 16.3835C9.60043 16.1647 9.64999 15.919 9.69404 15.7017L9.71306 15.6086C9.95634 14.67 10.3067 13.8586 10.7542 13.1969C11.1427 12.6347 11.5441 12.1602 11.9826 11.7462C12.326 11.4169 12.723 11.133 13.0729 10.8828C13.9544 10.2801 14.984 9.8566 16.1368 9.62183C16.5653 9.53223 17.0063 9.52022 17.4328 9.50871C17.5845 9.5047 17.7411 9.5002 17.8923 9.49269H17.9013L25.5485 9.49219V11.7402L17.2471 11.7798L16.708 11.8208C16.2309 11.8934 15.882 11.9765 15.5767 12.0896C14.8208 12.3769 14.2192 12.7308 13.7902 13.1418L13.7822 13.1488C13.3151 13.5443 12.9477 13.9472 12.6914 14.3457C12.4201 14.7842 12.1889 15.2602 12.0242 15.7202C11.8745 16.1747 11.7899 16.5637 11.7679 16.9051C11.7534 17.1398 11.7378 17.4237 11.7233 17.6945C11.7133 17.8722 11.7043 18.0444 11.6953 18.194V23.3453H14.3048L14.3753 22.3267C14.3954 22.187 14.4154 22.0244 14.4374 21.8522C14.5285 21.1273 14.6416 20.2258 14.8464 19.6917C15.2183 18.6465 15.852 17.6664 16.7285 16.7824C17.3487 16.1212 18.0665 15.5806 18.8589 15.1791C19.9071 14.6485 20.9978 14.3792 22.1016 14.3792H30.4335L30.4755 18.9549Z" fill="#0F382B" />
                                                    </svg>
                                                </span>
                                                <span className="font-semibold text-xl">0.00 BTG</span>
                                            </div>
                                            {/* Right: NFT Types */}
                                            <div className="flex items-center justify-start sm:justify-end gap-6">                                        {/* Standard */}
                                                <div className="flex items-center gap-2">
                                                    {/* Standard NFT icon */}
                                                    <span>
                                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.571289" y="0.5" width="20" height="20" rx="10" fill="url(#paint0_linear_420_5308)" />
                                                            <path d="M10.4388 5C9.25773 7.36174 7.4334 9.18579 5.07129 10.3667C7.4334 11.5475 9.25773 13.3716 10.4388 15.7333C11.6198 13.3716 13.4442 11.5475 15.8063 10.3667C13.4442 9.18579 11.6198 7.36174 10.4388 5Z" fill="url(#paint1_linear_420_5308)" />
                                                            <path d="M10.4385 5.44043C11.579 7.55713 13.2475 9.2256 15.3643 10.3662C13.2475 11.5067 11.5791 13.1755 10.4385 15.292C9.29766 13.1752 7.62897 11.5067 5.51172 10.3662C7.62902 9.22563 9.29772 7.55742 10.4385 5.44043Z" stroke="url(#paint2_linear_420_5308)" stroke-opacity="0.5" stroke-width="0.409715" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_420_5308" x1="10.5713" y1="0.5" x2="10.5713" y2="20.5" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="#052E21" />
                                                                    <stop offset="1" stop-color="#164235" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_420_5308" x1="10.4388" y1="5" x2="10.4388" y2="15.7333" gradientUnits="userSpaceOnUse">
                                                                    <stop offset="0.390566" stop-color="#C3F387" />
                                                                    <stop offset="1" stop-color="#68C220" />
                                                                </linearGradient>
                                                                <linearGradient id="paint2_linear_420_5308" x1="10.4388" y1="-3.49082" x2="10.4388" y2="15.9822" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </span>
                                                    <span className="font-semibold text-sm text-primary">0</span>
                                                </div>
                                                {/* Premium */}
                                                <div className="flex items-center gap-2">
                                                    {/* Premium NFT icon */}
                                                    <span>
                                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.713867" y="0.5" width="20" height="20" rx="10" fill="#0C382B" />
                                                            <path d="M10.5814 5C9.40031 7.36174 7.57598 9.18579 5.21387 10.3667C7.57598 11.5475 9.40031 13.3716 10.5814 15.7333C11.7624 13.3716 13.5868 11.5475 15.9489 10.3667C13.5868 9.18579 11.7624 7.36174 10.5814 5Z" fill="url(#paint0_linear_420_5318)" />
                                                            <path d="M10.5811 5.41113C11.7247 7.54384 13.4033 9.22252 15.5361 10.3662C13.4034 11.5098 11.7247 13.1888 10.5811 15.3213C9.4373 13.1888 7.75887 11.5097 5.62598 10.3662C7.75893 9.22256 9.43736 7.54387 10.5811 5.41113Z" stroke="url(#paint1_linear_420_5318)" stroke-opacity="0.5" stroke-width="0.382317" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_420_5318" x1="10.5814" y1="5" x2="10.5814" y2="15.7333" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="#7DFFFF" />
                                                                    <stop offset="0.855769" stop-color="#23B7E5" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_420_5318" x1="10.5814" y1="-3.49082" x2="10.5814" y2="15.9822" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </span>
                                                    <span className="font-semibold text-sm text-[#0e7490]">0</span>
                                                </div>
                                                {/* Legendary */}
                                                <div className="flex items-center gap-2">
                                                    {/* Legendary NFT icon */}
                                                    <span>
                                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.857422" y="0.5" width="20" height="20" rx="10" fill="url(#paint0_linear_420_5327)" />
                                                            <rect x="0.857422" y="0.5" width="20" height="20" rx="10" fill="#0C382B" />
                                                            <path d="M10.7239 5C9.54289 7.36174 7.71855 9.18579 5.35645 10.3667C7.71855 11.5475 9.54289 13.3716 10.7239 15.7333C11.905 13.3716 13.7293 11.5475 16.0914 10.3667C13.7293 9.18579 11.905 7.36174 10.7239 5Z" fill="url(#paint1_linear_420_5327)" />
                                                            <path d="M10.7236 5.45605C11.8626 7.56448 13.5261 9.22726 15.6348 10.3662C13.5262 11.505 11.8627 13.1681 10.7236 15.2764C9.58449 13.1681 7.92122 11.505 5.8125 10.3662C7.92128 9.2273 9.58455 7.56452 10.7236 5.45605Z" stroke="url(#paint2_linear_420_5327)" stroke-opacity="0.5" stroke-width="0.424243" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_420_5327" x1="10.8574" y1="0.5" x2="10.8574" y2="20.5" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="#052E21" />
                                                                    <stop offset="1" stop-color="#164235" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_420_5327" x1="10.7239" y1="5" x2="10.7239" y2="15.7333" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="#F8FF1E" />
                                                                    <stop offset="0.855769" stop-color="#FCA400" />
                                                                </linearGradient>
                                                                <linearGradient id="paint2_linear_420_5327" x1="10.7239" y1="-3.49082" x2="10.7239" y2="15.9822" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </span>
                                                    <span className="font-semibold text-sm text-[#ca8a04]">0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Fallback message if wallet is not connected */}
                                        <div className="rounded-sm bg-camel flex flex-col items-center justify-center sm:flex-row sm:items-center sm:justify-between px-4 py-3 mb-5 gap-4 sm:gap-0 ">
                                            <div className="flex items-center gap-1">
                                                <span className="inline-flex items-center justify-center rounded-full bg-[#d0f5a0] w-8 h-8 mr-2">
                                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="40" height="40" rx="20" fill="#B9E97D" />
                                                        <path d="M30.4755 18.9549V22.4378L30.443 23.1466L30.4095 23.5266L30.3589 23.9125C30.3269 24.1593 30.2743 24.4045 30.2032 24.6428L30.1106 24.9507L29.9995 25.275L29.9319 25.4502L29.7552 25.8507L29.524 26.3122L29.2977 26.7137L28.9728 27.2112L28.9108 27.2938L28.6254 27.6367L28.3291 27.9601L28.21 28.0962L27.8476 28.4651L27.757 28.5472L27.3885 28.8481L27.0767 29.0763L26.8469 29.2345L26.5901 29.3992L26.1662 29.6405L25.9249 29.7606L25.5109 29.9423L25.13 30.087L24.5664 30.2602L24.2165 30.3433L23.7524 30.4284L23.5802 30.4504L22.4935 30.521H14.3338V28.2724H22.3784L23.1407 28.2159C23.3455 28.2008 23.5512 28.1703 23.7514 28.1258L23.8535 28.1032L24.4382 27.9295L24.5193 27.899L25.0189 27.6752L25.2611 27.5476L25.7642 27.2372L25.8478 27.1777L26.2703 26.8338L26.3924 26.7212L26.7453 26.3553L26.8589 26.2226L27.2088 25.7541L27.325 25.5749L27.6043 25.0728L27.7229 24.8235L27.9186 24.336L27.9957 24.1052C28.0713 23.8779 28.1279 23.6432 28.1644 23.4069L28.2 23.1066L28.227 22.7862V16.6683H22.4249C21.572 16.6868 20.7756 16.849 20.0623 17.1513C19.373 17.4562 18.7293 17.9087 18.2032 18.4583C17.8262 18.8458 17.4984 19.3313 17.1705 19.9866C16.9497 20.4826 16.8141 21.0227 16.7005 21.5333C16.6444 21.8962 16.6003 22.3527 16.5823 22.7567V23.3453H17.4063C17.5159 23.3453 17.627 23.3408 17.7366 23.3323L18.3523 23.2853C18.5195 23.2723 18.6877 23.2492 18.8519 23.2162L18.9595 23.1947C19.1117 23.1641 19.2639 23.1241 19.4115 23.0745L19.6077 23.009C19.7965 22.9464 19.9817 22.8673 20.1584 22.7752L20.3496 22.6746C20.5914 22.5484 20.8221 22.3988 21.0369 22.2301C21.184 22.115 21.3252 21.9893 21.4573 21.8572L21.7472 21.5673C21.8938 21.4207 22.0305 21.2615 22.1531 21.0938L22.2297 20.9902C22.3418 20.837 22.4455 20.6758 22.5386 20.5106L22.6587 20.3079C22.7868 20.0922 22.9015 19.8659 22.9991 19.6347L23.0642 19.4825C23.1047 19.4024 23.1427 19.3203 23.1778 19.2382L23.388 18.7411H25.5179L25.3287 19.48C25.2186 19.909 25.0819 20.3354 24.9223 20.7479C24.8452 20.9476 24.7556 21.1444 24.656 21.3336C24.4808 21.6659 24.283 21.9908 24.0673 22.2987C23.8991 22.5394 23.7124 22.7707 23.5137 22.9864L23.3159 23.1997L22.8995 23.6157L22.446 23.9861L21.8663 24.399L21.3757 24.6829L20.7766 24.9827L20.5123 25.0958L19.9101 25.3121L19.7905 25.3471L19.2228 25.4768L19.0081 25.5123L18.023 25.6339L16.6899 25.6745H15.5592L9.4873 25.6329V17.4862C9.49782 17.3621 9.50733 17.2264 9.51634 17.0878C9.53236 16.85 9.54887 16.6042 9.5724 16.3835C9.60043 16.1647 9.64999 15.919 9.69404 15.7017L9.71306 15.6086C9.95634 14.67 10.3067 13.8586 10.7542 13.1969C11.1427 12.6347 11.5441 12.1602 11.9826 11.7462C12.326 11.4169 12.723 11.133 13.0729 10.8828C13.9544 10.2801 14.984 9.8566 16.1368 9.62183C16.5653 9.53223 17.0063 9.52022 17.4328 9.50871C17.5845 9.5047 17.7411 9.5002 17.8923 9.49269H17.9013L25.5485 9.49219V11.7402L17.2471 11.7798L16.708 11.8208C16.2309 11.8934 15.882 11.9765 15.5767 12.0896C14.8208 12.3769 14.2192 12.7308 13.7902 13.1418L13.7822 13.1488C13.3151 13.5443 12.9477 13.9472 12.6914 14.3457C12.4201 14.7842 12.1889 15.2602 12.0242 15.7202C11.8745 16.1747 11.7899 16.5637 11.7679 16.9051C11.7534 17.1398 11.7378 17.4237 11.7233 17.6945C11.7133 17.8722 11.7043 18.0444 11.6953 18.194V23.3453H14.3048L14.3753 22.3267C14.3954 22.187 14.4154 22.0244 14.4374 21.8522C14.5285 21.1273 14.6416 20.2258 14.8464 19.6917C15.2183 18.6465 15.852 17.6664 16.7285 16.7824C17.3487 16.1212 18.0665 15.5806 18.8589 15.1791C19.9071 14.6485 20.9978 14.3792 22.1016 14.3792H30.4335L30.4755 18.9549Z" fill="#0F382B" />
                                                    </svg>
                                                </span>
                                                <span className="font-semibold text-xs">
                                                    Connect your wallet to see your claimable $BTG and leaderboard position
                                                </span>
                                            </div>
                                        </div>

                                    </>
                                )}
                                {/* Connect Wallet Button */}
                                <div className="flex">
                                    <button
                                        className="w-180 bg-secondary text-white !font-medium btn btn-primary px-8 py-3 rounded-sm mt-2"
                                        onClick={!authenticated ? login : undefined}
                                        disabled={authenticated ? true : false}
                                        style={{ userSelect: 'none', cursor: authenticated ? 'not-allowed' : 'pointer' }}
                                    >
                                        {authenticated ? 'Claim $BTG' : 'Connect Wallet'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                {/* --------- TABLE SECTION --------- */}
                <div className="grid grid-cols-12 mt-6">
                    <div className="xl:col-span-12 col-span-12">
                        <div className="box overflow-hidden">
                            <div className="box-header justify-between">
                                <div className="box-title">NFT holders Ranking</div>
                            </div>
                            <div className="box-body !p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover whitespace-nowrap min-w-full">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-start w-10">{RankIcon}</th>
                                                <th scope="col" className="text-start">Users</th>
                                                <th scope="col" className="text-start">
                                                    <div className="flex items-center gap-2">
                                                        {StandardNFTIcon}
                                                        <span>Standard NFT</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="text-start">
                                                    <div className="flex items-center gap-2">
                                                        {PremiumNFTIcon}
                                                        <span>Premium NFT</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="text-start">
                                                    <div className="flex items-center gap-2">
                                                        {LegendaryNFTIcon}
                                                        <span>Legendary NFT</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="text-start">
                                                    <div className="flex items-center gap-2">
                                                        {ClaimIcon}
                                                        <span>$BTG for Claim</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((idx: any, i: number) => (
                                                <tr
                                                    className="border-t hover:bg-gray-200 dark:hover:bg-light cursor-pointer"
                                                    key={idx.id}
                                                    onClick={() => window.location.href = `/projects/project-details/${idx.id}`}
                                                >
                                                    <td className="w-10 text-center font-bold">{i + 1}</td>
                                                    <td>
                                                        <span
                                                            className="badge rounded-full"
                                                            style={{
                                                                backgroundColor: idx.statusBgColor,
                                                                color: idx.statusFontColor,
                                                            }}
                                                        >
                                                            {idx.status}
                                                        </span>
                                                    </td>
                                                    <td>{idx.area}</td>
                                                    <td>{idx.standard}</td>
                                                    <td>{idx.location}</td>
                                                    <td>
                                                        <div className={`badge bg-camel rounded-full gap-2`} style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
                                                            <span
                                                                className="w-4 text-primary"
                                                                dangerouslySetInnerHTML={{ __html: svgRemoval }}
                                                            />
                                                            Removal
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )

};

export default leaderboard;
