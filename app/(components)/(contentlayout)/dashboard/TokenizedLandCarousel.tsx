import React, { useState, useRef, useEffect } from "react";

const IMAGES = [
    { src: "/assets/images/apps/100m2.webp", alt: "100m² Plot" },
    { src: "/assets/images/apps/500m2.webp", alt: "500m² Plot" },
    { src: "/assets/images/apps/1000m2.webp", alt: "1000m² Plot" },
];

const AUTOSLIDE_INTERVAL = 5200; // ms
const size = 320; // px

export default function TokenizedLandCube() {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goTo = (i: number) => {
        if (i === index) return;
        setIndex(i);
    };

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % IMAGES.length);
        }, AUTOSLIDE_INTERVAL);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [index]);


    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[360px] mt-4">
            {/* Cube container */}
            <div
                style={{
                    margin: "0 auto",
                    position: "relative",
                    background: "#f5f5f5",
                    borderRadius: 24,
                    height: size, 
                }}
            >
                {/* The cube */}
                <div
                    style={{
                        width: size,
                        height: size,
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform 1.3s cubic-bezier(.19,1,.22,1)",
                        transform: `rotateY(${-index * 90}deg)`,
                    }}
                >
                    {/* Face 0 */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            background: "#fafafa",
                            transform: `rotateY(0deg) translateZ(${size / 2}px)`,
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 6px 24px 0 #2222",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img src={IMAGES[0].src} alt={IMAGES[0].alt}
                            className="w-full h-full object-fit rounded-sm block"
                        />
                    </div>
                    {/* Face 1 */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            background: "#fafafa",
                            transform: `rotateY(90deg) translateZ(${size / 2}px)`,
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 6px 24px 0 #2222",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img src={IMAGES[1].src} alt={IMAGES[1].alt}
                            className="w-full h-full object-fit rounded-sm block"
                        />
                    </div>
                    {/* Face 2 */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            background: "#fafafa",
                            transform: `rotateY(180deg) translateZ(${size / 2}px)`,
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 6px 24px 0 #2222",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img src={IMAGES[2].src} alt={IMAGES[2].alt}
                            className="w-full h-full object-fit rounded-sm block"
                        />
                    </div>
                </div>
            </div>
            {/* Dots */}
            <div className="flex gap-6 mt-6 min-h-6 justify-center w-full">
                {IMAGES.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        aria-label={`Show slide ${idx + 1}`}
                        tabIndex={0}
                        className={`
              w-3.5 h-3.5 rounded-full border-none outline-none ring-0
              transition-all duration-200
              ${idx === index
                                ? "bg-secondary shadow-[0_0_0_4px_rgba(132,193,60,0.12)]"
                                : "bg-camel10"}
            `}
                        style={{
                            border: idx === index ? "3px solid #cbeec0" : "3px solid transparent",
                            cursor: idx === index ? "default" : "pointer",
                        }}
                    />
                ))}
            </div>

        </div>
    );
}
