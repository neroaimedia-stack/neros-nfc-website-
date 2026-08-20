export type ShippingAddress = {
  country: string;
  /** PH: one of PH_MACRO_REGIONS. Other countries: free-text state/province. */
  region: string;
  /** PH only. */
  province: string;
  city: string;
  /** PH only. */
  barangay: string;
  houseNo: string;
  street: string;
  postalCode: string;
};

export const EMPTY_ADDRESS: ShippingAddress = {
  country: "Philippines",
  region: "",
  province: "",
  city: "",
  barangay: "",
  houseNo: "",
  street: "",
  postalCode: "",
};

// Simplified island-group groupings (not the 17 official PSGC regions) —
// this is what the business wants shown to shoppers.
export const PH_MACRO_REGIONS = [
  "Metro Manila",
  "North Luzon",
  "South Luzon",
  "Visayas",
  "Mindanao",
];

// Standard PH provinces, grouped under the simplified macro-regions above.
// Metro Manila has no provinces (its cities sit directly under NCR).
export const PH_PROVINCES_BY_REGION: Record<string, string[]> = {
  "Metro Manila": [],
  "North Luzon": [
    "Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province",
    "Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan",
    "Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino",
    "Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales",
  ],
  "South Luzon": [
    "Batangas", "Cavite", "Laguna", "Quezon", "Rizal",
    "Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon",
    "Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon",
  ],
  Visayas: [
    "Aklan", "Antique", "Capiz", "Guimaras", "Iloilo", "Negros Occidental",
    "Bohol", "Cebu", "Negros Oriental", "Siquijor",
    "Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte",
  ],
  Mindanao: [
    "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
    "Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental",
    "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental",
    "Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat",
    "Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur",
    "Basilan", "Lanao del Sur", "Maguindanao del Norte", "Maguindanao del Sur", "Sulu", "Tawi-Tawi",
  ],
};

// Suggestions only (city stays a free-text field) — major cities so typing
// gets a helpful autocomplete without pretending this list is exhaustive.
export const PH_CITIES = [
  "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong",
  "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig", "San Juan",
  "Taguig", "Valenzuela", "Pateros",
  "Davao City", "Cebu City", "Zamboanga City", "Antipolo", "Cagayan de Oro",
  "Bacoor", "General Santos", "Bacolod", "San Jose del Monte", "Iloilo City",
  "Baguio", "Angeles City", "Butuan", "Lapu-Lapu City", "Batangas City",
  "Cabanatuan", "Dasmariñas", "Imus", "San Fernando", "Lucena", "Tarlac City",
  "Olongapo", "Naga", "Iligan", "Mandaue", "Tacloban", "Puerto Princesa",
  "General Trias", "Santa Rosa", "Biñan", "Calamba", "Lipa",
];

// Standard checkout is Philippines-only (international is bulk/email-only —
// see the notice in the cart page), so completeness is always judged against
// the PH hierarchy.
export function isAddressComplete(address: ShippingAddress) {
  if (!address.city.trim() || !address.street.trim() || !address.region.trim()) return false;
  if (address.region !== "Metro Manila" && !address.province.trim()) return false;
  return true;
}

export function formatAddress(address: ShippingAddress) {
  const line1 = [address.houseNo, address.street].map((p) => p.trim()).filter(Boolean).join(" ");
  const parts = [
    line1,
    address.barangay,
    address.city,
    address.province,
    address.postalCode,
    address.region,
    address.country,
  ];
  return parts.map((p) => p.trim()).filter(Boolean).join(", ");
}
