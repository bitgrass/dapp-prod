import { Metadata } from "next";
import Nftdetails from "./Nftdetails";

// Define the valid tab IDs and their metadata
const tabData = [
  {
    id: "standard",
    title: "Bitgrass NFT Collection – Standard 100m² Plot",
    description: "Discover the Bitgrass Standard 100m² NFT, a tokenized land plot offering carbon credit rights and staking benefits.",
    image: "https://ik.imagekit.io/cafu/bitgrass/100m2Share.webp?updatedAt=1751037776589&ik-s=a2715b2b9d2a1d53e36830c47212d2fcc58f28bf",
  },
  {
    id: "premium",
    title: "Bitgrass NFT Collection – Premium 500m² Plot",
    description: "Explore the Bitgrass Premium 500m² NFT, a tokenized land plot with enhanced carbon credit potential and staking rewards.",
    image: "https://ik.imagekit.io/cafu/bitgrass/500m2Share.webp?updatedAt=1751037775707&ik-s=0a4a436924505de65a90c3c7f6075d0e132426da",
  },
  {
    id: "legendary",
    title: "Bitgrass NFT Collection – Legendary 1000m² Plot",
    description: "Own a Bitgrass Legendary 1000m² NFT, a premium tokenized land plot with high carbon credit potential and exclusive benefits.",
    image: "https://ik.imagekit.io/cafu/bitgrass/1000m2Share.webp?updatedAt=1751037779175&ik-s=aaa06f48d035369ec9782a489ea3b2c59fc7753e",
  },
];



interface Params {
  params: { id: string };
}

// Generate static parameters for the dynamic route
export async function generateStaticParams() {
  return tabData.map((tab) => ({
    id: tab.id,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tab = tabData.find((t) => t.id === params.id);
  if (!tab) {
    return {
      title: "Bitgrass NFT Collection",
      description: "Discover Bitgrass NFT Collections, tokenized land plots with carbon credit utilities.",
    };
  }

  const { title, description, image } = tab;
  const baseUrl = "https://optimise-bitgrass-dapp.pages.dev";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: `Bitgrass ${tab.id.charAt(0).toUpperCase() + tab.id.slice(1)} NFT`,
        },
      ],
      url: `${baseUrl}/${tab.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      site: "@YourTwitterHandle", // Replace with your actual Twitter handle
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": image,
      "fc:frame:title": title,
    },
  };
}

// Page component to render Nftdetails with the id
export default function Page({ params }: { params: { id: string } }) {
  return <Nftdetails initialTabId={params.id} />;
}