import { prisma } from "../db";

export async function getCompensations(params: {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}) {
  const {
    company,
    role,
    level,
    location,
    page,
    limit,
    sort,
    order,
  } = params;

  const where = {
    ...(company
      ? {
          company: {
            name: {
              contains: company,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),

    ...(role
      ? {
          role: {
            name: {
              contains: role,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),

    ...(level
      ? {
          level: {
            OR: [
              {
                name: {
                  contains: level,
                  mode: "insensitive" as const,
                },
              },
              {
                canonicalLevel: {
                  equals: level,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        }
      : {}),

    ...(location
      ? {
          location: {
            city: {
              contains: location,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),
  };

  const allowedSortFields = [
    "totalCompensation",
    "baseSalary",
    "bonus",
    "stock",
    "createdAt",
  ] as const;

  const sortField = allowedSortFields.includes(
    sort as (typeof allowedSortFields)[number],
  )
    ? sort
    : "totalCompensation";

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.compensation.findMany({
      where,
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
      orderBy: {
        [sortField]: order,
      },
      skip,
      take: limit,
    }),

    prisma.compensation.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}