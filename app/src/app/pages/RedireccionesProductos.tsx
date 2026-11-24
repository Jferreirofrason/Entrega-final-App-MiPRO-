import { Navigate, useParams } from "react-router";
import { buscarProductoPorId } from "../data/compras";

// Las rutas viejas de productos, que ahora solo redirigen.
//
// Hubo dos módulos de productos en paralelo: #/productos (los cargados a
// mano) y #/mis-productos (las compras). Se unieron en uno solo y estas
// rutas quedan únicamente para que un enlace guardado siga funcionando.
// Van con `replace`: el histórico no guarda la ruta vieja, así que el botón
// de volver no cae de nuevo en la redirección y no se arma un ciclo.

/** #/productos → la lista, recortada a lo que esa pantalla mostraba. */
export function RedirigirAProductos() {
  return <Navigate to="/mis-productos?origen=manual" replace />;
}

/** #/productos/agregar → el alta, que ahora vive adentro de Mis productos. */
export function RedirigirAAgregarProducto() {
  return <Navigate to="/mis-productos/agregar" replace />;
}

/**
 * #/productos/:id → el detalle único.
 *
 * Los ids viejos eran números ("1") y los de ahora llevan su procedencia
 * ("manual-1", "compra-aire-novey"). Si el id guardado ya existe tal cual
 * se usa; si no, se prueba como producto cargado a mano, que es lo que esa
 * pantalla mostraba. Si tampoco existe, el detalle lo dice: mejor eso que
 * mandar a la lista y dejar a la persona sin entender qué pasó.
 */
export function RedirigirAProducto() {
  const { id } = useParams();
  if (!id) return <Navigate to="/mis-productos" replace />;
  const destino = buscarProductoPorId(id) ? id : `manual-${id}`;
  return <Navigate to={`/mis-productos/${destino}`} replace />;
}
