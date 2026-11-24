import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import logoUrl from "../../imports/logo.svg";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col h-full relative auth-gradient !overflow-y-auto overflow-x-hidden"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        
        {/* Main Logo from Design System */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <img 
            src={logoUrl} 
            alt="MiPRO Logo" 
            style={{ width: '200px', height: 'auto' }} 
          />
        </div>
      </div>

      {/* Fixed Bottom Actions with Home Button Format */}
      <div className="px-6 pb-12 w-full relative z-10">
        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            height: '44px',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--primary-yellow)',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--primary-black)',
            }}
          >
            Iniciar sesión
          </span>
        </button>
        
        <button
          onClick={() => navigate("/signup")}
          className="w-full flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            height: '44px',
            borderRadius: 'var(--radius)',
            backgroundColor: 'transparent',
            border: '1px solid var(--primary-white)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--primary-white)',
            }}
          >
            Crear cuenta
          </span>
        </button>
      </div>
    </div>
  );
}