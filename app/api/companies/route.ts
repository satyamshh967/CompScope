import { NextResponse } from "next/server";
import { getCompanies } from "@/lib/services/company.service";

export async function GET() {
  try {
    const companies = await getCompanies();

    return NextResponse.json({
      data: companies,
    });
  } catch (error) {
    console.error("GET /api/companies failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch companies",
      },
      { status: 500 },
    );
  }
}