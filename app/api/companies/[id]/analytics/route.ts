import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function percentile(values: number[], percentileValue: number) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const index = (sorted.length - 1) * percentileValue;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) * weight
  );
}

function median(values: number[]) {
  return percentile(values, 0.5);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        compensations: {
          include: {
            role: true,
            level: true,
            location: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 },
      );
    }

    const records = company.compensations;

    if (records.length === 0) {
      return NextResponse.json({
        company: {
          id: company.id,
          name: company.name,
        },
        summary: {
          records: 0,
          roles: 0,
          levels: 0,
          locations: 0,
          averageBase: 0,
          averageStock: 0,
          averageBonus: 0,
          averageTotal: 0,
          medianTotal: 0,
          percentile25: 0,
          percentile75: 0,
          lowestTotal: 0,
          highestTotal: 0,
        },
        byLevel: [],
        byRole: [],
        byLocation: [],
      });
    }

    const levelMap = new Map<
      string,
      {
        level: string;
        seniority: number;
        records: number;
        base: number[];
        stock: number[];
        bonus: number[];
        total: number[];
      }
    >();

    const roleMap = new Map<
      string,
      {
        role: string;
        records: number;
        total: number[];
      }
    >();

    const locationMap = new Map<
      string,
      {
        location: string;
        records: number;
        total: number[];
      }
    >();

    for (const record of records) {
      const base = Number(record.baseSalary);
      const stock = Number(record.stock);
      const bonus = Number(record.bonus);
      const total = Number(record.totalCompensation);

      const levelKey = record.level.canonicalLevel;

      if (!levelMap.has(levelKey)) {
        levelMap.set(levelKey, {
          level: levelKey,
          seniority: record.level.seniority ?? 0,
          records: 0,
          base: [],
          stock: [],
          bonus: [],
          total: [],
        });
      }

      const level = levelMap.get(levelKey)!;

      level.records += 1;
      level.base.push(base);
      level.stock.push(stock);
      level.bonus.push(bonus);
      level.total.push(total);

      const roleKey = record.role.name;

      if (!roleMap.has(roleKey)) {
        roleMap.set(roleKey, {
          role: roleKey,
          records: 0,
          total: [],
        });
      }

      const role = roleMap.get(roleKey)!;

      role.records += 1;
      role.total.push(total);

      const locationKey = record.location.city;

      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          location: locationKey,
          records: 0,
          total: [],
        });
      }

      const location = locationMap.get(locationKey)!;

      location.records += 1;
      location.total.push(total);
    }

    const allBase = records.map((record) =>
      Number(record.baseSalary),
    );

    const allStock = records.map((record) =>
      Number(record.stock),
    );

    const allBonus = records.map((record) =>
      Number(record.bonus),
    );

    const allTotal = records.map((record) =>
      Number(record.totalCompensation),
    );

    const byLevel = [...levelMap.values()]
      .sort((a, b) => {
        if (a.seniority !== b.seniority) {
          return a.seniority - b.seniority;
        }

        return a.level.localeCompare(b.level);
      })
      .map((item) => ({
        level: item.level,
        records: item.records,
        averageBase: average(item.base),
        averageStock: average(item.stock),
        averageBonus: average(item.bonus),
        averageTotal: average(item.total),
        medianTotal: median(item.total),
        percentile25: percentile(item.total, 0.25),
        percentile75: percentile(item.total, 0.75),
      }));

    const byRole = [...roleMap.values()]
      .map((item) => ({
        role: item.role,
        records: item.records,
        averageTotal: average(item.total),
        medianTotal: median(item.total),
      }))
      .sort((a, b) => b.averageTotal - a.averageTotal);

    const byLocation = [...locationMap.values()]
      .map((item) => ({
        location: item.location,
        records: item.records,
        averageTotal: average(item.total),
        medianTotal: median(item.total),
      }))
      .sort((a, b) => b.averageTotal - a.averageTotal);

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
      },

      summary: {
        records: records.length,
        roles: roleMap.size,
        levels: levelMap.size,
        locations: locationMap.size,

        averageBase: average(allBase),
        averageStock: average(allStock),
        averageBonus: average(allBonus),
        averageTotal: average(allTotal),

        medianTotal: median(allTotal),
        percentile25: percentile(allTotal, 0.25),
        percentile75: percentile(allTotal, 0.75),

        lowestTotal: Math.min(...allTotal),
        highestTotal: Math.max(...allTotal),
      },

      byLevel,
      byRole,
      byLocation,
    });
  } catch (error) {
    console.error("Company analytics error:", error);

    return NextResponse.json(
      { error: "Failed to calculate company analytics" },
      { status: 500 },
    );
  }
}