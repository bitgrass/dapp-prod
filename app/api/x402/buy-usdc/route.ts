// Next.js API Route: /api/x402/buy-usdc
// x402-compliant endpoint for USDC purchase discovery

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const PAYMENT_RECIPIENT = process.env.NEXT_PUBLIC_THIRDWEB_WALLET_ADDRESS || '0x3eE47aFDF18FB5BFF562232e8CddF49BBb961Ef0';
    
    // Check if payment header is present
    const paymentHeader = request.headers.get('x-payment');
    
    const x402Response = {
      x402Version: 1,
      accepts: [
        {
          scheme: "exact",
          network: "base",
          maxAmountRequired: "10000", // 0.01 USDC (6 decimals)
          resource: `${baseUrl}/api/x402/buy-usdc`,
          description: "Buy USDC on Base Mainnet. Payment of 0.01 USDC required. Returns transaction details.",
          mimeType: "application/json",
          payTo: PAYMENT_RECIPIENT,
          maxTimeoutSeconds: 30,
          asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC token on Base
          outputSchema: {
            input: {
              type: "http",
              method: "POST",
              bodyType: "json",
              bodyFields: {
                to: {
                  type: "string",
                  required: true,
                  description: "Ethereum address that will receive the USDC"
                },
                amount: {
                  type: "string",
                  required: false,
                  description: "Amount of USDC to buy (defaults to 0.01 USDC)"
                }
              }
            },
            output: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  description: "Whether the purchase was successful"
                },
                data: {
                  type: "object",
                  properties: {
                    txHash: {
                      type: "string",
                      description: "Transaction hash"
                    },
                    amount: {
                      type: "string",
                      description: "Amount of USDC purchased"
                    },
                    recipient: {
                      type: "string",
                      description: "Recipient address"
                    }
                  }
                }
              }
            }
          },
          extra: {
            chain: "Base Mainnet",
            chainId: 8453,
            validityDuration: "24 hours"
          }
        }
      ]
    };
    
    // If no payment, return 402 with payment requirements
    if (!paymentHeader) {
      return new Response(JSON.stringify(x402Response), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // If payment is present, redirect to POST handler
    return new Response(JSON.stringify({
      success: false,
      error: 'Please use POST method with payment to buy USDC'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      x402Version: 1,
      error: error?.message || 'Internal server error',
      stack: error?.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
