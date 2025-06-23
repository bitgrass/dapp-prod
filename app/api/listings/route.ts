import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const startParam = req.nextUrl.searchParams.get("start");
    const endParam = req.nextUrl.searchParams.get("end");

    const start = parseInt(startParam || "1", 10);
    const end = parseInt(endParam || "50", 10);

    const contractAddress = process.env.NEXT_PUBLIC_OPENSEA_CONTRACT_ADDRESS!;
    const apiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY!;

    if (!contractAddress || !apiKey) {
      return NextResponse.json({ error: "Missing env config" }, { status: 500 });
    }

    if (isNaN(start) || isNaN(end) || end < start || end - start + 1 > 50) {
      return NextResponse.json({ error: "Invalid or too large range (max 50)" }, { status: 400 });
    }

    const url = new URL("https://api.opensea.io/api/v2/orders/base/seaport/listings");
    url.searchParams.set("asset_contract_address", contractAddress);
    url.searchParams.set("limit", "50");
    url.searchParams.set("order_by", "created_date"); // Sort by creation date
    url.searchParams.set("order_direction", "desc"); // Newest first
        url.searchParams.set("maker", "0x9264d7e42629957b02ec3c1493091dbdc1bfdd6c");


    for (let i = start; i <= end; i++) {
      url.searchParams.append("token_ids", i.toString());
    }
    console.log("Requesting OpenSea URL:", url.toString()); // 🐞 DEBUG URL

    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
      next: { revalidate: 1 }, // Cache revalidation (Next.js-specific, adjust as needed)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenSea fetch failed:", res.status, errText);
      return NextResponse.json({ error: "OpenSea API failed" }, { status: res.status });
    }

    const data = await res.json();
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    // Filter active listings
    const activeOrders = (data.orders || []).filter((order: any) => {
      const isActive = !order.cancelled && !order.fulfilled && order.expiration_time > now;
      return isActive;
    });

    return NextResponse.json({ orders: activeOrders });
  } catch (err) {
    console.error("Unexpected error in /api/listings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}