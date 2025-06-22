'use client';

import { ProjectListdata } from '@/shared/data/apps/jobs/ProjectListdata';
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import dynamic from 'next/dynamic';
import * as Heatdata from '@/shared/data/charts/apexcharts/heatmapadata'
import ShareModal from "@/shared/layout-components/modal/ShareModal"
import PurchaseCelebrationModal from "@/shared/layout-components/modal/PurchaseCelebrationModal"



const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Params {
  params: { id: string };
}

export default function ProjectDetails({ params }: Params) {

  const project = ProjectListdata.find(p => p.id.toString() === params.id);
  const [isModalOpen, setModalOpen] = useState(false);


  if (!project) {
    return <div>Project not found</div>;
  }

  const [viewState, setViewState] = useState({
    longitude: project.longitude || 10.7603,
    latitude: project.latitude || 34.7406,
    zoom: 13,
  });

  const mapRef = useRef<HTMLDivElement | null>(null);

  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const calculateDaysLeft = (): number => {
      const today: Date = new Date();
      const targetDate: Date = new Date(today.getFullYear(), 6, 1); // July = 6 (zero-based)

      if (today > targetDate) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
      }

      const timeDifference: number = targetDate.getTime() - today.getTime();
      return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    };

    // Set days on mount
    setDaysLeft(calculateDaysLeft());

    // Optional: Update at midnight
    const midnightTimeout = setTimeout(() => {
      setDaysLeft(calculateDaysLeft());
    }, (24 * 60 * 60 * 1000)); // 24 hours

    return () => clearTimeout(midnightTimeout); // Cleanup
  }, []);

  useEffect(() => {
    let mapInstance: Map | null = null;

    if (mapRef.current) {
      mapInstance = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
        }),
      });
    }

    return () => {
      if (mapInstance) {
        mapInstance.setTarget(undefined);
        mapInstance = null;
      }
    };
  }, [viewState]);

  const documents = project.documents ?? [];

  return (
    <Fragment>
      <Seo title={project.name} />
      <div className="container">
        <div className="box custom-box mt-6">
          <div className="box-body">
            <div className="sm:flex align-top justify-between">
              <div>
                <div className="lg:flex flex-wrap gap-2">
                  <div>
                    <span className="avatar avatar-xxl mt-1 me-4">
                      <img
                        src={project.logo || '/assets/images/apps/profile-pic.jpg'}
                        alt={project.name}
                      />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-0 flex items-center">
                      <Link href="#!" scroll={false}>
                        {project.name}
                      </Link>
                    </h4>
                    <Link href="#!" scroll={false} className="font-semibold">
                      <i className="bi bi-building"></i> {project.location}
                    </Link>
                    <div className="popular-tags mb-2 sm:mb-0 mt-2">
                      <Link
                        href="#!"
                        scroll={false}
                        className="badge me-2 !rounded-full bg-secondary/10 text-secondary"
                      >
                        <i className="bi bi-clock me-1"></i>Status {project.status}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="btn-list md:flex items-center mb-2 project-header">
                  <Link
                    href="/mint/"
                    className="ti-btn bg-secondary text-white !font-medium m-0 !me-[0.375rem]"
                  >
                    Mint Plot
                  </Link>

                  <div
                    aria-label="anchor"
                    className="ti-btn ti-btn-icon ti-btn-primary"
                    onClick={() => setModalOpen(true)}
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

        <div className="grid grid-cols-12 gap-6">

          <div className="xxl:col-span-8 col-span-12">

            <div className="box custom-box">
              <div className="box-body !p-0">
                <div className="box-header">
                  <h5 className="box-title">Project Data</h5>
                </div>
                <div className="grid grid-cols-12 gap-x-6">
                  {project.projectData.map((data, index) => (
                    <div key={index} className="xl:col-span-4 col-span-12 border-e border-dashed dark:border-defaultborder/10">
                      <div className="flex flex-wrap items-start p-6">
                        <div className="me-3 leading-none">
                          <span className="avatar avatar-md !rounded-full bg-camel10 shadow-sm">
                            <span
                              className="w-6 h-6"
                              dangerouslySetInnerHTML={{ __html: data.icon }}
                            />
                          </span>
                        </div>
                        <div className="flex-grow">
                          <h5 className="font-semibold ">{data.title}</h5>
                          <p className="text-[#8c9097] dark:text-white/50 mb-0 text-[0.75rem]">{data.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="box custom-box">
              <div className="box-body">
                <h5 className="font-semibold">About</h5>
                <p className="opacity-[0.9] mt-2" >{project.about}</p>
              </div>
            </div>

            <div className="xl:col-span-6 col-span-12">
              <div className="box custom-box">
                <div className="box-header">
                  <div className="box-title">Bitgrass NFT Activity</div>
                </div>
                <div className="box-body">
                  <div id="heatmap-colorrange">
                    <ReactApexChart options={Heatdata.Colorrange.options} series={Heatdata.Colorrange.series} type="heatmap" width={"100%"} height={350} />
                  </div>
                </div>
              </div>
            </div>

            <div className="box custom-box  !border-0 !shadow-none">
              <div className="box-body">
                <div className="grid grid-cols-12 items-center text-center lg:text-start">
                  <div className="lg:col-span-6 lg:col-span-12 col-span-12">
                    <h5 className="font-semibold mb-0">🖐 Looking for Passive Income?</h5>
                  </div>
                  <div className="lg:col-span-6 lg:col-span-12 col-span-12 mt-4 lg:mt-0 lg:flex lg:justify-end">
                    <a className="ti-btn bg-secondary text-white !font-medium" href="/mint/">Secure Your Plot</a>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="xxl:col-span-4 col-span-12">
            <div className="box">
              <div className="box-header justify-between">
                <div className="box-title">Total NFT Landplots: {project.nftStats.totalLandplots}</div>
                <button type="button" className="ti-btn ti-btn-light !py-1 !px-2 !text-[0.75rem]">View All</button>
              </div>
              <div className="box-body">
                <ul className="list-none personal-goals-list mb-0">
                  {project.nftStats.categories.map((category, index) => {
                    const colors = [
                      { bg: "bg-secondary/10", text: "text-secondary", bar: "!bg-secondary", icon: "bi bi-star" },
                      { bg: "bg-[#5ea9cc]/10", text: "text-[#5ea9cc]", bar: "!bg-[#5ea9cc]", icon: "bi bi-star-half " },
                      { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", icon: "bi bi-star-fill" }
                    ];
                    const { bg, text, bar, icon } = colors[index] || colors[0];
                    return (
                      <li key={category.name}>
                        <div className="flex items-center">
                          <div className="me-2">
                            <span className={`avatar avatar-rounded ${bg} !${text}`}>
                              <i className={`${icon} text-[1.125rem]`}></i>
                            </span>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="block font-semibold">{category.name} : {category.count} plots</span>
                              <span className={`block ${text}`}>{category.percentage}%</span>
                            </div>
                            <div
                              className="progress progress-animate progress-xs"
                              role="progressbar"
                              aria-valuenow={category.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div className={`progress-bar progress-bar-striped ${bar}`} style={{ width: `${category.percentage}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="box custom-box">
              <div className="box-header">
                <div className="box-title">Location</div>
              </div>
              <div className="box-body">
                <div id="map-popup">
                  <iframe width="100%" height="100%" src="https://www.openstreetmap.org/export/embed.html?bbox=9.84855651855469%2C34.178861487501464%2C10.16990661621094%2C34.397561658436466&amp;layer=cyclemap"></iframe><br /><small></small></div>
              </div>
            </div>
            <div className="box custom-box border dark:border-defaultborder/10">
              <div className="box-header">
                <div className="box-title">Documents</div>
              </div>
              <div className="box-body !p-0">
                <ul className="list-group list-group-flush">
                  {documents.map((doc, index) => (
                    <li
                      key={index}
                      className="list-group-item !border-s-0 !border-e-0 mb-2"
                    >
                      <div className="sm:flex items-center cursor-pointer">
                        <a href={doc.link} download target="_blank"
                          rel="noopener noreferrer" className="flex items-center w-full">
                          {/* PDF Icon */}
                          <span className="avatar avatar-md dark:border-defaultborder/10 me-2">
                            <i className="bx bxs-file-pdf !text-[#5ea9cc] text-[2.125rem]"></i>
                          </span>
                          {/* File Name */}
                          <p className="font-semibold text-[.875rem] mb-0 ">
                            {doc.name}
                          </p>
                        </a>
                      </div>

                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>


        </div>



        {/* OpenLayers Map */}
        {/* <div ref={mapRef} style={{ height: 300, width: '100%' }}></div> */}

        {/* Documents Section */}

      </div>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        project={project}
      />

       {/* <PurchaseCelebrationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        name='ahmed'
        token='0xe14cc93688fec2382b169b61b38f1491a2491eb3'
        id='17'
        image='https://ik.imagekit.io/cafu/collection-logo.png?updatedAt=1748949261858&ik-s=354aa8dbbc0e22d358dfbf7a3065a527da05fa53'


      /> */}
    </Fragment>
  );
}
