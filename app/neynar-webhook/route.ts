export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook received:", body);

    // Extract FID of the user who added the MiniApp
    const fid = body?.fid || body?.data?.fid || body?.event?.data?.user?.fid;
    if (!fid) {
      return NextResponse.json({ error: "No FID in webhook payload" }, { status: 400 });
    }

    // Prepare the welcome notification
    const notification = {
      title: "👋 Welcome!",
      body: "Thanks for adding our Mini App 🎉",
      target_url: `https://main.test-dapp-6kb.pages.dev/dashboard?tab=overview`, // must be inside your Mini App domain
    };

    // Call Neynar API directly with fetch (Edge-friendly)
    const res = await fetch("https://api.neynar.com/v2/farcaster/frame/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEXT_PUBLIC_NEYNAR_API_KEY!,
      },
      body: JSON.stringify({
        targetFids: [fid],
        filters: {},
        notification,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Neynar API error:", errorText);
      return NextResponse.json({ error: "Failed to send notification", details: errorText }, { status: res.status });
    }

    const result = await res.json();
    console.log("✅ Notification sent:", result);

    return NextResponse.json({ ok: true, res: result });
  } catch (err) {
    console.error("❌ Error in webhook handler:", err);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
