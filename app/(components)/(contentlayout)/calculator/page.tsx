"use client";
import React, { useState, Fragment } from "react";
import classNames from "classnames";

// ---------------- SVG ICONS ----------------
const categoryIcons: Record<string, JSX.Element> = {
  flights: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 20.8501H15.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.2499 11.523L5.49834 8.8502C5.40474 8.76598 5.33386 8.65955 5.29222 8.54073C5.25058 8.4219 5.23952 8.29451 5.26007 8.17029C5.28062 8.04607 5.33211 7.92902 5.40979 7.82994C5.48748 7.73085 5.58886 7.65292 5.70459 7.60332L6.3749 7.3502L11.7683 9.33489L16.9096 6.26457C17.5267 5.90139 18.2534 5.77095 18.9584 5.8968C19.6633 6.02266 20.3 6.39652 20.7533 6.95082L22.4999 9.19145L8.68021 17.4414C8.12195 17.7665 7.47367 17.9027 6.8318 17.8297C6.18993 17.7567 5.58877 17.4785 5.11771 17.0364L1.73709 13.7252C1.64617 13.64 1.57792 13.5334 1.5385 13.4152C1.49909 13.297 1.48975 13.1708 1.51134 13.0481C1.53293 12.9253 1.58476 12.8099 1.66215 12.7123C1.73953 12.6146 1.84004 12.5377 1.95459 12.4886L2.2499 12.3443L5.23021 13.3502L8.2499 11.523Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  ),
  transport: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 12.6001H19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4.5 7.3501H19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 20.1001L6.75 23.1001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M15 20.1001L17.25 23.1001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M17.25 3.6001H6.75C5.50736 3.6001 4.5 4.60746 4.5 5.8501V17.8501C4.5 19.0927 5.50736 20.1001 6.75 20.1001H17.25C18.4926 20.1001 19.5 19.0927 19.5 17.8501V5.8501C19.5 4.60746 18.4926 3.6001 17.25 3.6001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 7.3501V12.6001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M7.875 17.8501C8.49632 17.8501 9 17.3464 9 16.7251C9 16.1038 8.49632 15.6001 7.875 15.6001C7.25368 15.6001 6.75 16.1038 6.75 16.7251C6.75 17.3464 7.25368 17.8501 7.875 17.8501Z" fill="currentColor" />
      <path d="M16.125 17.8501C16.7463 17.8501 17.25 17.3464 17.25 16.7251C17.25 16.1038 16.7463 15.6001 16.125 15.6001C15.5037 15.6001 15 16.1038 15 16.7251C15 17.3464 15.5037 17.8501 16.125 17.8501Z" fill="currentColor" />
    </svg>

  ),
  office: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 20.8501V3.60014C12.7499 3.4644 12.713 3.33123 12.6432 3.21483C12.5734 3.09843 12.4733 3.00315 12.3536 2.93916C12.2339 2.87517 12.099 2.84487 11.9635 2.85148C11.8279 2.85809 11.6967 2.90137 11.5838 2.9767L4.08375 7.97639C3.98088 8.04502 3.89658 8.13803 3.83835 8.24713C3.78012 8.35623 3.74977 8.47803 3.75 8.6017V20.8501" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12.75 8.8501H19.5C19.6989 8.8501 19.8897 8.92912 20.0303 9.06977C20.171 9.21042 20.25 9.40119 20.25 9.6001V20.8501" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M1.5 20.8501H22.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.75 11.1001V12.6001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6.75 11.1001V12.6001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6.75 16.3501V17.8501" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.75 16.3501V17.8501" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  ),
  house: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 20.8501H22.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.25 20.8501V14.8501H9.75V20.8501" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M3.75 11.54V20.8504" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20.25 20.8504V11.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M2.25 13.0399L11.4694 3.81957C11.539 3.74984 11.6217 3.69452 11.7128 3.65678C11.8038 3.61904 11.9014 3.59961 12 3.59961C12.0986 3.59961 12.1962 3.61904 12.2872 3.65678C12.3783 3.69452 12.461 3.74984 12.5306 3.81957L21.75 13.0399" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  ),
  secondary: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 11.8505V17.1005C12.75 17.2994 12.671 17.4902 12.5304 17.6309C12.3897 17.7715 12.199 17.8505 12 17.8505C11.8011 17.8505 11.6104 17.7715 11.4697 17.6309C11.3291 17.4902 11.25 17.2994 11.25 17.1005V11.8505C11.25 11.6516 11.3291 11.4608 11.4697 11.3202C11.6104 11.1795 11.8011 11.1005 12 11.1005C12.199 11.1005 12.3897 11.1795 12.5304 11.3202C12.671 11.4608 12.75 11.6516 12.75 11.8505ZM16.2038 11.7755L15.6788 17.0255C15.6684 17.1238 15.6776 17.2232 15.7057 17.3179C15.7339 17.4127 15.7805 17.5009 15.8429 17.5776C15.9053 17.6543 15.9822 17.7178 16.0692 17.7647C16.1563 17.8115 16.2517 17.8407 16.35 17.8505C16.3753 17.8519 16.4007 17.8519 16.426 17.8505C16.6118 17.8503 16.7908 17.7811 16.9285 17.6564C17.0662 17.5317 17.1527 17.3604 17.1713 17.1755L17.6963 11.9255C17.7162 11.7276 17.6566 11.5299 17.5308 11.3759C17.4049 11.2219 17.223 11.1242 17.025 11.1043C16.8271 11.0844 16.6294 11.1439 16.4754 11.2698C16.3214 11.3957 16.2237 11.5776 16.2038 11.7755ZM7.7963 11.7755C7.77641 11.5776 7.67871 11.3957 7.52469 11.2698C7.37068 11.1439 7.17297 11.0844 6.97505 11.1043C6.77713 11.1242 6.59522 11.2219 6.46934 11.3759C6.34345 11.5299 6.28391 11.7276 6.3038 11.9255L6.8288 17.1755C6.84746 17.3612 6.93464 17.5332 7.07332 17.658C7.212 17.7828 7.39222 17.8515 7.5788 17.8505C7.60409 17.8519 7.62944 17.8519 7.65474 17.8505C7.75274 17.8407 7.84784 17.8116 7.93461 17.765C8.02138 17.7184 8.09812 17.6552 8.16045 17.5789C8.22278 17.5027 8.26948 17.4149 8.29789 17.3206C8.32629 17.2263 8.33584 17.1273 8.32599 17.0293L7.7963 11.7755ZM22.4935 8.9499L21.0807 19.5493C21.0314 19.909 20.8538 20.2388 20.5805 20.4779C20.3073 20.717 19.9569 20.8494 19.5938 20.8505H4.4063C4.04322 20.8494 3.69278 20.717 3.41955 20.4779C3.14632 20.2388 2.96871 19.909 2.91943 19.5493L1.50661 8.9499C1.49245 8.84395 1.5011 8.7362 1.53197 8.63387C1.56285 8.53154 1.61525 8.43699 1.68564 8.35656C1.75604 8.27613 1.84282 8.21167 1.94016 8.16751C2.03751 8.12336 2.14316 8.10052 2.25005 8.10052H6.40974L11.4375 2.35646C11.5079 2.27666 11.5945 2.21274 11.6915 2.16896C11.7885 2.12518 11.8936 2.10254 12 2.10254C12.1065 2.10254 12.2116 2.12518 12.3086 2.16896C12.4056 2.21274 12.4922 2.27666 12.5625 2.35646L17.5904 8.10052H21.75C21.8569 8.10052 21.9626 8.12336 22.0599 8.16751C22.1573 8.21167 22.2441 8.27613 22.3145 8.35656C22.3849 8.43699 22.4372 8.53154 22.4681 8.63387C22.499 8.7362 22.5076 8.84395 22.4935 8.9499ZM8.40286 8.10052H15.5972L12 3.98959L8.40286 8.10052ZM20.8932 9.60052H3.10693L4.4063 19.3505H19.5938L20.8932 9.60052Z" fill="currentColor" />
    </svg>

  ),
};

const categories = {
  transport: [
    { id: "vehicle_type", text: "Vehicle type you use?" },
    { id: "weekly_km", text: "Kilometers you drive per week?" },
  ],
  flights: [
    { id: "num_flights", text: "How many flights did you take this year?" },
    { id: "avg_distance", text: "Average flight distance in km?" },
  ],
  house: [
    { id: "office_size", text: "Office size in m²?" },
    { id: "monthly_energy", text: "Monthly energy usage (kWh)?" },
  ],
  office: [
    { id: "office_size", text: "Office size in m²?" },
    { id: "monthly_energy", text: "Monthly energy usage (kWh)?" },
  ],
  secondary: [
    { id: "office_size", text: "Office size in m²?" },
    { id: "monthly_energy", text: "Monthly energy usage (kWh)?" },
  ],
};

const categoryList = Object.keys(categories) as (keyof typeof categories)[];

const CarbonCalculator = () => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof categories>(
    "transport"
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emissions, setEmissions] = useState(0);

  const handleChange = (id: string, value: string) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);

    if (activeCategory === "flights") {
      const num = parseFloat(updated["num_flights"] || "0");
      const dist = parseFloat(updated["avg_distance"] || "0");
      setEmissions(num * dist * 0.0002 || 0);
    } else if (activeCategory === "transport") {
      const km = parseFloat(updated["weekly_km"] || "0");
      setEmissions(km * 0.00015 || 0);
    } else if (activeCategory === "office") {
      const kWh = parseFloat(updated["monthly_energy"] || "0");
      setEmissions(kWh * 0.0005 || 0);
    }
  };

  const currentQuestions = categories[activeCategory];
  const showSecond = answers[currentQuestions[0].id]?.trim().length > 0;

  return (
    <Fragment>
      {/* PAGE WRAPPER with consistent spacing */}
      <div className="mx-auto px-2 sm:px-6 lg:px-8">

        {/* -------- TITLE + DESCRIPTION -------- */}
        <div className="grid grid-cols-12 gap-x-6 mt-14 mb-12">
          {/* Left: Title + Description */}
          <div className="col-span-12 md:col-span-6 flex items-center">
            <div className="w-full">
              <p className="text-4xl font-bold mb-1">Emissions Calculator</p>
              <p>
                Your daily activities—like travel, shipping, and work—emit greenhouse gases.<br />
                Bitgrass helps you estimate your footprint and offset what you can’t reduce<br />
                by owning real land-backed NFTs that generate carbon credits onchain.
              </p>
            </div>
          </div>
        </div>

        {/* -------- CALCULATOR + EMISSIONS -------- */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* LEFT SIDE - Calculator Tabs + Questions (8 columns) */}
          <div className="col-span-12 md:col-span-8 box rounded-sm shadow-md p-6 flex flex-col h-full">
            {/* Tabs */}
            <nav
              className="nav nav-pills nav-style-3 flex gap-3 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar"
              aria-label="Tabs"
            >
              {categoryList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={classNames(
                    "nav-link flex items-center gap-2 !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md shrink-0",
                    activeCategory === cat
                      ? "active bg-primary text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-primary"
                  )}
                >
                  {categoryIcons[cat]}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </nav>

            {/* Hide scrollbar visually but keep scrollable */}
            <style jsx>{`
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>


            {/* Question 1 */}
            <div className="transition-all duration-300 mb-6">
              <p className="text-lg font-bold text-primary mb-3">
                {currentQuestions[0].text}
              </p>
              <input
                type="text"
                className="w-full px-4 py-3 bg-camel rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                value={answers[currentQuestions[0].id] || ""}
                onChange={(e) => handleChange(currentQuestions[0].id, e.target.value)}
                placeholder="Type your answer..."
              />
            </div>

            {/* Question 2 */}
            <div
              className={classNames(
                "transition-all duration-500 transform",
                showSecond
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              )}
            >
              <p className="text-base font-bold text-primary mb-3">
                {currentQuestions[1].text}
              </p>
              <input
                type="text"
                className="w-full px-4 py-3 bg-camel text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                value={answers[currentQuestions[1].id] || ""}
                onChange={(e) => handleChange(currentQuestions[1].id, e.target.value)}
                placeholder="Type your answer..."
              />
            </div>
          </div>

          {/* RIGHT SIDE - Emissions Card (4 columns) */}
          <div className="col-span-12 md:col-span-4 box rounded-sm shadow-md p-6 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-lg font-bold text-primary mb-4 text-center">
                Estimated emissions
              </h2>
              <div className="flex flex-col items-center bg-camel rounded-sm px-4 py-4 mt-4">
                <div className="text-5xl font-bold text-primary">
                  {emissions.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">tonnes CO₂e</div>
              </div>
              <div className="text-[10px] text-gray-500 italic mt-2">
                * CO₂e = carbon-dioxide equivalent
              </div>
              <p className="text-center mt-6">
                Reduce what you can, <br /> offset the rest with a Bitgrass NFT.
              </p>
            </div>
            <button
              className="bg-secondary text-white px-6 py-2 rounded-sm text-sm font-medium w-full"
              onClick={() => alert("Claim $BTG or mint NFT")}
            >
              Offset with Bitgrass NFT
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );


};

export default CarbonCalculator;
