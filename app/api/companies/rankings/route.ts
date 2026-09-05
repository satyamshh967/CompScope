import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const records = await prisma.compensation.findMany({
      include: {
        company: true,
        level: true,
      },
    });

    const companies = new Map<
      string,
      {
        id: string;
        name: string;
        totals: number[];
        records: number;
        highestLevel: {
          name: string;
          seniority: number;
        } | null;
      }
    >();

    for (const record of records) {
      const total = Number(record.totalCompensation);

      if (!companies.has(record.company.id)) {
        companies.set(record.company.id, {
          id: record.company.id,
          name: record.company.name,
          totals: [],
          records: 0,
          highestLevel: null,
        });
      }

      const company = companies.get(record.company.id)!;

      company.records += 1;
      company.totals.push(total);

      const currentLevel = {
        name: record.level.canonicalLevel,
        seniority: record.level.seniority ?? 0,
      };

      if (
        !company.highestLevel ||
        currentLevel.seniority >
          company.highestLevel.seniority
      ) {
        company.highestLevel = currentLevel;
      }
    }

    const rankings = [...companies.values()]
      .map((company) => ({
        id: company.id,
        name: company.name,
        records: company.records,
        averageTotal:
          company.totals.reduce(
            (sum, value) => sum + value,
            0,
          ) / company.totals.length,
        highestLevel: company.highestLevel?.name ?? "—",
      }))
      .sort((a, b) => b.averageTotal - a.averageTotal)
      .map((company, index) => ({
        rank: index + 1,
        ...company,
      }));

    return NextResponse.json({
      data: rankings,
    });
  } catch (error) {
    console.error("Company rankings error:", error);

    return NextResponse.json(
      { error: "Failed to load company rankings" },
      { status: 500 },
    );
  }
}