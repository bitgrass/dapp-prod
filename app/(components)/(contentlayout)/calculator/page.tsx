"use client";
import React, { useState, Fragment, useEffect } from "react";
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
  // Vehicle (car)
  vehicle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 9.75H21.4875L18.8831 3.89062C18.7653 3.62553 18.5731 3.40029 18.3298 3.24222C18.0865 3.08414 17.8026 3 17.5125 3H6.4875C6.19738 3 5.91349 3.08414 5.67022 3.24222C5.42695 3.40029 5.23474 3.62553 5.11688 3.89062L2.5125 9.75H1.5C1.30109 9.75 1.11032 9.82902 0.96967 9.96967C0.829018 10.1103 0.75 10.3011 0.75 10.5C0.75 10.6989 0.829018 10.8897 0.96967 11.0303C1.11032 11.171 1.30109 11.25 1.5 11.25H2.25V18.75C2.25 19.1478 2.40804 19.5294 2.68934 19.8107C2.97064 20.092 3.35218 20.25 3.75 20.25H6C6.39782 20.25 6.77936 20.092 7.06066 19.8107C7.34196 19.5294 7.5 19.1478 7.5 18.75V17.25H16.5V18.75C16.5 19.1478 16.658 19.5294 16.9393 19.8107C17.2206 20.092 17.6022 20.25 18 20.25H20.25C20.6478 20.25 21.0294 20.092 21.3107 19.8107C21.592 19.5294 21.75 19.1478 21.75 18.75V11.25H22.5C22.6989 11.25 22.8897 11.171 23.0303 11.0303C23.171 10.8897 23.25 10.6989 23.25 10.5C23.25 10.3011 23.171 10.1103 23.0303 9.96967C22.8897 9.82902 22.6989 9.75 22.5 9.75ZM6.4875 4.5H17.5125L19.8459 9.75H4.15406L6.4875 4.5ZM6 18.75H3.75V17.25H6V18.75ZM18 18.75V17.25H20.25V18.75H18ZM20.25 15.75H3.75V11.25H20.25V15.75ZM5.25 13.5C5.25 13.3011 5.32902 13.1103 5.46967 12.9697C5.61032 12.829 5.80109 12.75 6 12.75H7.5C7.69891 12.75 7.88968 12.829 8.03033 12.9697C8.17098 13.1103 8.25 13.3011 8.25 13.5C8.25 13.6989 8.17098 13.8897 8.03033 14.0303C7.88968 14.171 7.69891 14.25 7.5 14.25H6C5.80109 14.25 5.61032 14.171 5.46967 14.0303C5.32902 13.8897 5.25 13.6989 5.25 13.5ZM15.75 13.5C15.75 13.3011 15.829 13.1103 15.9697 12.9697C16.1103 12.829 16.3011 12.75 16.5 12.75H18C18.1989 12.75 18.3897 12.829 18.5303 12.9697C18.671 13.1103 18.75 13.3011 18.75 13.5C18.75 13.6989 18.671 13.8897 18.5303 14.0303C18.3897 14.171 18.1989 14.25 18 14.25H16.5C16.3011 14.25 16.1103 14.171 15.9697 14.0303C15.829 13.8897 15.75 13.6989 15.75 13.5Z" fill="currentColor" />
    </svg>

  ),
  // FOOD tab uses your old "secondary" icon as requested
  food: (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 11.8505V17.1005C12.75 17.2994 12.671 17.4902 12.5304 17.6309C12.3897 17.7715 12.199 17.8505 12 17.8505C11.8011 17.8505 11.6104 17.7715 11.4697 17.6309C11.3291 17.4902 11.25 17.2994 11.25 17.1005V11.8505C11.25 11.6516 11.3291 11.4608 11.4697 11.3202C11.6104 11.1795 11.8011 11.1005 12 11.1005C12.199 11.1005 12.3897 11.1795 12.5304 11.3202C12.671 11.4608 12.75 11.6516 12.75 11.8505ZM16.2038 11.7755L15.6788 17.0255C15.6684 17.1238 15.6776 17.2232 15.7057 17.3179C15.7339 17.4127 15.7805 17.5009 15.8429 17.5776C15.9053 17.6543 15.9822 17.7178 16.0692 17.7647C16.1563 17.8115 16.2517 17.8407 16.35 17.8505C16.3753 17.8519 16.4007 17.8519 16.426 17.8505C16.6118 17.8503 16.7908 17.7811 16.9285 17.6564C17.0662 17.5317 17.1527 17.3604 17.1713 17.1755L17.6963 11.9255C17.7162 11.7276 17.6566 11.5299 17.5308 11.3759C17.4049 11.2219 17.223 11.1242 17.025 11.1043C16.8271 11.0844 16.6294 11.1439 16.4754 11.2698C16.3214 11.3957 16.2237 11.5776 16.2038 11.7755ZM7.7963 11.7755C7.77641 11.5776 7.67871 11.3957 7.52469 11.2698C7.37068 11.1439 7.17297 11.0844 6.97505 11.1043C6.77713 11.1242 6.59522 11.2219 6.46934 11.3759C6.34345 11.5299 6.28391 11.7276 6.3038 11.9255L6.8288 17.1755C6.84746 17.3612 6.93464 17.5332 7.07332 17.658C7.212 17.7828 7.39222 17.8515 7.5788 17.8505C7.60409 17.8519 7.62944 17.8519 7.65474 17.8505C7.75274 17.8407 7.84784 17.8116 7.93461 17.765C8.02138 17.7184 8.09812 17.6552 8.16045 17.5789C8.22278 17.5027 8.26948 17.4149 8.29789 17.3206C8.32629 17.2263 8.33584 17.1273 8.32599 17.0293L7.7963 11.7755ZM22.4935 8.9499L21.0807 19.5493C21.0314 19.909 20.8538 20.2388 20.5805 20.4779C20.3073 20.717 19.9569 20.8494 19.5938 20.8505H4.4063C4.04322 20.8494 3.69278 20.717 3.41955 20.4779C3.14632 20.2388 2.96871 19.909 2.91943 19.5493L1.50661 8.9499C1.49245 8.84395 1.5011 8.7362 1.53197 8.63387C1.56285 8.53154 1.61525 8.43699 1.68564 8.35656C1.75604 8.27613 1.84282 8.21167 1.94016 8.16751C2.03751 8.12336 2.14316 8.10052 2.25005 8.10052H6.40974L11.4375 2.35646C11.5079 2.27666 11.5945 2.21274 11.6915 2.16896C11.7885 2.12518 11.8936 2.10254 12 2.10254C12.1065 2.10254 12.2116 2.12518 12.3086 2.16896C12.4056 2.21274 12.4922 2.27666 12.5625 2.35646L17.5904 8.10052H21.75C21.8569 8.10052 21.9626 8.12336 22.0599 8.16751C22.1573 8.21167 22.2441 8.27613 22.3145 8.35656C22.3849 8.43699 22.4372 8.53154 22.4681 8.63387C22.499 8.7362 22.5076 8.84395 22.4935 8.9499ZM8.40286 8.10052H15.5972L12 3.98959L8.40286 8.10052ZM20.8932 9.60052H3.10693L4.4063 19.3505H19.5938L20.8932 9.60052Z" fill="currentColor" />
    </svg>
  ),
};

// ---------------- OPTIONS FOR DROPDOWNS ----------------
// ---------------- OPTIONS FOR DROPDOWNS ----------------
const questionOptions: Record<string, { value: string; label: string }[]> = {
  // 🏠 House
  house_type: [
    { value: "none", label: "I don’t live in a house (covered elsewhere)" },
    { value: "detached", label: "Detached" },
    { value: "semi_detached", label: "Semi-detached" },
    { value: "terraced", label: "Terraced" },
    { value: "flat", label: "Flat / Apartment" },
  ],
  bedrooms: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4 or more" },
  ],

  // 🚗 Vehicle
  vehicle_type: [
    { value: "none", label: "I don’t own a vehicle" },
    { value: "petrol", label: "Gasoline / Petrol Car" },
    { value: "diesel", label: "Diesel Car" },
    { value: "motorbike", label: "Motorbike / Scooter" },
    { value: "ev", label: "Electric Vehicle (EV)" },
  ],
  annual_km_band: [
    { value: "<10k", label: "Less than 10,000 km/year" },
    { value: "10-20k", label: "Between 10,000 and 20,000 km/year" },
    { value: "20-40k", label: "Between 20,000 and 40,000 km/year" },
    { value: ">40k", label: "More than 40,000 km/year" },
  ],

  // 🚌 Public Transport
  pt_frequency: [
    { value: "never", label: "Never" },
    { value: "1-2", label: "1–2 times per week" },
    { value: "2-3", label: "2–3 times per week" },
    { value: "4+", label: "More than 4 times per week" },
  ],
  pt_km_day: [
    { value: "<5", label: "Less than 5 km/day" },
    { value: "5-15", label: "5–15 km/day" },
    { value: "15-30", label: "15–30 km/day" },
    { value: ">30", label: "More than 30 km/day" },
  ],

  // ✈️ Flights
  num_flights: [
    { value: "0", label: "I don’t take flights" },
    { value: "1-2", label: "1–2 flights per year" },
    { value: "3-5", label: "3–5 flights per year" },
    { value: "6+", label: "More than 6 flights per year" },
  ],
  avg_distance: [
    { value: "<463", label: "Short-haul (<463 km)" },
    { value: "463-3000", label: "Medium-haul (463–3000 km)" },
    { value: ">3000", label: "Long-haul (>3000 km)" },
  ],

  // 🍔 Food
  restaurant_spend: [
    { value: "$0", label: "$0 (I don’t eat out)" },
    { value: "$1-10", label: "$1–$10 per week" },
    { value: "$10-60", label: "$10–$60 per week" },
    { value: ">$60", label: "More than $60 per week" },
  ],
  food_waste: [
    { value: "none", label: "None" },
    { value: "1-10%", label: "1%–10%" },
    { value: "10-30%", label: "10%–30%" },
    { value: ">30%", label: "More than 30%" },
  ],
};


// ---------------- QUESTIONS ----------------
const categories: Record<string, { id: string; text: string }[]> = {
  house: [
    { id: "house_type", text: "What kind of house do you live in?" },
    { id: "bedrooms", text: "How many bedrooms does your house have?" },
  ],
  vehicle: [
    { id: "vehicle_type", text: "What type of vehicle do you own?" },
    { id: "annual_km_band", text: "How many kilometers do you drive your vehicle per year?" },
  ],
  transport: [
    { id: "pt_frequency", text: "How many times do you use public transport per week?" },
    { id: "pt_km_day", text: "How many kilometers do you travel using public transport per day?" },
  ],
  flights: [
    { id: "num_flights", text: "How many flights do you take per year?" },
    { id: "avg_distance", text: "Average flight distance in km? (optional)" },
  ],
  food: [
    { id: "restaurant_spend", text: "Per week, how much do you spend on food from restaurants and takeaways?" },
    { id: "food_waste", text: "Of the food you buy, how much is wasted or thrown away?" },
  ],
};

const categoryList = ["house", "vehicle", "transport", "flights", "food"] as (keyof typeof categories)[];

// Map each question id -> its category (so we can update the right bucket)
const questionIdToCategory: Record<string, keyof typeof categories> = Object.keys(categories).reduce((acc, k) => {
  const cat = k as keyof typeof categories;
  categories[cat].forEach((q) => (acc[q.id] = cat));
  return acc;
}, {} as Record<string, keyof typeof categories>);

// --- Unit conversions ---
const KM_PER_MILE = 1.60934;

// --- Verified emission intensities (kg CO2e per km per passenger) ---
// Sources: OurWorldInData, ICCT, VisualCapitalist, Wikipedia, NAVIT
const EMISSIONS_KG_PER_KM = {
  short_flight: 0.257,
  medium_flight: 0.177,  // 463–3000 km (avg from ICCT 2021)
  // 257 g/km → <463 km
  long_flight: 0.113,    // 113 g/km → ≥463 km
  train: 0.058,          // 58 g/km (avg, German NAVIT 2022)
  bus: 0.068,            // 68 g/km (avg, EU data)
  petrol_car: 0.192,     // 192 g/km
  diesel_car: 0.171,     // 171 g/km
  motorbike: 0.072,      // 72 g/km
  // EV placeholder: to be computed from grid × efficiency
};

// --- EV parameters ---
const GRID_INTENSITY_G_PER_KWH = 400; // Example: 400 gCO2/kWh (EU avg ~ 2022)
const EV_EFFICIENCY_KWH_PER_KM = 0.2; // 0.2 kWh/km typical
function computeEmissionsForCategory(
  cat: keyof typeof categories,
  a: Record<string, string>
): number {
  if (cat === "flights") {
    const n = parseFloat(a["num_flights"] || "0") || 0;
    if (n <= 0) return 0;

    const distKm = parseFloat(a["avg_distance"] || "0") || 1000;
    let type: keyof typeof EMISSIONS_KG_PER_KM;

    if (distKm < 463) type = "short_flight";
    else if (distKm <= 3000) type = "medium_flight";
    else type = "long_flight";

    const kg = n * distKm * (EMISSIONS_KG_PER_KM[type] || 0);
    return kg / 1000; // tonnes
  }

  if (cat === "transport") {
    const freq = a["pt_frequency"];
    if (!freq || freq === "never") return 0;

    const daysPerWeek: Record<string, number> = { never: 0, "1-2": 1.5, "2-3": 2.5, "4+": 5 };
    const kmPerDay: Record<string, number> = { "<5": 3, "5-15": 10, "15-30": 22.5, ">30": 35 };

    const annualKm = (daysPerWeek[freq] ?? 0) * (kmPerDay[a["pt_km_day"]] ?? 0) * 52;
    const kg = annualKm * EMISSIONS_KG_PER_KM["train"]; // assume train by default
    return kg / 1000;
  }

  if (cat === "vehicle") {
    const type = a["vehicle_type"];
    if (!type || type === "none") return 0;

    const band = a["annual_km_band"];
    const kmMid: Record<string, number> = {
      "<10k": 7500,
      "10-20k": 15000,
      "20-40k": 30000,
      ">40k": 45000,
    };
    const annualKm = kmMid[band] ?? 0;

    if (type === "ev") {
      const kgPerKm = (GRID_INTENSITY_G_PER_KWH * EV_EFFICIENCY_KWH_PER_KM) / 1000;
      return (annualKm * kgPerKm) / 1000;
    }

    const factor: Record<string, number> = {
      petrol: EMISSIONS_KG_PER_KM["petrol_car"],
      diesel: EMISSIONS_KG_PER_KM["diesel_car"],
      motorbike: EMISSIONS_KG_PER_KM["motorbike"],
    };
    return (annualKm * (factor[type] ?? 0)) / 1000;
  }

  if (cat === "house") {
    const t = a["house_type"];
    if (!t || t === "none") return 0;

    const b = a["bedrooms"];
    const baseByType: Record<string, number> = {
      detached: 4.8,
      semi_detached: 3.8,
      terraced: 3.0,
      flat: 2.4,
    };
    const bedroomMult: Record<string, number> = { "1": 0.8, "2": 1.0, "3": 1.2, "4+": 1.4 };
    return (baseByType[t] ?? 0) * (bedroomMult[b] ?? 1);
  }

  if (cat === "food") {
    const spend = a["restaurant_spend"];
    if (!spend || spend === "$0") return 0;

    const waste = a["food_waste"];
    const spendBase: Record<string, number> = {
      "$0": 0,
      "$1-10": 0.05,
      "$10-60": 0.3,
      ">$60": 0.8,
    };
    const wasteAdd: Record<string, number> = {
      none: 0,
      "1-10%": 0.05,
      "10-30%": 0.2,
      ">30%": 0.5,
    };
    return (spendBase[spend] ?? 0) + (waste ? (wasteAdd[waste] ?? 0) : 0);
  }

  return 0;
}

// Function to check if current tab is completed
const isTabCompleted = (category: keyof typeof categories, answers: Record<string, string>) => {
  const questions = categories[category];
  const firstQuestion = questions[0];
  const secondQuestion = questions[1];

  // Check if first question is answered
  const firstAnswer = answers[firstQuestion.id];
  if (!firstAnswer) return false;

  // Check if second question should be shown and is answered
  const shouldShowSecond = (() => {
    const raw = firstAnswer.toString().trim().toLowerCase();

    if (category === "transport" && raw === "never") return false;
    if (category === "vehicle" && raw === "none") return false;
    if (category === "house" && raw === "none") return false;
    if (category === "food" && raw === "$0") return false;

    if (category === "flights") {
      const n = parseFloat(raw.replace(/[^\d.]/g, ""));
      if (!isFinite(n) || n <= 0) return false;
    }

    return true;
  })();

  // If second question should be shown, check if it's answered
  if (shouldShowSecond) {
    const secondAnswer = answers[secondQuestion.id];
    return !!secondAnswer;
  }

  // If second question shouldn't be shown, tab is completed with just first answer
  return true;
};


const CarbonCalculator = () => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof categories>("house");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [manualNavigation, setManualNavigation] = useState(false);
  const [manualNavTimeout, setManualNavTimeout] = useState<NodeJS.Timeout | null>(null);

  // keep emissions per category so the TOTAL stays stable when switching tabs
  const [emissionsByCategory, setEmissionsByCategory] = useState<
    Record<keyof typeof categories, number>
  >({
    house: 0,
    vehicle: 0,
    transport: 0,
    flights: 0,
    food: 0,
  });

  const totalEmissions = Object.values(emissionsByCategory).reduce((s, v) => s + v, 0);
  const [previousCompletionState, setPreviousCompletionState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const currentlyCompleted = isTabCompleted(activeCategory, answers);
    const wasCompleted = previousCompletionState[activeCategory];

    // Update completion state first
    if (currentlyCompleted !== wasCompleted) {
      setPreviousCompletionState(prev => ({
        ...prev,
        [activeCategory]: currentlyCompleted
      }));
    }

    // Only auto-advance if tab just became completed
    if (currentlyCompleted && !wasCompleted && !manualNavigation) {
      const currentIndex = categoryList.indexOf(activeCategory);
      const nextIndex = currentIndex + 1;

      if (nextIndex < categoryList.length) {
        const timer = setTimeout(() => {
          setActiveCategory(categoryList[nextIndex]);
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [answers, activeCategory, manualNavigation]);

  const handleChange = (id: string, value: string) => {
    // Clear the manual navigation timeout if it exists
    if (manualNavTimeout) {
      clearTimeout(manualNavTimeout);
      setManualNavTimeout(null);
    }

    // Reset manual navigation flag when user starts answering
    setManualNavigation(false);

    const updated = { ...answers, [id]: value };
    setAnswers(updated);

    const cat = questionIdToCategory[id] || activeCategory;
    const nextVal = computeEmissionsForCategory(cat, updated);
    setEmissionsByCategory((prev) => ({ ...prev, [cat]: nextVal }));
  };


  const currentQuestions = categories[activeCategory];

  // Q2 display logic:
  // - still requires Q1 to be filled
  // - hide when:
  //   * transport: pt_frequency === 'never'
  //   * vehicle:   vehicle_type === 'none' (I don’t own a vehicle)
  //   * flights:   num_flights <= 0
  const showSecond = (() => {
    const firstId = currentQuestions[0].id;
    const raw = (answers[firstId] || "").toString().trim().toLowerCase();
    const firstFilled = raw.length > 0;

    if (!firstFilled) return false;

    if (activeCategory === "transport" && raw === "never") return false;
    if (activeCategory === "vehicle" && raw === "none") return false;
    if (activeCategory === "house" && raw === "none") return false;
    if (activeCategory === "food" && raw === "$0") return false;

    if (activeCategory === "flights") {
      const n = parseFloat(raw.replace(/[^\d.]/g, ""));
      if (!isFinite(n) || n <= 0) return false;
    }

    return true;
  })();


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
              <p className="dark:text-white/60">
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
                  onClick={() => {
                    // Clear any existing timeout
                    if (manualNavTimeout) {
                      clearTimeout(manualNavTimeout);
                    }

                    setManualNavigation(true);
                    setActiveCategory(cat);

                    const currentIndex = categoryList.indexOf(activeCategory);
                    const targetIndex = categoryList.indexOf(cat);

                    if (targetIndex < currentIndex) {
                      setPreviousCompletionState(prev => ({
                        ...prev,
                        [cat]: false
                      }));
                    }

                    // Store the timeout ID so we can cancel it later
                    const timeoutId = setTimeout(() => {
                      setManualNavigation(false);
                      setManualNavTimeout(null);
                    }, 5000);

                    setManualNavTimeout(timeoutId);
                  }}
                  className={classNames(
                    "nav-link flex items-center gap-2 !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md shrink-0 relative",
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
            {/* Question 1 */}
            <div className="transition-all duration-300 mb-6">
              <p className="text-base font-semibold text-primary mb-3">
                {currentQuestions[0].text}
              </p>

              {questionOptions[currentQuestions[0].id] ? (
                <select
                  className="w-full px-4 py-3 bg-camel text-sm rounded-sm focus:outline-none 
                 focus:ring-2 focus:ring-secondary appearance-none"
                  value={answers[currentQuestions[0].id] || ""}
                  onChange={(e) => handleChange(currentQuestions[0].id, e.target.value)}
                >
                  <option value="" disabled>
                    Select an option…
                  </option>
                  {questionOptions[currentQuestions[0].id].map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="hover:bg-secondary hover:text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={currentQuestions[0].id === "num_flights" ? "number" : "text"}
                  min={0}
                  className="w-full px-4 py-3 bg-camel text-sm rounded-sm focus:outline-none 
                 focus:ring-2 focus:ring-secondary"
                  value={answers[currentQuestions[0].id] || ""}
                  onChange={(e) => handleChange(currentQuestions[0].id, e.target.value)}
                  placeholder="Type your answer..."
                />
              )}
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
              <p className="text-base font-semibold text-primary mb-3">
                {currentQuestions[1].text}
              </p>

              {questionOptions[currentQuestions[1].id] ? (
                <select
                  className="w-full px-4 py-3 bg-camel text-sm rounded-sm focus:outline-none 
                 focus:ring-2 focus:ring-secondary appearance-none"
                  value={answers[currentQuestions[1].id] || ""}
                  onChange={(e) => handleChange(currentQuestions[1].id, e.target.value)}
                >
                  <option value="" disabled>
                    Select an option…
                  </option>
                  {questionOptions[currentQuestions[1].id].map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="hover:bg-secondary hover:text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={currentQuestions[1].id === "avg_distance" ? "number" : "text"}
                  min={0}
                  className="w-full px-4 py-3 bg-camel text-sm rounded-sm focus:outline-none 
                 focus:ring-2 focus:ring-secondary"
                  value={answers[currentQuestions[1].id] || ""}
                  onChange={(e) => handleChange(currentQuestions[1].id, e.target.value)}
                  placeholder="Type your answer..."
                />
              )}
            </div>
            {/* Progress indicator */}
            <div className="mt-6 pt-4 dark:border-gray-700">
              <div className="flex justify-between items-center text-xs ">
                <span>Progress: {categoryList.filter(cat => isTabCompleted(cat, answers)).length} of {categoryList.length} sections completed</span>

              </div>
              <div className="w-full bg-camel rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(categoryList.filter(cat => isTabCompleted(cat, answers)).length / categoryList.length) * 100}%`
                  }}
                ></div>
              </div>
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
                  {totalEmissions.toFixed(2)}
                </div>
                <div className="text-sm">tonnes CO₂e</div>
              </div>
              <div className="text-[10px]  italic mt-2">
                * CO₂e = carbon-dioxide equivalent
              </div>
              <p className="text-center mt-6">
                This is an approximate estimation, <br /> based on average emission factors.
              </p>
            </div>
            <button
              className="bg-secondary text-white px-6 py-2 rounded-sm text-sm font-medium w-full opacity-50 cursor-not-allowed"
              disabled
              style={{ cursor: 'not-allowed', userSelect: 'none' }}
            >
              Offset Carbon (Soon)
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CarbonCalculator;
