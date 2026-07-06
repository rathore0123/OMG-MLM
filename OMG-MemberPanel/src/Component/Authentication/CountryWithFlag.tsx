import React from "react";
import Select from "react-select";
import CountryFlag from "react-country-flag";
// @ts-ignore
import { getData } from "country-list";

// Define the structure of country data
interface Country {
  code: string;
  name: string;
}

// Option type
interface CountryOption {
  label: string;
  value: string;
}

// Props interface
interface CountryFlagSelectProps {
  value?: string; // 👈 can be "IN" or "India"
  SetCountryName: (country: string) => void;
}

// Generate country options
const countryOptions: CountryOption[] = getData().map(
  ({ code, name }: Country) => ({
    label: name,
    value: code,
  })
);

// Custom option (flag + name)
const customOption = (option: CountryOption) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <CountryFlag
      countryCode={option.value}
      svg
      style={{ width: "1.5em", height: "1.5em", marginRight: "10px" }}
    />
    {option.label}
  </div>
);

const CountryFlagSelect: React.FC<CountryFlagSelectProps> = ({
  value,
  SetCountryName,
}) => {
  // 🔥 Find selected option from value (code OR name)
  const selectedOption =
    countryOptions.find((c) => c.value === value) ||
    countryOptions.find(
      (c) => c.label.toLowerCase() === value?.toLowerCase()
    ) ||
    null;

  // Handle change
  const handleChange = (selectedOption: CountryOption | null) => {
    if (selectedOption) {
      SetCountryName(selectedOption.value); // send country code (IN)
    }
  };

  // Custom styles
  const customStyles = {
    control: (base: any) => ({
      ...base,
      border: "2px solid #ccc",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#888",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
      color: "#333",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#888",
    }),
  };

  return (
    <div className="form-group">
      <Select
        options={countryOptions}
        value={selectedOption} // 👈 THIS FIXES DEFAULT VALUE
        onChange={handleChange}
        formatOptionLabel={customOption}
        placeholder="Select a country..."
        isSearchable
        styles={customStyles}
      />
    </div>
  );
};

export default CountryFlagSelect;