import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        {
          error: "Missing ids parameter",
        },
        { status: 400 }
      );
    }

    const ids = [
      ...new Set(
        idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ].slice(0, 3);

    if (ids.length === 0) {
      return NextResponse.json(
        {
          error: "At least one valid compensation ID is required",
        },
        { status: 400 }
      );
    }

    const records = await prisma.compensation.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
    });

    const orderedRecords = ids
      .map((id) => records.find((record: (typeof records)[number]) => record.id === id))
      .filter(
        (
          record
        ): record is (typeof records)[number] => record !== undefined
      );

    return NextResponse.json({
      data: orderedRecords,
    });
  } catch (error) {
    console.error("Compare API error:", error);

    return NextResponse.json(
      {
        error: "Failed to compare compensation records",
      },
      { status: 500 }
    );
  }
}