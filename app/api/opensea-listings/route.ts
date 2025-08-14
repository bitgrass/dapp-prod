export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const cursor = searchParams.get('cursor') || searchParams.get('next');
  const apiKey = request.headers.get('api-key');

  if (!collection) {
    return new Response(JSON.stringify({ error: 'Missing collection parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenSea API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openseaUrl = new URL(`https://api.opensea.io/api/v2/listings/collection/${collection}/all`);
  openseaUrl.searchParams.set('limit', '10');
  if (cursor) openseaUrl.searchParams.set('next', cursor);

  try {
    const res = await fetch(openseaUrl.toString(), {
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
        'user-agent': 'Bitgrass/1.0 (+support@bitgrass.example)', // helps some edges
      },
    });

    const body = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: 'Upstream error',
          status: res.status,
          url: openseaUrl.toString(),
          body: body.length > 2000 ? body.slice(0, 2000) + '…[truncated]' : body,
        }),
        {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, api-key',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, api-key',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Edge fetch failed',
        message: String(err),
        stack: err?.stack ?? null,
        url: openseaUrl.toString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, api-key',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
