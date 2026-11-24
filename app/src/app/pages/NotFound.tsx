import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6 py-20 min-h-full"
      style={{ backgroundColor: 'var(--primary-white)' }}
    >
      <h1
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: '64px',
          fontWeight: 'var(--font-weight-normal)',
          color: 'var(--foreground)',
          letterSpacing: '1px',
          lineHeight: '1',
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--gray-60)',
          textAlign: 'center',
          marginTop: '16px',
        }}
      >
        Página no encontrada
      </p>
      <button
          onClick={() => navigate("/")}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary-white)',
            borderColor: 'var(--gray-20)',
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" />
        </button>
    </div>
  );
}
