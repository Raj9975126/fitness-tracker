// 'FULL_BODY' -> 'Full Body'
export function formatEnum(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const KG_PER_LB = 0.45359237;

export const kgToLbs = (kg) => kg / KG_PER_LB;
export const lbsToKg = (lbs) => lbs * KG_PER_LB;
