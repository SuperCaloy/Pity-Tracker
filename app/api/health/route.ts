// app/api/health/route.ts - Optional uptime check
export async function GET() {
  return Response.json({ status: 'ok' });
}