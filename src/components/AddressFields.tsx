"use client";

import { useState } from "react";
import { COUNTRIES, PH_CITIES, PH_REGIONS, type ShippingAddress } from "@/lib/shipping";

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
  const [customCountry, setCustomCountry] = useState(
    COUNTRIES.includes(value.country) ? "" : value.country
  );
  const isPH = value.country === "Philippines";
  const countrySelectValue = COUNTRIES.includes(value.country) ? value.country : "Other";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select
        value={countrySelectValue}
        onChange={(e) => {
          const next = e.target.value;
          onChange({ ...value, country: next === "Other" ? customCountry : next, region: "" });
        }}
        autoComplete="country-name"
        className={inputClass}
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {countrySelectValue === "Other" && (
        <input
          type="text"
          value={customCountry}
          onChange={(e) => {
            setCustomCountry(e.target.value);
            onChange({ ...value, country: e.target.value });
          }}
          placeholder="Country name"
          className={inputClass}
        />
      )}

      {isPH ? (
        <select
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value })}
          className={inputClass}
        >
          <option value="">Region</option>
          {PH_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value })}
          placeholder="State / Province"
          autoComplete="address-level1"
          className={inputClass}
        />
      )}

      <input
        type="text"
        list={isPH ? `${idPrefix}-ph-cities` : undefined}
        value={value.city}
        onChange={(e) => onChange({ ...value, city: e.target.value })}
        placeholder="City"
        autoComplete="address-level2"
        className={inputClass}
      />
      {isPH && (
        <datalist id={`${idPrefix}-ph-cities`}>
          {PH_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}

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
        className={`${inputClass} sm:col-span-2`}
      />
    </div>
  );
}
