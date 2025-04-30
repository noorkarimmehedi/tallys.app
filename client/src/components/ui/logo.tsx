import React from "react";

export const LogoSVG: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
  return (
    <svg
      width="640"
      height="160"
      viewBox="0 0 640 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M140 20H40C28.9543 20 20 28.9543 20 40V120C20 131.046 28.9543 140 40 140H140C151.046 140 160 131.046 160 120V40C160 28.9543 151.046 20 140 20Z"
        fill="black"
      />
      <path
        d="M100 60H80V100H100V60Z"
        fill="white"
      />
      <path
        d="M60 60H40V80H60V60Z"
        fill="white"
      />
      <path
        d="M140 60H120V80H140V60Z"
        fill="white"
      />
      <path
        d="M120 100H100V120H120V100Z"
        fill="white"
      />
      <path
        d="M60 100H40V120H60V100Z"
        fill="white"
      />
      <path
        d="M220 50H200V110H220V50Z"
        fill="black"
      />
      <path
        d="M280 50H240V70H280V50Z"
        fill="black"
      />
      <path
        d="M280 70H260V110H280V70Z"
        fill="black"
      />
      <path
        d="M340 50H300V70H340V50Z"
        fill="black"
      />
      <path
        d="M340 90H300V110H340V90Z"
        fill="black"
      />
      <path
        d="M320 70H300V90H320V70Z"
        fill="black"
      />
      <path
        d="M400 50H360V110H400V50Z"
        fill="black"
      />
      <path
        d="M380 50H360V110H380V50Z"
        fill="black"
      />
      <path
        d="M440 50H420V110H440V50Z"
        fill="black"
      />
      <path
        d="M500 50H460V70H500V50Z"
        fill="black"
      />
      <path
        d="M480 70H460V110H480V70Z"
        fill="black"
      />
      <path
        d="M560 50H520V110H560V50Z"
        fill="black"
      />
      <path
        d="M540 50H520V110H540V50Z"
        fill="black"
      />
      <path
        d="M620 50H580V110H620V50Z"
        fill="black"
      />
      <path
        d="M620 50H580V70H620V50Z"
        fill="black"
      />
      <path
        d="M620 90H580V110H620V90Z"
        fill="black"
      />
    </svg>
  );
};

export default LogoSVG;