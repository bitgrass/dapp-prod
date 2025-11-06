'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ShareModal from "@/shared/layout-components/modal/ShareModal";
import PurchaseCelebrationModal from "@/shared/layout-components/modal/PurchaseCelebrationModal";

// Import your custom MapComponent
import MapComponent from './MapComponent'; // Update this path to match your file structure


const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Params {
  params: { id: string };
}

const DEFAULT_TOTALS = { standard: 0, premium: 0, legendary: 0 };

export default function ProjectDetails({ params }: Params) {

  const getAbsoluteUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location
    const { protocol, host } = window.location;
    return `${protocol}//${host}${path.startsWith('/') ? path : '/' + path}`;
  }
  // Server-side: use your production domain
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://bitgrass.com';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

// STEP 2: Inside your component, calculate the absolute image URL
const imageUrl = getAbsoluteUrl('/assets/images/brand-logos/farShare.jpg');
  const [project, setProject] = useState<any | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
   const shareTextTwitter = `Discover Bitgrass Farmland — live now on #Base`;
    const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.replace(/\/$/, '')
      : '';
   const encodedLink = encodeURIComponent(currentUrl);

  const [error, setError] = useState<string | null>(null);
  const encodedTextTwitter = encodeURIComponent(shareTextTwitter);

  const twitterUrl = `https://x.com/intent/post?text=${encodedTextTwitter}%0A%0A${encodedLink}?ref=twitter_1`;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let totals = DEFAULT_TOTALS;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
          "https://durable-object-count.bitgrass-crypto.workers.dev/totals",
          {
            cache: "no-store",
            signal: controller.signal,
            headers: { Accept: "application/json", "Content-Type": "application/json" },
          }
        );

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          totals = { ...DEFAULT_TOTALS, ...data };
        }
      } catch (err) {
      }

      // Build project object inline
      const projects = [
        {
          id: 1,
          class: "Bitgrass Farmland",
          class1: "100 Hectares",
          src: "../../../assets/images/brand-logos/Standard.svg",
          text1: "Puro",
          statusFontColor: "#23B7E5",
          statusBgColor: "#23B7E51A",
          color1: "secondary",
          class2: "M21.46777...",
          class3: "",
          data: "Full Time",
          data1: "Oct 12 2022",
          text: "Biomass Removal",
          text2: "Nov 12 2022",
          color: "primary",
          standard: "-",
          number: "10",
          number1: "15",
          name: "Bitgrass Farmland",
          location: "Tunisia",
          status: "Under Development",
          area: "100 Hectares",
          daysLeftToInvest: 45,
          longitude: 10.7603,
          latitude: 34.7406,
          zoom: 13,

          projectData: [
            {
              title: "Removal",
              subtitle: "Credit Type",
              icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="fill: none; stroke: rgb(var(--primary));" viewBox="0 0 24 24">
  <path d="M8 17L12 21L16 17" stroke: rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 12V21" stroke-width="2" stroke: rgb(var(--primary));" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.8802 18.0899C21.7496 17.4786 22.4015 16.6061 22.7415 15.5991C23.0814 14.5921 23.0916 13.503 22.7706 12.4898C22.4496 11.4766 21.814 10.592 20.9562 9.9645C20.0985 9.33697 19.063 8.9991 18.0002 8.99993H16.7402C16.4394 7.82781 15.8767 6.73918 15.0943 5.81601C14.3119 4.89285 13.3303 4.15919 12.2234 3.67029C11.1164 3.18138 9.91302 2.94996 8.7037 2.99345C7.49439 3.03694 6.31069 3.3542 5.24173 3.92136C4.17277 4.48852 3.2464 5.29078 2.53236 6.26776C1.81833 7.24474 1.33523 8.37098 1.11944 9.56168C0.903647 10.7524 0.960787 11.9765 1.28656 13.142C1.61233 14.3074 2.19824 15.3837 3.00018 16.2899" stroke: rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
            },
            {
              title: "60K TCO2",
              subtitle: "Carbon Units",
              icon: ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         style="fill: rgb(var(--primary));" viewBox="0 0 24 24" >
                                                        <path d="m21.02,3.17c-.24-.04-5.8-.97-8.81,2.04-.67.67-1.14,1.47-1.47,2.3-.17-.24-.35-.47-.56-.69-2.48-2.48-7.03-1.72-7.23-1.69-.42.07-.74.4-.81.81-.03.19-.79,4.75,1.69,7.23,1.52,1.52,3.82,1.82,5.41,1.82.28,0,.53,0,.76-.02v6.02h2v-6.05c.34.03.75.05,1.21.05,1.95,0,4.74-.37,6.58-2.21,3.01-3.01,2.08-8.58,2.04-8.81-.07-.42-.4-.74-.81-.81Zm-11.05,9.81c-1.17.08-3.47.05-4.73-1.21-1.27-1.27-1.29-3.56-1.21-4.74,1.17-.08,3.47-.05,4.73,1.21,1.27,1.27,1.29,3.56,1.21,4.74Zm8.41-1.59c-1.73,1.73-4.9,1.69-6.33,1.57-.12-1.43-.16-4.59,1.57-6.33,1.73-1.73,4.9-1.69,6.33-1.57.12,1.43.16,4.59-1.57,6.33Z"></path>
                                                    </svg> `,
            },
            {
              title: "100 Ha",
              subtitle: "Total Hectares Covered",
              icon: `  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         style="fill: rgb(var(--primary));" viewBox="0 0 24 24" >
                                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z"></path><path d="M12 9h3v3h2V7h-5zM9 12H7v5h5v-2H9z"></path>
                                                    </svg>`,
            },
          ],

          about:
            "Bitgrass Farm tokenizes 100 hectares of farmland into a limited collection of 3,200 NFTs. Each NFT grants the Right of Use for Carbon Credits, allowing holders to stake for rewards, boost $BTG APY, or burn to offset their carbon footprint.",

          documents: [
            { name: "Document 1", link: "https://drive.google.com/uc?id=FILE_ID_1", avatar: "../../../assets/images/company-logos/3.png" },
            { name: "Document 2", link: "https://drive.google.com/uc?id=FILE_ID_2", avatar: "../../../assets/images/company-logos/6.png" },
            { name: "Document 3", link: "https://drive.google.com/uc?id=FILE_ID_3", avatar: "../../../assets/images/company-logos/8.png" },
            { name: "Document 4", link: "https://drive.google.com/uc?id=FILE_ID_4", avatar: "../../../assets/images/company-logos/5.png" },
          ],

          logo: "/assets/images/apps/profile-pic.jpg",

          nftStats: {
            totalLandplots: 3200,
            categories: [
              { name: "Standard", size: 100, current: totals.standard, total: 2000, status: "Sold", icon: "../../../assets/images/brand-logos/Standard.svg" },
              { name: "Premium", size: 500, current: totals.premium, total: 800, status: "Sold", icon: "../../../assets/images/brand-logos/Premium.svg" },
              { name: "Legendary", size: 1000, current: totals.legendary, total: 400, status: "Sold", icon: "../../../assets/images/brand-logos/Legendary.svg" },
            ],
          },
        },
      ];

      const found = projects.find(p => p.id.toString() === params.id);
      if (!found) {
        setError(`Project with ID "${params.id}" not found in the database`);
        setProject(null);
      } else {
        setProject(found);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load project data');
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Calculate days left until Dec 31, 2025
  useEffect(() => {
    const calculateDaysLeft = (): number => {
      const today = new Date();
      const targetDate = new Date(2025, 11, 31);
      return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };
    setDaysLeft(calculateDaysLeft());
    const timeout = setTimeout(() => setDaysLeft(calculateDaysLeft()), 24 * 60 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="container mt-6">
        <div className="box custom-box">
          <div className="box-body text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-6"></div>
            <h4 className="text-lg font-semibold mb-2">Loading Project Details</h4>
            <p className="text-gray-600">Fetching project data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-6">
        <div className="box custom-box">
          <div className="box-body text-center py-12">
            <div className="text-red-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-red-600">Unable to Load Project</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="space-x-4">
              <button onClick={fetchData} className="ti-btn bg-secondary text-white">Try Again</button>
              <Link href="/projects" className="ti-btn bg-gray-500 text-white">Back to Projects</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="container mt-6">
        <div className="box custom-box">
          <div className="box-body text-center py-12">
            <div className="text-gray-400 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.573M15 11.291A7.962 7.962 0 0012 9c-2.34 0-4.291 1.007-5.691 2.573M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-3">Project Not Found</h4>
            <p className="text-gray-600 mb-6">The requested project could not be found.</p>
            <Link href="/projects" className="ti-btn bg-secondary text-white">Browse All Projects</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <Seo title={project.name} 
        image={imageUrl} // or project.logo
 />
      <div className="container">
        {/* HEADER */}
        <div className="box custom-box mt-6">
          <div className="box-body">
            <div className="sm:flex align-top justify-between">
              <div>
                <div className="lg:flex flex-wrap gap-2">
                  <div>
                    <span className="avatar avatar-xxl mt-1 me-4">
                      <img src={project.logo || '/assets/images/apps/profile-pic.jpg'} alt={project.name} />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-hights font-bold mb-0 flex items-center">
                      <Link href="#!" scroll={false}>{project.name}</Link>
                    </h4>
                    <Link href="#!" scroll={false} className="font-semibold">
                      <i className="bi bi-building"></i> {project.location}
                    </Link>
                    <div className="popular-tags mb-2 sm:mb-0 mt-2">
                      <Link href="#!" scroll={false} className="badge me-2 !rounded-full bg-secondary/10 text-secondary">
                        <i className="bi bi-clock me-1"></i>{project.status}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="btn-list md:flex items-center mb-2 project-header">
                  <Link href="/ownplot/standard" className="ti-btn bg-secondary text-white !font-medium m-0 !me-[0.375rem]">
                    Buy Plot
                  </Link>
                  <div
                    aria-label="anchor"
                    className="ti-btn ti-btn-icon ti-btn-primary"
                    onClick={() => window.open(twitterUrl, '_blank')}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="ri-share-line"></i>
                  </div>
                </div>
                <p className="mb-0">
                  <i className="bi bi-info-circle text-danger"></i>{' '}
                  <b>{daysLeft} days left </b> to invest
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDE */}
          <div className="xxl:col-span-8 col-span-12">
            {/* Project Data */}
            <div className="box custom-box">
              <div className="box-body !p-0">
                <div className="box-header">
                  <h5 className="text-hights box-title">Project Data</h5>
                </div>
                <div className="grid grid-cols-12 gap-x-6">
                  {project.projectData?.map((data: any, index: any) => (
                    <div key={index} className="xl:col-span-4 col-span-12 border-e border-dashed dark:border-defaultborder/10">
                      <div className="flex flex-wrap items-start p-6">
                        <div className="me-3 leading-none">
                          <span className="avatar avatar-md !rounded-full bg-camel10 shadow-sm">
                            <span className="w-6 h-6" dangerouslySetInnerHTML={{ __html: data.icon }} />
                          </span>
                        </div>
                        <div className="flex-grow">
                          <h5 className="font-semibold text-hights">{data.title}</h5>
                          <p className="text-[#8c9097] dark:text-white/50 mb-0 text-[0.75rem]">
                            {data.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="box custom-box">
              <div className="box-body">
                <h5 className="text-hights font-semibold">About</h5>
                <p className="opacity-[0.9] mt-2">{project.about}</p>
              </div>
            </div>

            {/* Location - Using your custom MapComponent */}
            <div className="xl:col-span-6 col-span-12">
              <div className="box custom-box">
                <div className="box-header">
                  <div className="box-title">Location</div>
                </div>
                <div className="box-body">
                  <MapComponent
                    longitude={project.longitude}
                    latitude={project.latitude}
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="box custom-box !border-0 !shadow-none">
              <div className="box-body">
                <div className="grid grid-cols-12 items-center text-center lg:text-start">
                  <div className="lg:col-span-6 col-span-12">
                    <h5 className="font-semibold mb-0">🖐 Looking for Passive Income?</h5>
                  </div>
                  <div className="lg:col-span-6 col-span-12 mt-4 lg:mt-0 lg:flex lg:justify-end">
                    <a className="ti-btn bg-secondary text-white !font-medium" href="/ownplot/standard">
                      Secure Your Plot
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - NFT Stats */}
          <div className="xxl:col-span-4 col-span-12 order-2 lg:order-none">
            <div className="box">
              <div className="box-header justify-between">
                <div className="box-title">
                  Total Tokenized Landplots: {project.nftStats?.totalLandplots || 0}
                </div>
              </div>
              <div className="box-body">
                <ul className="list-none space-y-4">
                  {project.nftStats?.categories?.map((category: any) => {
                    const colorMap: Record<string, any> = {
                      Standard: { bar: "bg-secondary", text: "text-secondary", border: "dark:border-secondary/30" },
                      Premium: { bar: "bg-[#5ea9cc]", text: "text-[#5ea9cc]", border: "dark:border-blue-400/30" },
                      Legendary: { bar: "bg-[#CA8A04]", text: "text-[#CA8A04]", border: "dark:border-yellow-500/30" },
                    };
                    const colors = colorMap[category.name] || colorMap.Standard;
                    const percentage = (category.current / category.total) * 100;

                    return (
                      <li key={category.name} className={`p-4 rounded-lg border border-gray-200 ${colors.border}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <img src={category.icon} alt={category.name} className="w-8 h-8" />
                            <div>
                              <span className="block font-semibold">{category.name}</span>
                              <span className="text-[#8C9097] text-sm">{category.size}m²</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block font-medium">
                              <span className={`font-medium ${colors.text}`}>{category.current}</span>/{category.total}
                            </span>
                            <span className={`block font-medium ${colors.text}`}>
                              {category.status} Plots
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-camel h-2 rounded-full mt-2 overflow-hidden">
                          <div className={`${colors.bar} h-2`} style={{ width: `${percentage}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} project={project} />
    </Fragment>
  );
}