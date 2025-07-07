"use client";
import { ProjectListdata } from '@/shared/data/apps/jobs/ProjectListdata';
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import("react-select"), { ssr: false });

const Projectslist = () => {
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
            <Seo title={"Projects List"} />
            <div className='container'>
                <div className="grid grid-cols-12 mt-6">
                    <div className="xl:col-span-12 col-span-12">
                        <div className="box overflow-hidden">
                            <div className="box-header justify-between">
                                <div className="box-title">All Projects</div>
                                <div className="flex items-center">
                                    {/* Search Input */}
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control w-full !bg-camel dark:!bg-light border-0 !rounded-none"
                                            placeholder="Filter by name"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            aria-describedby="search-project"
                                        />
                                        <button
                                            className="ti-btn ti-btn-camel !bg-camel !mb-0"
                                            type="button"
                                            aria-label="button"
                                            id="search-team-member"
                                        >
                                            <i className="ri-search-line dark:text-white/50"></i>
                                        </button>
                                    </div>
                                    <Select
                                        name="state"
                                        options={Data}
                                        className="w-full !rounded-none ms-2"
                                        isSearchable
                                        menuPlacement='auto'
                                        classNamePrefix="Select2"
                                        defaultValue={[Data[0]]}
                                    />
                                    <Select
                                        name="state"
                                        options={Data2}
                                        className="w-full !rounded-none p-0 ms-2"
                                        isSearchable
                                        menuPlacement='auto'
                                        classNamePrefix="Select2"
                                        defaultValue={[Data2[0]]}
                                    />
                                </div>
                            </div>
                            <div className="box-body !p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover whitespace-nowrap min-w-full">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-start">Project</th>
                                                <th scope="col" className="text-start">Project Status</th>
                                                <th scope="col" className="text-start">Area</th>
                                                <th scope="col" className="text-start">Standard</th>
                                                <th scope="col" className="text-start">Country</th>
                                                <th scope="col" className="text-start">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((idx: any) => (
                                                <tr
                                                    className="border-t hover:bg-gray-200 dark:hover:bg-light cursor-pointer"
                                                    key={idx.id}
                                                    onClick={() => window.location.href = `/projects/project-details/${idx.id}`}
                                                >
                                                    <td>
                                                        <div className="flex items-center">
                                                            <span className="avatar avatar-sm bg-light !rounded-full mt-1">
                                                                <img src={idx.src} alt="" />
                                                            </span>
                                                            <div className="ms-2">
                                                                <p className="font-semibold mb-0 flex items-center">
                                                                    <Link href={`/projects/project-details/${idx.id}`}>{idx.class}</Link>

                                                                </p>
                                                                <p className="text-[0.75rem] text-muted mb-0">{idx.class1}</p>
                                                            </div>
                                                        </div>
                                                    </td>
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
                                                        <div className={`badge rounded-full gap-2`} style={{ background: "#F3F6F8", color: "#333335" , paddingTop:"0.25rem" , paddingBottom:"0.25rem" }}>
                                                            <span
                                                                className="w-4"
                                                                dangerouslySetInnerHTML={{ __html: svgRemoval }}
                                                            />
                                                            Removal</div>
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
    );
};

export default Projectslist;
