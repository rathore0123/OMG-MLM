// Operator IDs used inside the app → DooPay operator service codes
// Verify these against your DooPay dashboard before going live
export const OPERATOR_CODES: Record<string, string> = {
  jio:    "JIO",
  airtel: "AIR",
  vi:     "VI",
  bsnl:   "BSL",
  mtnl:   "MTL",
};

// Circle names (must match CIRCLES array in MobileRecharge.tsx) → DooPay circle IDs
export const CIRCLE_IDS: Record<string, number> = {
  "Andhra Pradesh":       1,
  "Assam":                2,
  "Bihar & Jharkhand":    3,
  "Chennai":              4,
  "Delhi & NCR":          5,
  "Gujarat":              6,
  "Haryana":              7,
  "Himachal Pradesh":     8,
  "Jammu & Kashmir":      9,
  "Karnataka":            10,
  "Kerala":               11,
  "Kolkata":              12,
  "Madhya Pradesh":       13,
  "Maharashtra & Goa":    14,
  "Mumbai":               15,
  "North East":           16,
  "Odisha":               17,
  "Punjab":               18,
  "Rajasthan":            19,
  "Tamil Nadu":           20,
  "Uttar Pradesh East":   21,
  "Uttar Pradesh West":   22,
  "West Bengal":          23,
};
