import { fetchLiveCryptoData } from "@/lib/crypto";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache de 1 minuto

export async function GET() {
  try {
    const data = await fetchLiveCryptoData();
    if (!data || data.length === 0) {
      throw new Error("No data received");
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Crypto API Route] Error:", error);
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}