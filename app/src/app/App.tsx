import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
          <p className="text-gray-600 mb-4">La aplicación encontró un error inesperado.</p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-w-full text-left">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-black text-white rounded-lg"
          >
            Recargar aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// min-h-[100dvh] (no min-h-screen/100vh) en el fondo: en mobile, 100vh suele
// ser el viewport MÁS GRANDE posible (barra del navegador oculta) mientras
// que h-[100dvh] del marco de abajo sigue el viewport ACTUAL — si difieren,
// el fondo queda más alto que el marco y lo "empuja" fuera del centro cada
// vez que la barra del navegador aparece o desaparece. Con la misma unidad
// en los dos, siempre miden igual.
export default function App() {
  return (
    <div className="app-shell-backdrop flex justify-center items-center min-h-[100dvh] bg-gray-100">
      {/* Siempre formato teléfono: con ancho Y alto genuinamente amplios
          (desktop, tablets), marco fijo de 393px vía .app-shell (ver
          styles/index.css). Un teléfono real en horizontal, aunque supere
          los 640px de ancho, no tiene 700px de alto: sigue en modo fluido. */}
      <div className="app-shell w-full h-[100dvh] bg-white relative overflow-hidden flex flex-col transform-gpu">
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
