import { getApiDocs } from "@/lib/swagger";
import type { NextRequest, NextFetchEvent } from "next/server";

export async function GET(req: NextRequest, ev: NextFetchEvent) {
  try {
    const spec = await getApiDocs();
    return new Response(JSON.stringify(spec), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load the API specification." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
