
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MenuItems } from "../sidebar/nav";

const Modalsearch = () => {
  //Search functionality
  const [show, setShow] = useState("false");

  const handleClose = () => setShow("false");
  const handleShow = () => setShow("false");

  const [show1, setShow1] = useState<any>("false");
  const [InputValue, setInputValue] = useState("");
  const [show2, setShow2] = useState<any>("false");
  const [searchcolor, setsearchcolor] = useState("text-dark");
  const [searchval, setsearchval] = useState("Type something");
  const [NavData, setNavData] = useState([]);

  useEffect(() => {
    const clickHandler = (_event:any) => {
      const searchResult = document.querySelector(".search-result");
      if (searchResult) {
        searchResult.classList.add("hidden");
      }
    };

    document.addEventListener("click", clickHandler);

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  const myfunction = (inputvalue: string) => {
    document.querySelector(".search-result")?.classList.remove("hidden");

    const i :any= [];
    const allElement2:any = [];

		MenuItems.forEach((mainLevel:any) => {
			if (mainLevel.children) {
				setShow1(true);
				mainLevel.children.forEach((subLevel:any) => {
					i.push(subLevel);
					if (subLevel.children) {
						subLevel.children.forEach((subLevel1:any) => {
							i.push(subLevel1);
							if (subLevel1.children) {
								subLevel1.children.forEach((subLevel2:any) => {
									i.push(subLevel2);
								});
							}
						});
					}
				});
			}
		});
		for (const allElement of MenuItems) {
			if (allElement?.title?.toLowerCase().includes(inputvalue.toLowerCase())) {
				if (allElement?.title?.toLowerCase().startsWith(inputvalue.toLowerCase())) {
					setShow2(true);

					// Check if the element has a path and doesn't already exist in allElement2 before pushing
					if (allElement?.path && !allElement2?.some((el:any) => el.title === allElement?.title)) {
						allElement2?.push(allElement);
					}
				}
			}
		}


    	for (const allElement of i) {
			if (allElement?.title?.toLowerCase().includes(inputvalue.toLowerCase())) {
				if (allElement?.title?.toLowerCase().startsWith(inputvalue.toLowerCase())) {
					setShow2(true);

					// Check if the element has a path and doesn't already exist in allElement2 before pushing
					if (allElement?.path && !allElement2?.some((el:any) => el.title === allElement?.title)) {
						allElement2?.push(allElement);
					}
				}
			}
		}


		if (!allElement2.length || inputvalue === "") {
			if (inputvalue === "") {
				setShow2(false);
				setsearchval("Type something");
				setsearchcolor("text-dark");
			}
			if (!allElement2.length) {
				setShow2(false);
				setsearchcolor("text-danger");
				setsearchval("There is no component with this name");
			}
		}
		setNavData(allElement2);

  };

  const tabsData = [
    {id:1, class:"Dashbaord", icon:"user"},
    {id:2, class:"Swap", icon:"file-text"},
    {id:3, class:"Mint NFT", icon:"align-left"},
    {id:4, class:"Portfolio", icon:"server"},

  ]

  const [allData, setAllData] = useState(tabsData);

  function handleRemove(id: number) {
      const newList = allData.filter((idx) => idx.id !== id);
      setAllData(newList);
  }
  
  return (
    <div id="search-modal" className="hs-overlay ti-modal hidden mt-[1.75rem]"  onClick={handleClose}>
    <div className="ti-modal-box">
      <div className="ti-modal-content !border !border-defaultborder dark:!border-defaultborder/10 !rounded-[0.5rem]">
        <div className="ti-modal-body">
  
          <div className="input-group border-[2px] border-primary rounded-[0.25rem] w-full flex">
            <a aria-label="anchor" href="#!"
              className="input-group-text flex items-center bg-light border-e-[#dee2e6] !py-[0.375rem] !px-[0.75rem] !rounded-none !text-[0.875rem]"
              id="Search-Grid"><i className="fe fe-search header-link-icon text-[0.875rem]"></i></a>
  
            <input type="search" className="form-control border-0 px-2 !text-[0.8rem] w-full focus:ring-transparent"
              placeholder="Search" aria-label="Username"
              defaultValue={InputValue}
              autoComplete="off"
              onChange={(ele) => {
                myfunction(ele.target.value);
                setInputValue(ele.target.value);
              }}/>
  
          </div>
          {show1 ? (
              <div className="box search-result relative z-[9] search-fix  border border-gray-200 dark:border-white/10 mt-1 w-100">
                <div className="box-header">
                  <h6 className="box-title me-2 text-break">
                    Search result of {InputValue}
                  </h6>
                </div>
                <div className="box-body p-2 flex flex-col max-h-[250px] overflow-auto">
                  {show2 ? (
                    NavData.map((e:any) => (
                      <div
                        key={Math.random()}
                        className="ti-list-group gap-x-3.5 text-gray-800 dark:bg-bgdark dark:border-white/10 dark:text-white"
                      >
                        <Link
                          href={`${e.path}`}
                          className="search-result-item"
                          onClick={() => {
                            setShow1("false"), setInputValue("");
                          }}
                        >
                          {e.title}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <b className={`${searchcolor} `}>{searchval}</b>
                  )}
                </div>
              </div>
            ) : (
              ""
            )}

  
  
          <div className="my-[1.5rem]">
            <p className="font-normal  text-[#8c9097] dark:text-white/50 text-[0.813rem] mb-2">Are You Looking For... :</p>
  
            <div id="dismiss-alert" role="alert"
              className="!p-2 border dark:border-defaultborder/10 rounded-[0.3125rem] flex items-center text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-2 !text-[0.8125rem] alert">
              <Link href="/dashboard?tab=market"><span>Market</span></Link>
              <Link aria-label="anchor" className="ms-auto leading-none" href="#!" scroll={false} data-hs-remove-element="#dismiss-alert"><i
                  className="fe fe-x !text-[0.8125rem] text-[#8c9097] dark:text-white/50"></i></Link>
            </div>
            <div id="dismiss-alert1" role="alert"
              className="!p-2 border dark:border-defaultborder/10 rounded-[0.3125rem] flex items-center text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-2 !text-[0.8125rem] alert">
              <Link href="/portfolio"><span>Portfolio</span></Link>
              <Link aria-label="anchor" className="ms-auto leading-none" href="#!" scroll={false} data-hs-remove-element="#dismiss-alert1"><i
                  className="fe fe-x !text-[0.8125rem] text-[#8c9097] dark:text-white/50"></i></Link>
            </div>
  
            <div id="dismiss-alert2" role="alert"
              className="!p-2 border dark:border-defaultborder/10 rounded-[0.3125rem] flex items-center text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0 !text-[0.8125rem] alert">
              <Link href="/mint"><span>Mint NFT</span></Link>
              <Link aria-label="anchor" className="ms-auto lh-1" href="#!" scroll={false} data-hs-remove-element="#dismiss-alert2"><i
                  className="fe fe-x !text-[0.8125rem] text-[#8c9097] dark:text-white/50"></i></Link>
            </div>
          </div>
        </div>
  
      </div>
    </div>
  </div>
  );
};

export default Modalsearch;
