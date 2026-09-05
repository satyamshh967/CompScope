import { NextRequest, NextResponse } from "next/server";
import { getCompensations } from "@/lib/services/compensation.service";

import { compensationSchema } from "@/lib/validation/compensation.schema";
import { ingestCompensation } from "@/lib/services/ingestion.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") ?? "1"),
      1,
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") ?? "20"),
        1,
      ),
      100,
    );

    const order =
      searchParams.get("order") === "asc"
        ? "asc"
        : "desc";

    const result = await getCompensations({
      company: searchParams.get("company") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      location:
        searchParams.get("location") ?? undefined,
      page,
      limit,
      sort:
        searchParams.get("sort") ??
        "totalCompensation",
      order,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/compensation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch compensation data",
      },
      { status: 500 },
    );
  }
} 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = compensationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid compensation data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await ingestCompensation(validation.data);

    if (result.duplicate) {
      return NextResponse.json(
        {
          message: "Duplicate compensation record",
          data: result.record,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Compensation record created",
        data: result.record,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/compensation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to ingest compensation data",
      },
      { status: 500 },
    );
  }
}