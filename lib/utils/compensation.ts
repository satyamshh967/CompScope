export function calculateTotalCompensation(
  baseSalary: number,
  stock = 0,
  bonus = 0,
): number {
  return baseSalary + stock + bonus;
}