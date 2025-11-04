
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
      description:"Carbon Credit and RWA",
      screenshotUrls: [],
      iconUrl: "https://app.bitgrass.com/icon.png",
      splashImageUrl: "https://app.bitgrass.com/splash.png",
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: "https://api.neynar.com/f/app/32b4dae1-c174-43b4-a30d-cf6aceaf3f10/event",
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      imageUrl:"https://app.bitgrass.com/image.png",
      castShareUrl:"https://app.bitgrass.com",
      buttonTitle:"Carbon Credit and RWA",

      tags: [
        "rewards",
        "leaderboard",
        "warpcast",
        "earn"
      ],
      heroImageUrl: "https://app.bitgrass.com/icon.png",
      tagline:"Carbon Credit and RWA",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: "Carbon Credit and RWA",
      ogImageUrl: "https://app.bitgrass.com/image.png",

    }),
    baseBuilder: {
      ownerAddress: ["0x7c3cd19af38436d079D866b6F2F6d169f244Fb7A"],
    },
      noIndex: "false",

  });
}