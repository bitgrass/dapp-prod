"use client";
import React, { useState } from "react";
import classNames from "classnames";

const categories = {
    flights: [
        { id: "num_flights", text: "How many flights did you take this year?" },
        { id: "avg_distance", text: "Average flight distance in km?" },
    ],
    transport: [
        { id: "vehicle_type", text: "Vehicle type you use?" },
        { id: "weekly_km", text: "Kilometers you drive per week?" },
    ],
    office: [
        { id: "office_size", text: "Office size in m²?" },
        { id: "monthly_energy", text: "Monthly energy usage (kWh)?" },
    ],
};

const categoryList = Object.keys(categories) as (keyof typeof categories)[];

const CarbonCalculator = () => {
    const [activeCategory, setActiveCategory] = useState<keyof typeof categories>("flights");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [emissions, setEmissions] = useState(0);

    const handleChange = (id: string, value: string) => {
        const updated = { ...answers, [id]: value };
        setAnswers(updated);

        // Example dummy logic (replace with actual logic per category)
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* ---------------- LEFT: Tabs + Questions ---------------- */}
                <div className="box rounded-sm shadow-md p-6 md:col-span-2 flex flex-col h-full">
                    {/* Category Tabs */}
                    <nav className="nav nav-pills nav-style-3 flex gap-3 mb-6" aria-label="Tabs">
                        {categoryList.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                className={classNames(
                                    "nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary",
                                    activeCategory === cat && "active bg-primary text-white"
                                )}
                            // removed: data-hs-tab, role="tab", etc.
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </nav>

                    {/* Question 1 */}
                    <div className="transition-all duration-300 mb-6">
                        <p className="text-lg font-bold text-primary mb-3">{currentQuestions[0].text}</p>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-camel  rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            value={answers[currentQuestions[0].id] || ""}
                            onChange={(e) => handleChange(currentQuestions[0].id, e.target.value)}
                            placeholder="Type your answer..."
                        />
                    </div>

                    {/* Question 2 */}
                    <div
                        className={classNames(
                            "transition-all duration-500 transform",
                            showSecond ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                        )}
                    >
                        <p className="text-lg font-bold text-primary mb-3">{currentQuestions[1].text}</p>
                        <input
                            type="text"
                            className="w-full px-4 py-3  bg-camel text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            value={answers[currentQuestions[1].id] || ""}
                            onChange={(e) => handleChange(currentQuestions[1].id, e.target.value)}
                            placeholder="Type your answer..."
                        />
                    </div>
                </div>

                {/* ---------------- RIGHT: Emissions ---------------- */}
                <div className="box rounded-sm shadow-md p-6 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-primary mb-2">Estimated emissions</h2>
                        <div className="text-xs text-gray-600 mt-1">
                            Learn about how we estimate your emissions
                        </div>
                        {/* Number + Unit on same line */}
                        <div className="flex items-end gap-2 bg-camel rounded-sm px-4 py-4 mt-8">
                            <div className="text-5xl font-bold text-primary">{emissions.toFixed(2)}</div>
                            <div className="text-sm text-gray-600 pb-1">tonnes CO₂e</div>
                        </div>

                        {/* Info text */}

                        <div className="text-[10px] text-gray-500 italic mt-1">* CO₂e = carbon-dioxide equivalent</div>
                    </div>

                    {/* CTA Button */}
                    <button
                        className="bg-secondary text-white px-6 py-2 rounded-sm text-sm font-medium w-full mt-4"
                        onClick={() => alert("Claim $BTG or mint NFT")}
                    >
                        Buy NFT/ Buy Credit
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CarbonCalculator;
