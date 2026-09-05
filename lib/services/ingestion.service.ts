import { prisma } from "../db";
import {
  normalizeCompanyName,
  normalizeRoleName,
  normalizeLevelName,
  normalizeLocation,
} from "../utils/normalization";
import { calculateTotalCompensation } from "../utils/compensation";
import type { CompensationInput } from "../validation/compensation.schema";

export async function ingestCompensation(
  input: CompensationInput,
) {
  const normalizedCompany = normalizeCompanyName(input.company);
  const normalizedRole = normalizeRoleName(input.role);
  const normalizedLevel = normalizeLevelName(input.level);

  const location = normalizeLocation(
    input.city,
    input.country,
  );

  // Find or create company
  const company =
    (await prisma.company.findUnique({
      where: {
        normalizedName: normalizedCompany,
      },
    })) ??
    (await prisma.company.create({
      data: {
        name: input.company.trim(),
        normalizedName: normalizedCompany,
      },
    }));

  // Find or create role
  const role =
    (await prisma.role.findUnique({
      where: {
        normalizedName: normalizedRole,
      },
    })) ??
    (await prisma.role.create({
      data: {
        name: input.role.trim(),
        normalizedName: normalizedRole,
      },
    }));

  // Find or create level
  let level = await prisma.level.findFirst({
    where: {
      OR: [
        {
          canonicalLevel: {
            equals: normalizedLevel,
            mode: "insensitive",
          },
        },
        {
          name: {
            equals: input.level.trim(),
            mode: "insensitive",
          },
        },
      ],
    },
  });

  if (!level) {
    level = await prisma.level.create({
      data: {
        name: input.level.trim(),
        canonicalLevel: input.level.trim(),
      },
    });
  }

  // Find or create location
  const existingLocation = await prisma.location.findUnique({
    where: {
      city_country: {
        city: location.city,
        country: location.country,
      },
    },
  });

  const locationRecord =
    existingLocation ??
    (await prisma.location.create({
      data: location,
    }));

  const stock = input.stock ?? 0;
  const bonus = input.bonus ?? 0;

  // Always calculate total on the server.
  const totalCompensation = calculateTotalCompensation(
    input.baseSalary,
    stock,
    bonus,
  );

  // Detect an existing identical compensation record.
  const duplicate = await prisma.compensation.findFirst({
    where: {
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: locationRecord.id,
      baseSalary: input.baseSalary,
      stock,
      bonus,
    },
  });

  if (duplicate) {
    return {
      created: false,
      duplicate: true,
      record: duplicate,
    };
  }

  const record = await prisma.compensation.create({
    data: {
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: locationRecord.id,

      baseSalary: input.baseSalary,
      stock,
      bonus,
      totalCompensation,

      currency: input.currency.toUpperCase(),

      yearsExperience: input.yearsExperience,

      source: input.source ?? "API Ingestion",
    },

    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
  });

  return {
    created: true,
    duplicate: false,
    record,
  };
}