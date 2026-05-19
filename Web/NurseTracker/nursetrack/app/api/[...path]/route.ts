const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080/api";

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_API_URL}/${path.join("/")}${url.search}`;
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  };

  let response: Response;
  try {
    response = await fetch(targetUrl, init);
  } catch {
    return Response.json(
      { message: `Unable to reach backend API at ${BACKEND_API_URL}. Check BACKEND_API_URL and make sure the backend is running.` },
      { status: 502 }
    );
  }
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
