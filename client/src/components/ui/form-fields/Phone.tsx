import React from "react";
import ModernPhoneInput from "./ModernPhoneInput";

interface PhoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  preview?: boolean;
}

export default function Phone(props: PhoneProps) {
  return <ModernPhoneInput {...props} />;
}