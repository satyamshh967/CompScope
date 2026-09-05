import { NextResponse } from "next/server";
import { getCompanyById } from "@/lib/services/company.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const result = await getCompanyById(id);

    if (!result) {
      return NextResponse.json(
        {
          error: "Company not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("GET /api/companies/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch company",
      },
      { status: 500 },
    );
  }
}