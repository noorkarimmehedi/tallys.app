import React from "react";

// Updated to use the customer's actual logo SVG for immediate loading
export const LogoSVG: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
  return (
    <svg 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      width="160" 
      height="41" 
      viewBox="0 0 694 178" 
      className={className}
    >
      <path d="M0 0 C229.02 0 458.04 0 694 0 C694 58.74 694 117.48 694 178 C464.98 178 235.96 178 0 178 C0 119.26 0 60.52 0 0 Z " fill="#FDFDFD" transform="translate(0,0)"/>
      <path d="M0 0 C11.88 0 23.76 0 36 0 C36 34.98 36 69.96 36 106 C38.64 106 41.28 106 44 106 C44 106.99 44 107.98 44 109 C29.81 109 15.62 109 1 109 C1 108.34 1 107.68 1 107 C3.64 107 6.28 107 9 107 C9 72.35 9 37.7 9 2 C6.03 2 3.06 2 0 2 C0 1.34 0 0.68 0 0 Z " fill="#020202" transform="translate(222,21)"/>
      <path d="M0 0 C11.88 0 23.76 0 36 0 C36 34.98 36 69.96 36 106 C38.64 106 41.28 106 44 106 C44 106.99 44 107.98 44 109 C29.81 109 15.62 109 1 109 C1 108.34 1 107.68 1 107 C3.64 107 6.28 107 9 107 C9 72.35 9 37.7 9 2 C6.03 2 3.06 2 0 2 C0 1.34 0 0.68 0 0 Z " fill="#020202" transform="translate(176,21)"/>
      <path d="M0 0 C0.99 0 1.98 0 3 0 C2.25 6.625 2.25 6.625 0 10 C-0.99 10.33 -1.98 10.66 -3 11 C-2.01 7.37 -1.02 3.74 0 0 Z " fill="#232323" transform="translate(92,110)"/>
      <path d="M0 0 C0.66 0 1.32 0 2 0 C1.67 3.63 1.34 7.26 1 11 C0.01 11 -0.98 11 -2 11 C-1.34 7.37 -0.68 3.74 0 0 Z " fill="#222222" transform="translate(173,109)"/>
      <path d="M0 0 C0.33 0 0.66 0 1 0 C1.25 2.3125 1.25 2.3125 1 5 C-1 6.8125 -1 6.8125 -3 8 C-3 7.34 -3 6.68 -3 6 C-3.99 5.67 -4.98 5.34 -6 5 C-5.38125 4.9175 -4.7625 4.835 -4.125 4.75 C-1.81562433 4.18741541 -1.81562433 4.18741541 -0.75 1.9375 C-0.5025 1.298125 -0.255 0.65875 0 0 Z " fill="#2D2D2D" transform="translate(134,120)"/>
    </svg>
  );
};

export default LogoSVG;