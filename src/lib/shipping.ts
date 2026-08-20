export type ShippingAddress = {
  country: string;
  region: string;
  city: string;
  postalCode: string;
  street: string;
};

export const EMPTY_ADDRESS: ShippingAddress = {
  country: "Philippines",
  region: "",
  city: "",
  postalCode: "",
  street: "",
};

export const COUNTRIES = [
  "Philippines",
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Singapore",
  "Malaysia",
  "Japan",
  "United Arab Emirates",
  "Other",
];

export const PH_REGIONS = [
  "National Capital Region (NCR)",
  "Ilocos Region (Region I)",
  "Cagayan Valley (Region II)",
  "Central Luzon (Region III)",
  "CALABARZON (Region IV-A)",
  "MIMAROPA (Region IV-B)",
  "Bicol Region (Region V)",
  "Western Visayas (Region VI)",
  "Central Visayas (Region VII)",
  "Eastern Visayas (Region VIII)",
  "Zamboanga Peninsula (Region IX)",
  "Northern Mindanao (Region X)",
  "Davao Region (Region XI)",
  "SOCCSKSARGEN (Region XII)",
  "Caraga (Region XIII)",
  "Bangsamoro Autonomous Region (BARMM)",
  "Cordillera Administrative Region (CAR)",
];

export const PH_CITIES = [
  "Quezon City",
  "Manila",
  "Caloocan",
  "Davao City",
  "Cebu City",
  "Zamboanga City",
  "Taguig",
  "Antipolo",
  "Pasig",
  "Cagayan de Oro",
  "Parañaque",
  "Valenzuela",
  "Bacoor",
  "General Santos",
  "Las Piñas",
  "Makati",
  "Bacolod",
  "Muntinlupa",
  "San Jose del Monte",
  "Iloilo City",
  "Mandaluyong",
  "Marikina",
  "Baguio",
  "Angeles City",
  "Butuan",
  "Lapu-Lapu City",
  "Batangas City",
  "Cabanatuan",
  "Dasmariñas",
  "Imus",
  "San Fernando",
  "Lucena",
  "Tarlac City",
  "Olongapo",
  "Naga",
  "Iligan",
  "Malabon",
  "Navotas",
  "San Juan",
  "Pasay",
  "Mandaue",
];

export function isAddressComplete(address: ShippingAddress) {
  return Boolean(
    address.country.trim() && address.city.trim() && address.street.trim()
  );
}

export function formatAddress(address: ShippingAddress) {
  return [address.street, address.city, address.region, address.postalCode, address.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
