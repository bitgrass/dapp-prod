
function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      screenshotUrls: [
        "https://ik.imagekit.io/cafu/bitgrass/100m2Share.webp?updatedAt=1751037776589&ik-s=a2715b2b9d2a1d53e36830c47212d2fcc58f28bf",
        "https://ik.imagekit.io/cafu/bitgrass/500m2Share.webp?updatedAt=1751037775707&ik-s=0a4a436924505de65a90c3c7f6075d0e132426da",
        "https://ik.imagekit.io/cafu/bitgrass/1000m2Share.webp?updatedAt=1751037779175&ik-s=aaa06f48d035369ec9782a489ea3b2c59fc7753e"],
      iconUrl: "https://beta.bitgrass.com/profile-pic.png",
      splashImageUrl: "https://beta.bitgrass.com/splashLogo.png",
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: "https://api.neynar.com/f/app/32b4dae1-c174-43b4-a30d-cf6aceaf3f10/event",
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      imageUrl:"https://beta.bitgrass.com/BitgrassFarcaster.png",
      castShareUrl:"https://beta.bitgrass.com",
            buttonTitle:"Start Carbon Investment ",

      tags: [
        "rewards",
        "leaderboard",
        "warpcast",
        "earn"
      ],
      heroImageUrl: "https://beta.bitgrass.com/profile-pic.png",
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: "https://beta.bitgrass.com/BitgrassFarcaster.png",

    }),
    baseBuilder: {
      allowedAddresses: ["0x7c3cd19af38436d079D866b6F2F6d169f244Fb7A"],
    },
  });
}