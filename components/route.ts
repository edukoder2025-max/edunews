import { fetchLiveCryptoData } from "@/lib/crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 30; // Actualización más frecuente para el "Live"

export async function GET() {
  try {
    const data = await fetchLiveCryptoData();
    if (!data || data.length === 0) throw new Error("No data received");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Crypto API Route Error]:", error);
    return NextResponse.json([], { status: 200 });
  }
}