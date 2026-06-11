import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const assetId = req.nextUrl.searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { message: "assetId wajib diisi" },
        { status: 400 }
      );
    }

    const thumbnailUrl =
      `https://thumbnails.roblox.com/v1/assets` +
      `?assetIds=${encodeURIComponent(assetId)}` +
      `&size=420x420` +
      `&format=Png` +
      `&isCircular=false`;

    const thumbnailRes = await fetch(thumbnailUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const thumbnailJson = await thumbnailRes.json();

    if (!thumbnailRes.ok) {
      return NextResponse.json(
        {
          message:
            thumbnailJson?.errors?.[0]?.message ||
            "Gagal mengambil thumbnail Roblox",
        },
        { status: thumbnailRes.status }
      );
    }

    const imageUrl = thumbnailJson?.data?.[0]?.imageUrl;

    if (!imageUrl) {
      return NextResponse.redirect(
        new URL("/images/char1.png", req.nextUrl.origin)
      );
    }

    return NextResponse.redirect(imageUrl);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Gagal mengambil gambar Roblox",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
