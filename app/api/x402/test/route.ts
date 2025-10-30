// Next.js API Route: /api/x402/test
// Simple test endpoint

export async function GET() {
  return Response.json({
    success: true,
    message: 'X402 API is working!',
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
}
