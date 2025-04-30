import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Country data with flags and dial codes
type CountryData = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

// Most common countries to show at the top of the list
const preferredCountries = ['us', 'ca', 'gb', 'au', 'in', 'bd', 'pk', 'de', 'fr', 'jp', 'cn', 'br'];

// List of countries with flags and dial codes
const countries: CountryData[] = [
  { name: 'United States', code: 'us', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'ca', dialCode: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', code: 'gb', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: 'au', dialCode: '+61', flag: '🇦🇺' },
  { name: 'India', code: 'in', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Bangladesh', code: 'bd', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Pakistan', code: 'pk', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Afghanistan', code: 'af', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Germany', code: 'de', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'fr', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: 'jp', dialCode: '+81', flag: '🇯🇵' },
  { name: 'China', code: 'cn', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'br', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'mx', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Spain', code: 'es', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'it', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Russia', code: 'ru', dialCode: '+7', flag: '🇷🇺' },
  { name: 'South Korea', code: 'kr', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Netherlands', code: 'nl', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Singapore', code: 'sg', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Malaysia', code: 'my', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Indonesia', code: 'id', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Thailand', code: 'th', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: 'vn', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Philippines', code: 'ph', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Switzerland', code: 'ch', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: 'se', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: 'no', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'dk', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Finland', code: 'fi', dialCode: '+358', flag: '🇫🇮' },
  { name: 'South Africa', code: 'za', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'ng', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Egypt', code: 'eg', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Kenya', code: 'ke', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Ghana', code: 'gh', dialCode: '+233', flag: '🇬🇭' },
  { name: 'United Arab Emirates', code: 'ae', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'sa', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: 'qa', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Turkey', code: 'tr', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Israel', code: 'il', dialCode: '+972', flag: '🇮🇱' },
  { name: 'New Zealand', code: 'nz', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Argentina', code: 'ar', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Colombia', code: 'co', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Peru', code: 'pe', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Chile', code: 'cl', dialCode: '+56', flag: '🇨🇱' },
  { name: 'Poland', code: 'pl', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Ukraine', code: 'ua', dialCode: '+380', flag: '🇺🇦' },
  { name: 'Greece', code: 'gr', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Romania', code: 'ro', dialCode: '+40', flag: '🇷🇴' },
  { name: 'Sri Lanka', code: 'lk', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: 'np', dialCode: '+977', flag: '🇳🇵' },
];

// Sort and organize countries
const sortedCountries = [...countries].sort((a, b) => {
  // First put preferred countries at the top
  const aPreferredIndex = preferredCountries.indexOf(a.code);
  const bPreferredIndex = preferredCountries.indexOf(b.code);
  
  if (aPreferredIndex !== -1 && bPreferredIndex !== -1) {
    return aPreferredIndex - bPreferredIndex;
  }
  
  if (aPreferredIndex !== -1) return -1;
  if (bPreferredIndex !== -1) return 1;
  
  // Then sort alphabetically
  return a.name.localeCompare(b.name);
});

interface PhoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  preview?: boolean;
}

export default function ModernPhoneInput({
  value,
  onChange,
  label,
  description,
  required,
  preview = false
}: PhoneProps) {
  // Split the phone value into country code and number parts
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Parse and set initial values
  useEffect(() => {
    if (value) {
      // Try to match the beginning of the value to a dial code
      const matchedCountry = countries.find(country => 
        value.startsWith(country.dialCode.replace('+', ''))
      );
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry.code);
        setPhoneNumber(value.substring(matchedCountry.dialCode.length - 1));
      } else {
        // If no country code is detected, just use the full value as the phone number
        setPhoneNumber(value);
      }
    }
  }, []);
  
  // Combine country code and number when either changes
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const dialCode = countries.find(c => c.code === countryCode)?.dialCode.replace('+', '') || '';
    onChange(dialCode + phoneNumber);
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    const dialCode = countries.find(c => c.code === selectedCountry)?.dialCode.replace('+', '') || '';
    onChange(dialCode + newNumber);
  };
  
  // Find the currently selected country
  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1.5">
        <Label className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      
      <div className="flex">
        {/* Country selector */}
        <div className="w-32 flex-shrink-0 mr-2">
          <Select
            value={selectedCountry}
            onValueChange={handleCountryChange}
            disabled={preview}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select country">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{currentCountry.flag}</span>
                  <span className="font-medium text-sm text-slate-700">{currentCountry.dialCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {sortedCountries.map((country) => (
                <SelectItem 
                  key={country.code} 
                  value={country.code}
                  className={cn(
                    "py-2.5",
                    preferredCountries.includes(country.code) && "border-b border-slate-100 mb-1"
                  )}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                    <span className="ml-auto text-slate-500">{country.dialCode}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Phone number input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Phone number"
          className="flex-1"
          disabled={preview}
        />
      </div>
    </div>
  );
}