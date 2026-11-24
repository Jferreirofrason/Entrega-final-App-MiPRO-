import { Nut } from "lucide-react";
import HandSvg from "../../imports/Group";

interface HandLoaderProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function HandLoader({ 
  className = "", 
  size = 60,
  primaryColor = "var(--primary-white)",
  secondaryColor = "var(--primary-yellow)"
}: HandLoaderProps) {
  // El SVG original tiene un viewBox de aprox 24x36, mantenemos la proporción
  const height = size * (36.6186 / 24.0707);

  return (
    <>
      <style>
        {`
          @keyframes unscrew {
            0%, 10% { transform: rotate(0deg); }
            25%, 35% { transform: rotate(-90deg); }
            50%, 60% { transform: rotate(-180deg); }
            75%, 85% { transform: rotate(-270deg); }
            100% { transform: rotate(-360deg); }
          }
          .animate-unscrew {
            animation: unscrew 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
          }
          
          @keyframes nut-fall {
            0%, 60% { 
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
            75% { 
              transform: translateX(-50%) translateY(${size}px);
              opacity: 0;
            }
            76%, 100% { 
              transform: translateX(-50%) translateY(-10px);
              opacity: 0;
            }
          }
          .animate-nut-fall {
            animation: nut-fall 1.8s ease-in infinite;
          }
        `}
      </style>
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${height}px` }}
      >
        {/* Tuerca animada (cae y gira) */}
        <div 
          className="absolute z-0 animate-nut-fall flex items-center justify-center" 
          style={{ top: '25%', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="animate-unscrew">
            <Nut size={size * 0.45} color="var(--primary-white)" strokeWidth={2.5} />
          </div>
        </div>

        {/* Mano animada */}
        <div className="animate-unscrew relative z-10 size-full">
          <HandSvg primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </div>
      </div>
    </>
  );
}