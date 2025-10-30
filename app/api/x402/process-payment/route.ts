// Next.js API Route: /api/x402/process-payment
// x402 protected endpoint for processing USDC payments

import { NextRequest } from 'next/server';
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { facilitator, settlePayment } from "thirdweb/x402";

export async function POST(request: NextRequest) {
  try {
    const paymentData = request.headers.get('x-payment');
    
    // Get request body
    const body = await request.json();
    const { to, amount = "10000" } = body;

    // Initialize thirdweb client
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    const serverWalletAddress = process.env.NEXT_PUBLIC_THIRDWEB_WALLET_ADDRESS || process.env.THIRDWEB_SERVER_WALLET_ADDRESS;

    if (!secretKey || !serverWalletAddress) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error: Missing thirdweb credentials'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const client = createThirdwebClient({
      secretKey,
    });

    // Create thirdweb x402 facilitator
    const thirdwebFacilitator = facilitator({
      client,
      serverWalletAddress,
      waitUntil: "submitted", // Wait until transaction is submitted
    });

    // Settle the payment using thirdweb x402
    const result = await settlePayment({
      resourceUrl: request.url,
      method: "POST",
      paymentData,
      payTo: serverWalletAddress,
      network: base,
      price: {
        amount: amount,
        asset: {
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
          decimals: 6,
        },
      },
      facilitator: thirdwebFacilitator,
      routeConfig: {
        description: "Buy USDC on Base Mainnet",
        mimeType: "application/json",
        maxTimeoutSeconds: 30,
      },
    });

    if (result.status === 200) {
      // Payment verified and settled successfully
      return new Response(JSON.stringify({
        success: true,
        data: {
          txHash: result.responseBody?.transactionHash || 'pending',
          amount,
          recipient: to,
          timestamp: Date.now()
        }
      }), {
        status: 200,
        headers: {
          ...result.responseHeaders,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // Payment required (402) or other error
      return new Response(JSON.stringify(result.responseBody), {
        status: result.status,
        headers: {
          ...result.responseHeaders,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Internal server error',
      details: error?.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
