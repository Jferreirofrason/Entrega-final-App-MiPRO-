import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Perfil } from "./pages/Perfil";
import { MetodosPago } from "./pages/MetodosPago";
import { Historial } from "./pages/Historial";
import { Navigate } from "react-router";
import { HistorialPagos } from "./pages/HistorialPagos";
import { DetallePago } from "./pages/DetallePago";
import { EliminarCuenta } from "./pages/EliminarCuenta";
import { Notificaciones } from "./pages/Notificaciones";
import { NotFound } from "./pages/NotFound";
import { Welcome } from "./pages/Welcome";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Configuracion } from "./pages/Configuracion";
import { Soporte } from "./pages/Soporte";
import { Sugerencias } from "./pages/Sugerencias";
import { MisProductos } from "./pages/MisProductos";
import {
  RedirigirAAgregarProducto,
  RedirigirAProducto,
  RedirigirAProductos,
} from "./pages/RedireccionesProductos";
import { MiProducto } from "./pages/MiProducto";
import { EditarMiProducto } from "./pages/EditarMiProducto";
import { DetalleServicio } from "./pages/DetalleServicio";
import { ListaReclamos } from "./pages/ListaReclamos";
import { DetalleReclamo } from "./pages/DetalleReclamo";
import { CatalogoServicios } from "./pages/CatalogoServicios";
import { GarantiaHub } from "./pages/GarantiaHub";
import { GarantiaProducto } from "./pages/GarantiaProducto";
import { GarantiaProblema } from "./pages/GarantiaProblema";
import { GarantiaRevisar } from "./pages/GarantiaRevisar";
import { GarantiaAgregarDireccion } from "./pages/GarantiaAgregarDireccion";
import { GarantiaConfirmar } from "./pages/GarantiaConfirmar";
import { GarantiaEnviada } from "./pages/GarantiaEnviada";
import { RevisarLugar } from "./pages/RevisarLugar";
import { ConfigurarServicio } from "./pages/ConfigurarServicio";
import { DireccionServicio } from "./pages/DireccionServicio";
import { AgregarDireccion } from "./pages/AgregarDireccion";
import { FechaServicio } from "./pages/FechaServicio";
import { ResumenServicio } from "./pages/ResumenServicio";
import { MetodoPago } from "./pages/MetodoPago";
import { PagoConfirmado } from "./pages/PagoConfirmado";
import { DetalleCatalogo } from "./pages/DetalleCatalogo";
import { SolicitudEnviada } from "./pages/SolicitudEnviada";
import { AgregarProducto } from "./pages/AgregarProducto";

export const router = createHashRouter([
  // Auth pages (no tab bar)
  { path: "/welcome", Component: Welcome },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  { path: "/forgot-password", Component: ForgotPassword },

  // Main app (with tab bar)
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      // ── Mis productos: UN solo módulo ──
      //
      // El orden importa: "agregar" va ANTES que ":id", porque si no el
      // router lo toma como el id de un producto y el alta abre un detalle
      // que no existe.
      { path: "mis-productos", Component: MisProductos },
      { path: "mis-productos/agregar", Component: AgregarProducto },
      { path: "mis-productos/:id", Component: MiProducto },
      { path: "mis-productos/:id/editar", Component: EditarMiProducto },

      // Las rutas viejas solo redirigen: existían cuando había dos módulos
      // de productos y se quedan para no romper un enlace guardado.
      { path: "productos", Component: RedirigirAProductos },
      { path: "productos/agregar", Component: RedirigirAAgregarProducto },
      { path: "productos/:id", Component: RedirigirAProducto },

      { path: "perfil", Component: Perfil },
      // Historial de solicitudes: servicios y garantías en una lista.
      { path: "historial", Component: Historial },
      // La ruta vieja solo redirige: la pantalla es la misma, cambió de
      // nombre al pasar a ser el historial completo.
      {
        path: "mis-solicitudes",
        element: <Navigate to="/historial" replace />,
      },
      { path: "perfil/metodos-pago", Component: MetodosPago },
      { path: "perfil/historial-pagos", Component: HistorialPagos },
      { path: "perfil/historial-pagos/:id", Component: DetallePago },
      { path: "perfil/eliminar-cuenta", Component: EliminarCuenta },
      { path: "notificaciones", Component: Notificaciones },
      // "Mis Citas" se retiró: era una segunda lista de lo mismo. La ruta
      // queda redirigiendo para no romper un enlace guardado.
      {
        path: "proyectos",
        element: <Navigate to="/historial?tipo=servicios" replace />,
      },
      { path: "servicios/:id", Component: DetalleServicio },
      { path: "reclamos", Component: ListaReclamos },
      { path: "reclamos/:id", Component: DetalleReclamo },
      { path: "catalogo", Component: CatalogoServicios },
      { path: "catalogo/:id", Component: DetalleCatalogo },
      { path: "catalogo/:id/revisar-lugar", Component: RevisarLugar },
      { path: "catalogo/:id/configurar", Component: ConfigurarServicio },
      { path: "catalogo/:id/direccion", Component: DireccionServicio },
      { path: "catalogo/:id/direccion/nueva", Component: AgregarDireccion },
      { path: "catalogo/:id/fecha", Component: FechaServicio },
      { path: "catalogo/:id/resumen", Component: ResumenServicio },
      { path: "catalogo/:id/pago", Component: MetodoPago },
      { path: "pago-confirmado", Component: PagoConfirmado },
      { path: "solicitud-enviada", Component: SolicitudEnviada },
      { path: "garantia", Component: GarantiaHub },
      { path: "garantia/producto", Component: GarantiaProducto },
      { path: "garantia/problema", Component: GarantiaProblema },
      { path: "garantia/revisar", Component: GarantiaRevisar },
      { path: "garantia/direccion/nueva", Component: GarantiaAgregarDireccion },
      { path: "garantia/confirmar", Component: GarantiaConfirmar },
      { path: "garantia/enviada", Component: GarantiaEnviada },
      { path: "configuracion", Component: Configuracion },
      { path: "soporte", Component: Soporte },
      { path: "sugerencias", Component: Sugerencias },
      { path: "*", Component: NotFound },
    ],
  },
]);