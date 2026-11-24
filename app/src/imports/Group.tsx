import svgPaths from "./svg-f6wjoql8d9";

export default function Group({ 
  primaryColor = "var(--primary-yellow)", 
  secondaryColor = "var(--primary-black)" 
}: { 
  primaryColor?: string, 
  secondaryColor?: string 
} = {}) {
  return (
    <div className="relative size-full" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.0707 36.6186">
        <g clipPath="url(#clip0_61_572)" id="Group">
          <path d={svgPaths.p1a9ce580} fill={primaryColor} id="Vector" />
          <g id="Group_2">
            <path d={svgPaths.p11b6c000} fill={secondaryColor} id="Vector_2" />
            <path d={svgPaths.p1c19c880} fill={secondaryColor} id="Vector_3" />
            <path d={svgPaths.p1f4fce00} fill={secondaryColor} id="Vector_4" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_61_572">
            <rect fill="white" height="36.6186" width="24.0707" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}