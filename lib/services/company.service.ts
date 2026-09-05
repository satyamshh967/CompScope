import { prisma } from "../db";

export async function getCompanies() {
  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const results = await Promise.all(
    companies.map(async (company) => {
      const stats = await prisma.compensation.aggregate({
        where: {
          companyId: company.id,
        },
        _count: {
          _all: true,
        },
        _avg: {
          baseSalary: true,
          bonus: true,
          stock: true,
          totalCompensation: true,
        },
        _max: {
          totalCompensation: true,
        },
      });

      return {
        id: company.id,
        name: company.name,
        recordCount: stats._count._all,
        averageBaseSalary: stats._avg.baseSalary,
        averageBonus: stats._avg.bonus,
        averageStock: stats._avg.stock,
        averageTotalCompensation: stats._avg.totalCompensation,
        highestTotalCompensation: stats._max.totalCompensation,
      };
    }),
  );

  return results;
}

export async function getCompanyById(id: string) {
  const company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!company) {
    return null;
  }

  const records = await prisma.compensation.findMany({
    where: {
      companyId: id,
    },
    include: {
      role: true,
      level: true,
      location: true,
    },
    orderBy: {
      totalCompensation: "desc",
    },
  });

  const stats = await prisma.compensation.aggregate({
    where: {
      companyId: id,
    },
    _count: {
      _all: true,
    },
    _avg: {
      baseSalary: true,
      bonus: true,
      stock: true,
      totalCompensation: true,
    },
    _min: {
      totalCompensation: true,
    },
    _max: {
      totalCompensation: true,
    },
  });

  return {
    company,
    stats,
    records,
  };
}