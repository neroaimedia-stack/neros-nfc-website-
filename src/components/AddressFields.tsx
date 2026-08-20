"use client";

import {
  COUNTRIES,
  PH_CITIES,
  PH_MACRO_REGIONS,
  PH_PROVINCES_BY_REGION,
  type ShippingAddress,
} from "@/lib/shipping";

const inputClass =
  "w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black appearance-none bg-white";

export default function AddressFields({
  value,
  onChange,
  idPrefix,
}: {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  idPrefix: string;
}) {
  const isPH = value.country === "Philippines";
  const provinceOptions = isPH ? (PH_PROVINCES_BY_REGION[value.region] ?? []) : [];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select
        value={value.country}
        onChange={(e) =>
          onChange({ ...value, country: e.target.value, region: "", province: "", barangay: "" })
        }
        autoComplete="country-name"
        className={`${inputClass} sm:col-span-2`}
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {isPH ? (
        <>
          <select
            value={value.region}
            onChange={(e) => onChange({ ...value, region: e.target.value, province: "" })}
            className={inputClass}
          >
            <option value="">Region</option>
            {PH_MACRO_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {provinceOptions.length > 0 && (
            <select
              value={value.province}
              onChange={(e) => onChange({ ...value, province: e.target.value })}
              className={inputClass}
            >
              <option value="">Province</option>
              {provinceOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            list={`${idPrefix}-ph-cities`}
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City / Municipality"
            autoComplete="address-level2"
            className={inputClass}
          />
          <datalist id={`${idPrefix}-ph-cities`}>
            {PH_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <input
            type="text"
            value={value.barangay}
            onChange={(e) => onChange({ ...value, barangay: e.target.value })}
            placeholder="Barangay"
            className={inputClass}
          />

          <input
            type="text"
            inputMode="numeric"
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
            placeholder="Postal code"
            autoComplete="postal-code"
            className={inputClass}
          />

          <input
            type="text"
            value={value.houseNo}
            onChange={(e) => onChange({ ...value, houseNo: e.target.value })}
            placeholder="House / Unit / Building No."
            className={inputClass}
          />
          <input
            type="text"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            placeholder="Street name"
            autoComplete="street-address"
            className={inputClass}
          />
        </>
      ) : (
        <>
          <input
            type="text"
            value={value.region}
            onChange={(e) => onChange({ ...value, region: e.target.value })}
            placeholder="State / Province"
            autoComplete="address-level1"
            className={inputClass}
          />
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City"
            autoComplete="address-level2"
            className={inputClass}
          />
          <input
            type="text"
            inputMode="numeric"
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
            placeholder="Postal code"
            autoComplete="postal-code"
            className={inputClass}
          />
          <input
            type="text"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            placeholder="Street address, building, unit no."
            autoComplete="street-address"
            className={inputClass}
          />
        </>
      )}
    </div>
  );
}
