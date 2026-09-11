/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import countries from "@/data/landing/countries";

import { DemoFormData } from "../types";

const useDemo = () => {
  const [formData, setFormData] = useState<DemoFormData>({
    fullName: "",
    company: "",
    phoneNumber: "",
    email: "",
    companySize: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountryCode, setSelectedCountryCode] = useState("PK");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCompanySizeDropdownOpen, setIsCompanySizeDropdownOpen] = useState(false);
  
  const selectedCountry =
    countries.find((c) => c.code === selectedCountryCode) || countries[0];

  const filteredCountries = countries.filter((c) => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  
  const handlePhoneNumberChange = (phoneNumber: string) => {
    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");
    const slicedPhoneNumber = numericPhoneNumber.slice(0, selectedCountry.length);
    
    setFormData((prev) => ({
      ...prev,
      phoneNumber: slicedPhoneNumber
    }));
  };

  const handleCompanySizeChange = (size: string) => {
    setFormData((prev) => ({ ...prev, companySize: size }));
    setIsCompanySizeDropdownOpen(false);
  };

  const submitForm = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dial_code} ${formData.phoneNumber}`;

      const response = await axios.post("/api/demo", {
        ...formData,
        phoneNumber: fullPhoneNumber,
        country: selectedCountryCode,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        // Reset form on success
        setFormData({
          fullName: "",
          company: "",
          phoneNumber: "",
          email: "",
          companySize: "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    success,
    error,
    handleChange,
    handlePhoneNumberChange,
    submitForm,
    selectedCountryCode,
    setSelectedCountryCode,
    selectedCountry,
    isCountryDropdownOpen,
    setIsCountryDropdownOpen,
    countrySearch,
    setCountrySearch,
    filteredCountries,
    isCompanySizeDropdownOpen,
    setIsCompanySizeDropdownOpen,
    handleCompanySizeChange,
  };
};

export default useDemo;
