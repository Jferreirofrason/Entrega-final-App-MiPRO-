// Textos visibles del Home, centralizados.
//
// El proyecto no tiene un sistema de internacionalización: este módulo es la
// extensión mínima para no hardcodear strings en los componentes. Si más
// adelante se suma una librería de i18n, estas claves son el punto de partida.
// La presentación de los estados de una cita vive en i18n/estados.ts.

export const STR = {
  home: {
    saludo: (nombre: string) => `Hola, ${nombre}`,
    // Fallback si el nombre del cliente no está disponible.
    saludoSinNombre: "¡Hola!",
    subtitulo: "¿Qué hacemos hoy en tu hogar?",
    // El rótulo del avatar lo arma `logic/perfil.ts` con el nombre de la
    // persona ("Perfil de María"): un "Abrir mi perfil" genérico no decía
    // de quién es la cuenta.
    // Perfil salió de la barra inferior: ahora se entra por la foto. El
    // aviso se muestra UNA vez y se puede cerrar; no es un tutorial, es
    // avisar dónde se mudó algo que antes estaba en otro lado.
    avisoPerfilTitulo: "Tu perfil ahora está aquí",
    avisoPerfilTexto: "Toca tu avatar para ver tus datos, pagos y solicitudes.",
    avisoPerfilCerrar: "Entendido",
  },
  serviciosHogar: {
    titulo: "Servicios para tu hogar",
    descripcion: "Desliza para ver más y elige el que necesitas.",
    agendar: "Agendar",
    verTodos: "Ver todos",
    verTodosServicios: "Ver todos los servicios",
    inspeccion: "Puede requerir una inspección",
    cargando: "Cargando servicios",
    error: "No pudimos cargar los servicios.",
    reintentar: "Intentar nuevamente",
    verCatalogo: "Ver catálogo",
    vacioTexto: "Explora todos los servicios disponibles.",
    vacioAccion: "Ver servicios",
  },
  avisoCita: {
    tituloSeccion: "Mis servicios",
    proximaVisita: "Próxima visita",
    proximaVisitaDe: (proposito: string) => `Próxima visita: ${proposito.toLowerCase()}`,
    // Mismo vocabulario que las cards de Mis servicios y el detalle.
    enCursoAhora: "Servicio en curso",
    mensajeEnCurso: "Estamos trabajando en tu servicio",
    enCamino: "En camino",
    mensajeEnCamino: "El técnico va en camino",
    enviando: "Estamos enviando tu solicitud",
    tecnico: "Técnico",
    verProgreso: "Ver progreso",
    verTodos: "Ver todos",
  },
  buscador: {
    // Orientado a la tarea cotidiana: invita a describir el problema.
    placeholder: "¿Qué necesitas resolver hoy?",
    etiqueta: "Busca un servicio para tu hogar",
    limpiar: "Borrar búsqueda",
    // Búsqueda vacía: explicar qué hacer, sin tono de error.
    ayudaVacia: "Escribe el servicio que necesitas, por ejemplo, aire acondicionado.",
    // Interino mientras no exista el catálogo de servicios (MIPRO-1471).
    catalogoPendiente:
      "Muy pronto vas a poder ver aquí los resultados de tu búsqueda.",
  },
  misCitas: {
    titulo: "Mis servicios",
    verMas: "Ver más",
    tecnico: "Técnico asignado",
    cargando: "Cargando tus servicios",
    error: "No pudimos cargar tus servicios.",
    reintentar: "Intentar nuevamente",
    vacioTitulo: "Aún no tienes servicios agendados",
    vacioDetalle: "Explora los servicios disponibles para tu hogar.",
    vacioDescripcion:
      "Transforma y mantén tu hogar en óptimo estado. Elige un servicio y agéndalo fácil con profesionales certificados.",
    vacioAccion: "Buscar servicios",
  },
  notificaciones: {
    titulo: "Notificaciones",
    volver: "Volver",
    abrir: (sinLeer: number) =>
      sinLeer > 0 ? `Notificaciones, ${sinLeer} sin leer` : "Notificaciones",
    // "Notificaciones", no "novedades": una sola palabra para la cosa, la
    // misma que el título de la pantalla y la del ícono del Home.
    sinLeer: (n: number) =>
      n === 1 ? "1 notificación sin leer" : `${n} notificaciones sin leer`,
    // Menú del encabezado. Cada opción aparece solo si tiene sentido: no
    // se ofrece marcar leídas cuando no hay ninguna sin leer.
    acciones: "Más opciones",
    accionesTitulo: "Notificaciones",
    marcarTodas: "Marcar todas como leídas",
    todasLeidas: "Listo, no te queda ninguna sin leer",
    borrarTodas: "Borrar todas las notificaciones",
    // Grupos por fecha relativa.
    grupoHoy: "Hoy",
    grupoAyer: "Ayer",
    grupoAnteriores: "Anteriores",
    noLeida: "No leída",
    verDetalle: (caso: string) => `Ver ${caso}`,
    // Eliminar una: se puede deshacer, así que no pide confirmación.
    eliminar: (titulo: string) => `Eliminar ${titulo}`,
    eliminada: "Notificación eliminada",
    deshacer: "Deshacer",
    // Borrar todas SÍ la pide: no hay vuelta atrás.
    borrarTodasTitulo: "¿Borrar todas las notificaciones?",
    borrarTodasTexto:
      "Esta acción eliminará todas las notificaciones de tu bandeja. No podrás recuperarlas.",
    borrarTodasCancelar: "Cancelar",
    borrarTodasConfirmar: "Borrar todas",
    borradas: "Borramos todas tus notificaciones",
    // Vacío: no es una falla ni un callejón, es que está todo al día.
    vacioTitulo: "No tienes notificaciones",
    vacioTexto:
      "Cuando tengamos información sobre tus servicios o garantías, la verás aquí.",
  },
  // Textos del detalle de un servicio. Los de la card y las pestañas de la
  // lista "Mis Citas" se fueron con esa pantalla, que se retiró: era una
  // segunda lista de lo mismo que el historial.
  servicios: {
    titulo: "Mis servicios",
    // Lo usa el hub de Garantía para su propia pestaña con cantidad.
    tabConCantidad: (nombre: string, cantidad: number) => `${nombre} (${cantidad})`,
    // Progreso en lenguaje cotidiano. El total solo se promete si el negocio
    // confirmó el plan de visitas desde el inicio.
    progresoConocido: (realizadas: number, total: number) =>
      `${realizadas} de ${total} visitas realizadas`,
    progresoCompleto: "Todas las visitas fueron completadas",
    progresoAbierto: (realizadas: number) =>
      realizadas === 1 ? "1 visita realizada" : `${realizadas} visitas realizadas`,
    visitasRealizadas: (cantidad: number) =>
      cantidad === 1 ? "1 visita realizada" : `${cantidad} visitas realizadas`,
    proximaVisita: "Próxima visita",
    sinVisitasAun: "Aún no hay visitas realizadas",
    tecnicoPorAsignar: "Por asignar",
    tecnico: "Técnico",
    verDetalle: "Ver detalle",
    verDetalleFinalizado: "Ver detalle",
    finalizadoEl: (fecha: string) => `Finalizado el ${fecha}`,
    canceladoEl: (fecha: string) => `Cancelado el ${fecha}`,
    // Información base del servicio (cuando nació en la app).
    infoBase: "Datos de tu solicitud",
    numeroReserva: "N.º de reserva",
    direccion: "Dirección",
    totalEstimado: "Total estimado",
    notas: "Notas",
    recibe: "Recibe",
    // Cambios y cancelaciones: fuera de la app, con un canal claro.
    contactarTitulo: "¿Necesitas cambiar algo?",
    contactarDetalle: "Para cambiar o cancelar una visita, comunícate con nuestro equipo.",
    contactarCta: "Contactar a MiPRO",
    contactarWhatsApp: "Escribir por WhatsApp",
    contactarLlamar: "Llamar a MiPRO",
    contactarCerrar: "Cerrar",
    contactarVolver: "Volver",
    cancelarPregunta: "¿Quieres cancelar esta solicitud?",
    cancelarContactoDetalle: "Para cancelar esta solicitud, contáctanos y nuestro equipo te ayudará.",
    // Calificación del servicio finalizado.
    calificacionTitulo: "¿Cómo estuvo tu servicio?",
    calificacionServicio: "El servicio",
    calificacionTecnico: "El técnico",
    calificacionTecnicoDe: (nombre: string) => `El técnico (${nombre})`,
    calificarCon: (aspecto: string, n: number) => `Calificar ${aspecto} con ${n} de 5`,
    calificacionComentario: "Comentario",
    calificacionComentarioPlaceholder: "Cuéntanos cómo fue el servicio",
    calificacionEnviar: "Enviar calificación",
    calificacionGracias: "Gracias por tu calificación",
    calificacionGraciasDetalle: "Tu opinión nos ayuda a mejorar.",
    // Ayuda contextual cuando el servicio ya terminó.
    ayudaFinalizadoTitulo: "¿Necesitas ayuda con este servicio?",
    ayudaFinalizadoDetalle: "Si algo no quedó bien, cuéntanos y lo revisamos.",
    // Recorrido de visitas en el detalle.
    resumenAvance: "Avance del servicio",
    recorrido: "Visitas de este servicio",
    visitaCompletadaEl: (fecha: string) => `Completada el ${fecha}`,
    visitaCompletada: "Completada",
    visitaCanceladaEl: (fecha: string) => `Cancelada el ${fecha}`,
    visitaCancelada: "Cancelada",
    visitaPendienteCoordinacion: "Pendiente de coordinación",
    // Vocabulario exacto del seguimiento por estados (ej. "Inspección de aire
    // acondicionado"): Por coordinar → Cita confirmada → En curso →
    // Completada, con Cancelada como rama opcional.
    visitaPorCoordinar: "Por coordinar",
    visitaConfirmadaParaEl: (fecha: string) => `Cita confirmada para el ${fecha}`,
    visitaEnCursoEl: (fecha: string) => `En curso el ${fecha}`,
    visitaGenerica: "Visita técnica",
    // Estados de la pantalla.
    cargando: "Cargando tus servicios",
    error: "No pudimos cargar tus servicios.",
    reintentar: "Intentar nuevamente",
    vacioEnCursoTitulo: "No tienes servicios en curso",
    vacioEnCursoDescripcion:
      "Cuando agendes un servicio, podrás seguir su avance desde aquí.",
    vacioEnCursoAccion: "Buscar servicios",
    sinConexion: "Parece que no hay conexión. Revisa tu red e intenta nuevamente.",
    vacioFinalizadasTitulo: "Aún no tienes servicios finalizados",
    vacioFinalizadasDescripcion: "Tus servicios completados aparecerán aquí.",
    noEncontrado: "No encontramos este servicio.",
    volver: "Volver a Mis servicios",
  },
  catalogo: {
    titulo: "Servicios",
    buscar: "¿Qué servicio necesitas?",
    etiquetaBusqueda: "Buscar en el catálogo de servicios",
    limpiar: "Borrar búsqueda",
    sinResultados: (termino: string) =>
      `No encontramos servicios para "${termino}".`,
    sinResultadosAyuda: "Prueba con otras palabras o explora el listado completo.",
    verListadoCompleto: "Ver listado completo",
    verServicio: "Ver servicio",
    todas: "Todos",
    explorar: "Explora por categoría",
    explorarSubcategorias: "Elige el tipo de servicio",
    verCategoria: "Ver los tipos de servicio de esta categoría",
    verSubcategoria: "Ver los servicios de este grupo",
    cantidadCategorias: (n: number) => (n === 1 ? "1 categoría" : `${n} categorías`),
    cantidadSubcategorias: (n: number) => (n === 1 ? "1 tipo" : `${n} tipos`),
    buscarEnLista: "Busca por nombre",
    etiquetaBusquedaLista: "Buscar dentro de estos servicios",
    resultadosDe: (termino: string) => `Resultados para "${termino}"`,
    conEvaluacion: "Con inspección",
    badgePuedeEvaluacion: "Puede requerir inspección",
    badgeRequiereEvaluacion: "Requiere inspección",
    cantidadServicios: (n: number) => (n === 1 ? "1 servicio" : `${n} servicios`),
    // La ficha se cuenta con la descripción en texto: "Qué incluye" salió
    // de la pantalla (el alcance real lo define negocio y no estaba
    // confirmado para la mayoría de los servicios).
    importante: "Importante",
    inspeccionTitulo: "Antes de confirmar, revisaremos algunas condiciones del lugar.",
    inspeccionObligatoriaTitulo: "Requiere inspección",
    inspeccionObligatoriaDetalle:
      "Este servicio siempre comienza con una inspección para evaluar el lugar y darte una cotización.",
    inspeccionDetalle:
      "Según las condiciones del lugar, podríamos necesitar una inspección antes de confirmar la instalación.",
    inspeccionCosto: (monto: number) => `Costo de inspección: $${monto}`,
    inspeccionDescuento:
      "Si aceptas la cotización, ese monto se descuenta del costo final.",
    solicitar: "Agendar servicio",
    comoSigue: "Cómo sigue",
    comoSigueDetalle:
      "Al enviar tu solicitud, nos comunicaremos contigo entre 1 y 2 días hábiles para coordinar la visita.",
    volver: "Volver",
    noEncontrado: "No encontramos este servicio.",
  },
  agendar: {
    // Etapa 1: configuración
    configuraTitulo: "Configura el servicio",
    cantidad: "Cantidad de unidades",
    cantidadPregunta: "Cantidad de equipos",
    unidades: (n: number) => (n === 1 ? "1 unidad" : `${n} unidades`),
    menos: "Disminuir cantidad",
    mas: "Aumentar cantidad",
    precioUnitario: "Precio unitario",
    precioServicio: (monto: number | string) => `Precio del servicio: $${monto}`,
    costoEstimadoServicio: "Costo estimado del servicio",
    totalEstimado: "Total estimado",
    // ⚠️ El porcentaje de ITBMS que corresponde a servicios está PENDIENTE
    // de validación, así que el texto no lo nombra y no hay ningún cálculo
    // de impuesto en el proyecto: el precio del catálogo es el que se
    // muestra y el que se cobra (ver totalConAdicionales en
    // logic/solicitudServicio.ts). Este texto es el único lugar donde la
    // app habla del ITBMS, y lo usan Configurar servicio, Resumen y el pie
    // del checkout: cambiarlo acá los deja a los tres diciendo lo mismo.
    itbms: "El precio incluye ITBMS.",
    desgloseServicio: "Servicio",
    desgloseInspeccion: "Inspección",
    desgloseInspeccionNota:
      "Se paga antes de la inspección y se descuenta del costo final si aceptas la cotización.",
    desgloseDesinstalacion: "Desinstalación del equipo actual",
    desgloseNotaInsumos:
      "Este es un valor estimado. La cotización final puede variar si se necesitan materiales o trabajos adicionales.",
    fotos: "Fotos",
    fotosAyuda: "Agrega fotos si quieres ayudarnos a preparar la visita.",
    agregarFotos: "Agregar fotos",
    eliminarFoto: "Eliminar",
    notas: "Notas",
    notasAyuda: "Cuéntanos algo que debamos saber del trabajo o del lugar. Si el trabajo es urgente, dínoslo acá.",
    // Etapa 2: dirección y contacto
    direccionTitulo: "¿Dónde realizamos el servicio?",
    agregarDireccion: "Agregar otra dirección",
    guardarDireccion: "Guardar dirección",
    volverAlSelector: "Volver a mis direcciones",
    buscarMapa: "Busca tu dirección o un punto cercano",
    mapaAyuda: "Elige un punto para ubicar el servicio",
    mapaConfirmado: "Ubicación confirmada. Revisa y completa los datos.",
    ubicacionConfirmada: (lugar: string) => `Ubicación confirmada: ${lugar}`,
    alias: "Nombre de la dirección",
    aliasPlaceholder: "Por ejemplo, Casa",
    provincia: "Provincia",
    distrito: "Distrito",
    corregimiento: "Corregimiento",
    barrio: "Barrio o barriada",
    calle: "Calle",
    casa: "Casa o edificio",
    edificio: "Nombre del edificio",
    piso: "Piso",
    numero: "Número de casa o apartamento",
    detalles: "Detalles adicionales",
    contactoTitulo: "¿Otra persona recibirá al técnico?",
    contactoAyuda: "Opcional. Si no eres tú, dinos a quién contactar.",
    contactoNombre: "Nombre",
    contactoTelefono: "Teléfono",
    // Etapa 3: fecha preferida
    fechaTitulo: "Elige cuándo prefieres recibir la visita.",
    fechaCampo: "Día preferido",
    bloqueCampo: "Horario preferido",
    fechaAclaracion:
      "Un agente de MiPRO se contactará contigo para confirmar la fecha y el horario.",
    // Etapa 4: resumen
    resumenTitulo: "Revisa tu solicitud",
    editar: "Editar",
    bloqueServicio: "Servicio",
    bloqueDireccion: "Dirección",
    bloqueFecha: "Fecha preferida",
    bloqueNotas: "Notas y fotos",
    adicionales: "Adicionales",
    recibe: "Recibe",
    sinNotas: "Sin notas",
    fotosResumen: (n: number) => (n === 1 ? "1 foto" : `${n} fotos`),
    pagoAviso:
      "Un agente de MiPRO se contactará contigo para coordinar el pago y confirmar la visita.",
    confirmar: "Confirmar solicitud",
    continuar: "Continuar",
    obligatorio: "Obligatorio",
    opcional: "Opcional",
    volver: "Volver",
    noEncontrado: "No encontramos este servicio.",
  },
  solicitud: {
    titulo: "Solicitud enviada",
    tituloExito: "¡Solicitud enviada!",
    mensajeSiguiente:
      "Nos comunicaremos contigo entre 1 y 2 días hábiles para coordinar la visita.",
    gracias: (nombre: string) => `Gracias, ${nombre}`,
    graciasSinNombre: "¡Gracias!",
    servicio: "Servicio",
    fechaSolicitud: "Fecha de solicitud",
    numeroReserva: "N.º de reserva",
    condiciones: "Condiciones del lugar",
    direccion: "Dirección",
    fechaPreferida: "Fecha preferida",
    totalEstimado: "Total estimado",
    unidades: (n: number) => (n === 1 ? "1 unidad" : `${n} unidades`),
    queSigueLink: "¿Qué sigue?",
    pasosTitulo: "Siguientes pasos",
    pasosCerrar: "Cerrar",
    estadoRecibida: "Solicitud recibida",
    paso1: "Recibirás una confirmación por correo electrónico.",
    paso2: "Un agente de MiPRO te contactará para coordinar el pago mediante las opciones disponibles.",
    paso3: "También confirmará contigo la fecha y el horario de la visita.",
    paso4: "Podrás seguir el progreso desde Mis servicios. Recuerda que cuentas con una garantía de 3 meses por los servicios de MiPRO.",
    verProgreso: "Ver progreso",
    volverInicio: "Volver al inicio",
  },
  /** Pago de la reserva. Todo simulado: ver logic/pago.ts. */
  pago: {
    titulo: "Método de pago",
    volver: "Volver al resumen",
    continuarAlPago: "Continuar al pago",
    avisoEnResumen:
      "En el siguiente paso pagas la reserva del servicio. La fecha y el horario los confirma un agente de MiPRO.",
    totalEtiqueta: "Total a pagar",
    resumenServicio: "Tu servicio",
    resumenFecha: "Fecha y horario",
    resumenDireccion: "Dirección",
    eligeComoPagar: "Elige cómo pagar",
    /** HU: el vencimiento es obligatorio en la fila de una tarjeta. */
    vence: (mmaa: string) => `Vence ${mmaa}`,
    verDetalle: "Ver detalle",
    detalleTituloSheet: "Detalle del servicio",
    predeterminada: "Predeterminada",
    yappyNombre: "Yappy",
    yappyDetalle: "Cobro instantáneo al celular",
    // ── Solicitud de pago por Yappy ──
    yappyTitulo: "Completa el pago en Yappy",
    yappyInstruccion:
      "Busca la notificación en Yappy o revisa los pagos pendientes en la app de tu banco.",
    yappyAyuda: "Autoriza el pago antes de que termine el tiempo.",
    yappyEsperando: "Esperando tu autorización…",
    yappyMonto: "Monto a pagar",
    yappyVencida: "La solicitud de pago venció",
    yappyVencidaAyuda: "Nadie autorizó el pago dentro del tiempo. Podés pedirlo de nuevo.",
    yappyReintentar: "Intentar nuevamente",
    yappyOtroMetodo: "Elegir otro método",
    yappyRechazada: "El pago fue rechazado",
    yappyRechazadaAyuda: "Yappy no autorizó el pago. Probá con otro método.",
    yappyPendiente: "Tenés un pago esperando tu autorización en Yappy.",
    yappyVerPendiente: "Ver la solicitud",
    yappySimulado: "Operación simulada. Todavía no hay integración con Yappy.",
    // ⚠️ Controles SOLO de la demostración: sin integración no hay forma de
    // recibir una aprobación de verdad, y un pago NO se da por aprobado
    // porque pasó el tiempo. Se van con la integración.
    // Mientras no haya integración, la aprobación no puede llegar sola, así
    // que la dispara la persona que muestra la demo. Son acciones de verdad,
    // no un enlace escondido: sin esto no se puede terminar un pago con
    // Yappy. Se van con la integración.
    yappyDemo: "Mientras tanto, desde acá:",
    yappyDemoAprobar: "Simular autorización",
    yappyDemoRechazar: "Simular rechazo",
    cmfNombre: "Crédito CMF",
    // ── Bloque informativo de la tarjeta digital CMF ──
    // ⚠️ Las cuotas NO se nombran: la referencia habla de hasta 36, pero no
    // está confirmado para los servicios de MiPRO y no se presenta como un
    // beneficio aprobado.
    cmfBloque: "Paga con tu tarjeta digital CMF. Si aún no la tienes, ",
    // ── Elegir tarjeta y cuotas ──
    cmfElegirTarjeta: "Elige tu tarjeta CMF",
    cmfElegirTarjetaAyuda: "Selecciona una tarjeta para consultar sus cuotas.",
    cmfElegirCuotas: "Elige la cantidad de cuotas",
    cmfSinTarjetas: "No encontramos tarjetas CMF a tu nombre.",
    cmfSinTarjetasAyuda: "Con una tarjeta CMF puedes financiar el servicio en cuotas.",
    cmfSolicitar: "Solicitar tarjeta CMF",
    cmfCargando: "Buscando tus tarjetas…",
    cmfCargandoPlanes: "Buscando las cuotas disponibles…",
    cmfError: "No pudimos obtener la información de tu cuenta CMF.",
    cmfReintentar: "Reintentar",
    cmfOtroMetodo: "Elegir otro método",
    cmfSinPlanes: "Esta tarjeta no tiene cuotas disponibles para esta compra.",
    cmfCreditoInsuficiente: "El crédito disponible no alcanza para esta compra.",
    cmfCambiar: "Cambiar",
    cmfCompraAFinanciar: "Importe de la compra",
    cmfCuotasDe: (cuotas: number, monto: string) => `${cuotas} cuotas de ${monto}`,
    cmfUnaCuota: (monto: string) => `1 pago de ${monto}`,
    cmfTotalDeLasCuotas: (monto: string) => `Total: ${monto}`,
    // La etiqueta del total, arriba del monto, en la fila de cada plan.
    cmfTotal: "Total",
    // ⚠️ HOY NO SE MUESTRA: la fila de cuotas quedó sin la etiqueta, por
    // decisión de producto. Se conserva acá, con su regla, por si vuelve:
    // solo se diría cuando el plan lo confirma (afirmaSinIntereses).
    cmfSinIntereses: "Sin intereses",
    cmfUsarCuotas: "Continuar",
    // ⚠️ HOY NO SE MUESTRA, como la etiqueta de arriba: la pantalla de
    // cuotas quedó sin aclaraciones. Que los planes son simulados está
    // dicho en el código (data/cmf.ts y PENDIENTE_DE_CMF).
    cmfSimulado: "Cuotas de demostración. Las reales las informa CMF.",
    // En el checkout, una vez elegido
    cmfPlanElegido: (cuotas: number, monto: string) =>
      cuotas === 1 ? `1 pago de ${monto}` : `${cuotas} cuotas de ${monto}`,
    cmfTotalFinanciado: (compra: string, total: string) =>
      `Compra ${compra} · Total financiado ${total}`,
    cmfElegirPlan: "Elegir cuotas",
    cmfImporteCambio: "El importe cambió. Elige las cuotas de nuevo.",
    cmfBloqueEnlace: "solicítala aquí",
    cmfEnlaceSinConfigurar: "El enlace de solicitud todavía no está configurado.",
    // ── Tarjeta de regalo ──
    regaloNombre: "Tarjeta de regalo",
    regaloDetalle: "Paga con el saldo de tu tarjeta",
    regaloCodigo: "Código de la tarjeta",
    regaloValidar: "Validar",
    regaloValidando: "Validando el código…",
    regaloInvalida: "El código no es válido.",
    regaloSinSaldo: (saldo: string, total: string) =>
      `El saldo es de ${saldo} y el total es de ${total}.`,
    regaloCombinadoPendiente:
      "Todavía no se puede completar el resto con otro medio: está pendiente de definición.",
    regaloSaldo: (saldo: string) => `Saldo disponible: ${saldo}`,
    regaloAUsar: (monto: string) => `Se usarán ${monto} de este saldo`,
    regaloOtroCodigo: "Probar con otro código",
    regaloSimulado: "Validación de demostración. Los códigos reales los define Comercial.",
    // ── Cupón ──
    cuponPregunta: "¿Tienes un cupón?",
    cuponAgregar: "Agregar",
    cuponTitulo: "Agregar un cupón",
    cuponCodigo: "Código del cupón",
    cuponAplicar: "Aplicar",
    cuponValidando: "Validando el código…",
    cuponInvalido: "El código no es válido.",
    cuponAplicado: (codigo: string) => `Cupón ${codigo} aplicado`,
    cuponQuitar: "Quitar",
    cuponSimulado:
      "Validación de demostración. Los códigos, los montos y las vigencias los define Comercial.",
    subtotal: "Subtotal",
    descuento: "Descuento",
    // ── Facturación ──
    facturacionTitulo: "Dirección de facturación",
    facturacionMisma: "Usar la misma dirección del servicio",
    facturacionParaFacturar: "Dirección para facturar",
    facturacionAgregar: "Agregar dirección de facturación",
    facturacionEditar: "Editar",
    facturacionFalta: "Completa la dirección de facturación.",
    // Con la casilla marcada no hay nada que completar en facturación: lo
    // que falta es la dirección del servicio, y se dice así.
    facturacionSinServicio: "Falta la dirección del servicio, que es la que se factura.",
    facturacionIrAlServicio: "Agregar la dirección del servicio",
    // Lo que se avisa cuando se toca "Confirmar pago" y falta algo: el
    // botón no puede quedarse callado.
    faltaMedio: "Elige cómo quieres pagar.",
    faltaRegalo: "Revisa el código de la tarjeta de regalo.",
    facturacionTituloModal: "Dirección de facturación",
    facturacionAyudaModal:
      "Es la dirección que va en la factura. La del servicio no cambia.",
    // ── Condiciones ──
    condicionesTitulo: "Condiciones",
    condicionesAcepto: "He leído las condiciones generales de venta y las acepto sin reserva",
    // Tal cual aparece dentro de la frase: el enlace ES ese tramo del
    // texto, así que va en minúscula y no se repite aparte.
    condicionesEnlace: "condiciones generales de venta",
    condicionesFalta: "Para continuar, acepta las condiciones generales de venta.",
    cmfDetalle: "Financiamiento directo Cochez",
    noDisponible: "No disponible por el momento",
    agregarTarjeta: "Agregar nueva tarjeta",
    usarComoPredeterminada: "Usar como tarjeta predeterminada",
    hacerPredeterminada: "Usar como predeterminada",
    yaEsPredeterminada: "Es tu tarjeta predeterminada",
    tusTarjetas: "Tus tarjetas",
    otrosMetodos: "Otros medios de pago",
    agregarCorto: "Agregar",
    // ── El medio elegido y su selector ──
    // La pantalla muestra UN medio, el predeterminado, ya elegido; el resto
    // vive adentro del selector.
    metodoElegido: "Pagas con",
    cambiarMetodo: "Cambiar",
    selectorTitulo: "Elige cómo pagar",
    selectorCargando: "Buscando tus medios de pago…",
    sinTarjetas: "Todavía no tienes tarjetas guardadas.",
    sinTarjetasAyuda: "Agrega una para pagar con tarjeta, o elige otro método.",
    elegidaParaEstePago: "Elegida para este pago",
    posicionTarjeta: (i: number, total: number) => `Tarjeta ${i} de ${total}`,
    accionesDeLaTarjeta: (tarjeta: string) => `Acciones de ${tarjeta}`,
    // Sin banco emisor NO se pone el titular en su lugar ni se inventa un
    // emisor: se nombra la tarjeta por su marca.
    tarjetaDeMarca: (marca: string) => `Tarjeta ${marca}`,
    tarjetaCredito: "Crédito",
    tarjetaDebito: "Débito",
    tarjetaTitular: "Titular",
    // Editar
    editarTarjeta: "Editar tarjeta",
    editarNota: "Para cambiar el número o el vencimiento, agrega una nueva tarjeta",
    guardarCambios: "Guardar cambios",
    tarjetaActualizada: "Tarjeta actualizada",
    // Eliminar
    eliminarTarjeta: "Eliminar tarjeta",
    eliminarQue: (tarjeta: string) => `¿Eliminar ${tarjeta}?`,
    eliminarQueCambia: "Se quitará de tus tarjetas guardadas",
    eliminarEraElegida:
      "Esta tarjeta está seleccionada para el pago. Tendrás que elegir otro método",
    eliminarEraPredeterminada: "Es tu predeterminada. No se asigna otra sola",
    tarjetaEliminada: "Tarjeta eliminada",
    predeterminadaActualizada: "Tarjeta predeterminada actualizada",
    tarjetaAgregada: "Tarjeta agregada y seleccionada para este pago",
    campoTitular: "Nombre del titular",
    campoTitularEjemplo: "Como figura en la tarjeta",
    campoNumero: "Número de tarjeta",
    campoVence: "Vencimiento",
    campoCodigo: "Código de seguridad",
    guardarTarjeta: "Guardar tarjeta",
    cancelar: "Cancelar",
    cerrar: "Cerrar",
    // El alta es de demostración y la pantalla lo dice donde se cargan los
    // datos, no solo al pie de la pantalla de pago.
    altaDemostracion:
      "Alta de demostración. No se guarda el número completo ni el código de seguridad, y no se cobra nada.",
    agregarTarjetaDetalle: "Crédito o Débito · Visa / Mastercard",
    agregarNoDisponible: "Todavía no disponible",
    cmfEtiqueta: "CMF",
    confirmar: "Confirmar pago",
    procesandoTitulo: "Procesando pago…",
    procesandoEspera: "No cierres la app",
    exitoTitulo: "¡Pago confirmado!",
    exitoGracias: (nombre: string) => `Gracias, ${nombre}. Tu cita está agendada.`,
    exitoGraciasSinNombre: "Gracias. Tu cita está agendada.",
    estadoAprobado: "Pago aprobado",
    // Resguardo: si el resultado no es "aprobado", la pantalla NO puede
    // decir que el pago se aprobó. Los estados de rechazo todavía no
    // están definidos, así que se nombra el estado sin inventarlo.
    estadoSinDefinir: "Estado del pago pendiente de definición",
    montoOperacion: "Monto de la operación",
    montoPagado: "Total pagado",
    detalleTitulo: "Tu reserva",
    // Cuando el pago está aprobado pero la reserva todavía no se confirmó,
    // NO se afirma que la cita quedó agendada.
    exitoReservaEnCurso: (nombre: string) => `Gracias, ${nombre}. Estamos confirmando tu cita.`,
    exitoReservaEnCursoSinNombre: "Gracias. Estamos confirmando tu cita.",
    detalleServicio: "Servicio",
    detalleMedio: "Método de pago",
    detalleAutorizacion: "Número de autorización",
    detalleFecha: "Fecha y hora",
    detalleReserva: "Número de reserva",
    detalleDireccion: "Dirección",
    queSigue: "¿Qué sigue tras el pago?",
    queSigue1: "Te confirmaremos los detalles de la visita.",
    queSigue2: "Podrás seguir el estado de tu solicitud desde Mis servicios.",
    // ⚠️ Pendiente de validación con Gregorio, incluida la necesidad de una
    // HU propia para ese correo. No se afirma que el email se envió.
    queSigue3:
      "El comprobante fiscal y el voucher por email están pendientes de definición. Todavía no se envían.",
    volverInicio: "Volver al inicio",
    // Retirado del pie del checkout a pedido. La demostración se sigue
    // identificando donde importa: el alta de tarjeta, Yappy, las cuotas de
    // CMF y el comprobante (`simulado`).
    demostracion: "Pago de demostración. No se realizará ningún cobro.",
    // ⚠️ YA NO SE MUESTRA en el comprobante, por decisión de producto. Que
    // el pago es simulado sigue dicho en el código (logic/pago.ts y
    // PENDIENTE_PARA_COBRAR).
    simulado: "Pago simulado para la demostración. No se cobró ningún monto.",
  },

  lugar: {
    paso: "Antes de agendar",
    subtituloPaso: "Responde unas preguntas sobre el lugar de instalación.",
    introTitulo: "Revisemos el lugar de instalación",
    introDescripcion:
      "Te haremos unas preguntas para saber si podemos realizar la instalación estándar o si primero necesitamos revisar el espacio.",
    comenzar: "Comenzar",
    progreso: "Revisamos las condiciones del lugar",
    progresoPaso: (n: number, total: number) => `Paso ${n} de ${total}`,
    seleccionaste: (opcion: string) => `Seleccionaste: ${opcion}`,
    comoIdentifico: "¿Cómo lo identifico?",
    dudaExtra: "Si todavía tienes dudas, elige \"No estoy seguro\".",
    tranquilizador:
      "Si no estás seguro, elige esta opción. Te ayudaremos a revisarlo.",
    continuar: "Continuar",
    volver: "Volver",
    salirTitulo: "¿Quieres salir de la revisión?",
    salirDetalle: "Si sales ahora, perderás las respuestas de esta revisión.",
    salirConfirmar: "Salir",
    salirCancelar: "Seguir respondiendo",
    // Resultado: instalación estándar
    okTitulo: "Podemos continuar",
    okDescripcion:
      "Con tus respuestas, podemos avanzar al agendamiento de la instalación.",
    okAclaracion: "La coordinación final confirmará las condiciones del servicio.",
    okCta: "Continuar al agendamiento",
    // Resultado: inspección previa
    inspTitulo: "Primero necesitamos revisar el lugar",
    inspDescripcion: "Antes de instalar, un técnico debe verificar las condiciones del lugar.",
    inspCosto: "Costo de inspección: $20",
    inspDescuento:
      "Si aceptas la cotización final, este monto se descontará del costo del servicio.",
    inspCta: "Continuar con la inspección",
    inspSecundaria: "Volver y revisar respuestas",
    // Desinstalación
    desTitulo: "Ya hay un equipo en el lugar",
    desDescripcion:
      "Podemos incluir la desinstalación del equipo actual antes de instalar el nuevo.",
    desPrecio: (monto: number) => `Costo adicional: $${monto}`,
    desAgregar: "Agregar desinstalación",
    desNoNecesito: "No la necesito",
    // Estados
    cargando: "Cargando las preguntas",
    errorTitulo: "No pudimos cargar las preguntas",
    errorDetalle: "Intenta nuevamente para continuar con el servicio.",
    reintentar: "Intentar nuevamente",
    // Resumen
    condiciones: "Condiciones del lugar",
    condEstandar: "Instalación estándar",
    condInspeccion: "Requiere inspección previa",
    condDesinstalacion: "Incluye desinstalación",
    okDesinstalacion: "Incluiste desinstalación del equipo actual",
  },
  garantiaFlujo: {
    // Introducción
    titulo: "Solicitar ayuda por garantía",
    intro:
      "Cuéntanos qué pasó con tu producto. Revisaremos la información para confirmar si está cubierto y te explicaremos cómo continuar.",
    comenzar: "Comenzar",
    volver: "Volver",
    // Etiquetas de campos
    obligatorio: "Obligatorio",
    opcional: "Opcional",
    continuar: "Continuar",
    siguiente: "Siguiente",
    // Paso 1
    p1Pregunta: "¿Con qué producto necesitas ayuda?",
    p1TusProductos: "Tus productos",
    p1NoAparece: "El producto no aparece",
    p1ComoIdentificar: "¿Cómo quieres identificarlo?",
    p1TomarFoto: "Tomar foto de la etiqueta",
    p1FotoGuardada:
      "Guardamos la foto para nuestro equipo. Completa los datos que conozcas.",
    p1Manual: "Ingresar los datos manualmente",
    p1Factura: "N.º de factura",
    p1FacturaPlaceholder: "Ej.: FAC-001-2026",
    p1FechaCompra: "Fecha de compra",
    // OJO: un input[type=date] IGNORA el atributo placeholder (el navegador
    // dibuja su propio "dd/mm/aaaa"), así que el formato se dice como texto
    // de ayuda del campo, que es donde se lee de verdad.
    p1FechaCompraAyuda: "DD/MM/AAAA o selecciona la fecha.",
    p1FacturaAyuda: "¿Dónde encuentro la factura?",
    p1FacturaAyudaTexto: "Está en el comprobante de compra del comercio.",
    p1Codigo: "Código de producto",
    p1CodigoPlaceholder: "Ej.: COD-987654",
    p1ModeloPlaceholder: "Ej.: Deluxe 2000",
    p1SeriePlaceholder: "Ej.: SN-123456789",
    p1CodigoAyuda: "¿Dónde encuentro el código de producto?",
    // El código de producto y el SKU son el mismo número: decirlo evita que
    // alguien lo busque dos veces. La app nunca llama "SKU" a su campo (el
    // cliente no tiene por qué conocer esa palabra), pero sí explica la
    // equivalencia acá, porque en la factura puede aparecer así.
    p1CodigoAyudaTexto:
      "En la factura está en la misma línea del producto, arriba de su nombre. Es el mismo número que algunos comercios llaman SKU, así que si en tu comprobante dice SKU, ese es el dato. También aparece en la etiqueta trasera o inferior del producto.",
    p1Tipo: "Tipo de producto",
    p1TipoPlaceholder: "Selecciona un producto",
    p1TipoBuscar: "Buscar producto",
    p1TipoSinResultados: "No encontramos ese producto.",
    p1Marca: "Marca",
    p1MarcaPlaceholder: "Selecciona una marca",
    p1MarcaBuscar: "Buscar marca",
    p1MarcaSinResultados: "No encontramos marcas",
    p1Modelo: "Modelo",
    p1ModeloAyuda: "¿Dónde encuentro el modelo?",
    p1ModeloAyudaTexto:
      "Suele estar en una etiqueta en la parte trasera o inferior del producto, junto al número de serie.",
    p1Serie: "Número de serie",
    p1SerieAyuda: "¿Dónde encuentro el número de serie?",
    p1SerieAyudaTexto:
      "Está en la misma etiqueta del producto, junto al modelo. Suele ser el número más largo y empieza por SN.",
    p1Compra: "¿Hace cuánto lo compraste?",
    p1Comercio: "Comprado en",
    p1ComercioPlaceholder: "Selecciona un comercio",
    p1Alias: "Nombre del producto",
    p1AliasPlaceholder: "Ej.: Refrigeradora de la cocina",
    p1VolverALista: "Elegir de mis productos",
    // Paso 2
    p2Pregunta: "¿Qué está pasando con el producto?",
    p2Placeholder: "Selecciona el problema",
    p2Recomendacion: "Antes de continuar, intenta esto",
    p2SiguePasando: "Continuar de todas formas",
    p2Detalle: "Cuéntanos un poco más",
    p2DetalleAyuda:
      "Por ejemplo: cuándo comenzó, qué sucede al encenderlo o si aparece algún mensaje.",
    p2Adjuntos: "Fotos o videos",
    p2AdjuntosAyuda: "Nos ayudan a entender el problema más rápido.",
    p2Agregar: "Agregar fotos o videos",
    p2Cargando: "Subiendo",
    p2Listo: "Listo",
    p2Fallo: "No pudimos subir este archivo.",
    p2Reintentar: "Intentar nuevamente",
    p2Eliminar: "Eliminar",
    // Paso 3
    p3Contacto: "¿A quién contactamos?",
    p3Editar: "Editar",
    p3Nombre: "Nombre",
    p3Telefono: "Teléfono",
    p3Alternativo: "Contacto alternativo",
    p3AlternativoAyuda: "Opcional. Si no puedes atender tú, dinos a quién contactamos.",
    p3AlternativoResumen: "También podemos contactar a",
    p3Ubicacion: "¿Dónde se encuentra el producto?",
    p3AgregarDireccion: "Agregar otra dirección",
    p3MapaAyuda: "Elige un punto para ubicar el producto",
    p3Privacidad:
      "Usaremos esta dirección para coordinar la atención del producto si es necesario.",
    p3RevisarSolicitud: "Revisar solicitud",
    // Paso 4: revisión final, antes del envío
    p3Revisa: "Revisar tu solicitud",
    p3Producto: "Producto",
    p3Archivos: "Archivos",
    p3ArchivosCantidad: (n: number) => (n === 1 ? "1 archivo" : `${n} archivos`),
    p4Compra: "Compra",
    p4Factura: "N.º de factura",
    p4FechaCompra: "Fecha de compra",
    p4Comercio: "Comprado en",
    p4Tipo: "Tipo",
    p4Marca: "Marca",
    p4Modelo: "Modelo",
    p4Codigo: "Código de producto",
    p4Serie: "N.º de serie",
    p4ProblemaReportado: "Problema reportado",
    p4ContactoDireccion: "Contacto y dirección",
    p3Expectativa:
      "Al enviar la solicitud, MiPRO revisará la información para confirmar la cobertura y te indicará cómo continuar.",
    p3Enviar: "Enviar solicitud",
    p3Enviando: "Enviando",
    p3ErrorEnvio: "No pudimos enviar la solicitud.",
    p3ErrorEnvioDetalle: "Tus datos siguen guardados. Intenta nuevamente.",
    p3Reintentar: "Reintentar",
    // Confirmación
    cTitulo: "Recibimos tu solicitud",
    cDetalle: "Ya guardamos la información y comenzaremos a revisarla.",
    cProducto: "Producto",
    cSolicitud: "Solicitud",
    cCopiar: "Copiar número",
    cCopiado: "Copiado",
    cEnviada: (fecha: string) => `Enviada el ${fecha}`,
    cFechaEnvio: "Fecha de envío",
    cQueSigue: "¿Qué sigue?",
    cPaso1: "Revisaremos los datos y la cobertura.",
    cPaso2: "Te contactaremos si necesitamos más información.",
    cPaso3: "Te explicaremos las opciones para atender el producto.",
    cVerSolicitud: "Ver mi solicitud",
    cVolverInicio: "Volver al inicio",
  },
  garantia: {
    titulo: "Garantía y reclamos",
    verTodos: "Ver todos",
    // Acceso para iniciar una nueva solicitud (separado de consultar).
    introTitulo: "¿Necesitas ayuda con un producto?",
    introDescripcion:
      "Si un producto presenta una falla, revisaremos si está cubierto por la garantía.",
    solicitar: "Solicitar ayuda por garantía",
    reclamoReciente: "Tu reclamo más reciente",
    reclamo: "Reclamo",
    iniciadoEl: (fecha: string) => `Iniciado el ${fecha}`,
    // La fecha de la cita se rotula con palabras: antes iba sola detrás de
    // un ícono de calendario y no se entendía de qué fecha hablaba.
    citaEl: (fecha: string) => `Cita: ${fecha}`,
    actualizadoEl: (fecha: string) => `Última actualización el ${fecha}`,
    verDetalle: "Ver detalle",
    proximaVisita: "Próxima visita",
    tecnico: "Técnico",
    // Pantallas de listado y detalle.
    listadoTitulo: "Garantía y reclamos",
    detalleTitulo: "Detalle del reclamo",
    producto: "Producto",
    historial: "Historial del reclamo",
    resolucion: "Resolución",
    completarInformacion: "Completar información",
    cancelarPregunta: "¿Quieres cancelar esta solicitud?",
    cancelarContactoDetalle: "Para cancelar esta solicitud, contáctanos y nuestro equipo te ayudará.",
    // Modalidad de atención: la define operación/backoffice, nunca el
    // cliente. Instrucción prioritaria al inicio del detalle.
    modalidadEtiqueta: "Cómo sigue tu atención",
    modalidadTallerVisita: "El técnico visitará tu hogar",
    modalidadClienteLleva: "Lleva tu producto al taller",
    // El producto YA está en la tienda: la frase lo dice en pasado, porque
    // no es una instrucción pendiente sino el estado de la atención.
    modalidadDejaTienda: "Dejaste el producto en la tienda",
    modalidadFecha: "Fecha",
    modalidadHorario: "Horario",
    modalidadDireccion: "Dirección",
    modalidadTaller: "Taller",
    modalidadTienda: "Tienda",
    modalidadIndicaciones: "Indicaciones",
    datosProducto: "Datos del producto",
    marca: "Marca",
    categoriaProducto: "Categoría",
    codigoProducto: "Código de producto",
    vigencia: "Garantía",
    noEncontrado: "No encontramos este reclamo.",
    volver: "Volver",
    // Hub (pestaña Garantía)
    tabEnCurso: "En curso",
    tabFinalizados: "Finalizados",
    vacioEnCursoTitulo: "No tienes reclamos en curso",
    vacioEnCursoDetalle: "Cuando inicies un reclamo, podrás seguirlo desde aquí.",
    vacioFinalizadosTitulo: "Aún no tienes reclamos finalizados",
    vacioFinalizadosDetalle: "Tus reclamos resueltos aparecerán aquí.",
    // Estados de la sección.
    sinConexion: "Parece que no hay conexión. Revisa tu red e intenta nuevamente.",
    cargando: "Cargando tus reclamos",
    error: "No pudimos cargar tus reclamos.",
    reintentar: "Intentar nuevamente",
    verMas: "Ver más",
  },
  promociones: {
    titulo: "Promociones",
    // Acción visible en cada card: refuerza que la promoción se puede tocar.
    accion: "Ver servicio",
    cargando: "Cargando promociones",
    error: "No pudimos cargar las promociones.",
    reintentar: "Intentar nuevamente",
    irA: (n: number) => `Ir a la promoción ${n}`,
    posicion: (actual: number, total: number) =>
      `Promoción ${actual} de ${total}`,
    // Interino mientras no exista el detalle de servicio (MIPRO-1472).
    destinoPendiente:
      "Muy pronto vas a poder agendar este servicio desde la promoción.",
  },
  // ── Mis productos: lo comprado en Novey y Cochez ──
  // Lo único que quedó del módulo viejo de productos: el acceso de Perfil,
  // que abre Mis productos recortado a lo cargado a mano. El resto de los
  // textos se fue con las pantallas que los usaban; los de la lista, el
  // detalle y el alta viven en `compras`.
  misProductos: {
    accesoManualTitulo: "Productos agregados a mano",
    accesoUno: "1 producto registrado",
    accesoVarios: (n: number) => `${n} productos registrados`,
    accesoNinguno: "Todavía sin productos",
  },
  // ── Mis Productos: las compras de Novey, Cochez y Kohler ──
  //
  // Pantalla raíz del tab "Productos". Ningún texto afirma que los datos
  // vengan de una integración: todavía no existe.
  compras: {
    tab: "Productos",
    titulo: "Mis productos",
    intro: "Encuentra tus compras y solicita ayuda sin volver a cargar los datos.",
    buscar: "Busca por producto o SKU",
    etiquetaBusqueda: "Buscar entre tus productos",
    borrarBusqueda: "Borrar búsqueda",
    // El panel de filtros y la fila de lo que quedó puesto. No hay chip de
    // "todo": sin filtros no se dibuja nada, que es más claro que un chip
    // encendido que no recorta.
    abrirFiltros: "Filtros",
    abrirFiltrosCon: (n: number) =>
      n === 1 ? "Filtros, 1 puesto" : `Filtros, ${n} puestos`,
    panelTitulo: "Filtros",
    panelProcedencia: "Procedencia",
    panelTienda: "Tienda",
    panelCategoria: "Categoría",
    panelAnio: "Año de compra",
    panelResultado: (n: number) =>
      n === 1 ? "1 producto" : `${n} productos`,
    panelSinResultado: "Ningún producto con estos filtros",
    panelLimpiar: "Limpiar",
    panelListo: "Listo",
    etiquetaFiltros: "Filtros puestos",
    quitarFiltro: (texto: string) => `Quitar el filtro ${texto}`,
    limpiarFiltros: "Limpiar todo",
    // Los valores, dichos como se leen en un chip
    filtroComprados: "Comprados",
    filtroManuales: "Agregados manualmente",
    filtroTienda: (tienda: string) => tienda,
    filtroAnio: (anio: number) => `Comprado en ${anio}`,
    // Lo que se sabe de un producto cargado a mano
    agregadoAMano: "Agregado manualmente",
    agregar: "Agregar",
    agregarProducto: "Agregar un producto",
    // La fila
    sku: (sku: string) => `SKU: ${sku}`,
    tiendaYFecha: (tienda: string, fecha: string) => `${tienda} · ${fecha}`,
    verDetalle: (nombre: string) => `Ver el detalle de ${nombre}`,
    // Acciones
    solicitarGarantia: "Solicitar garantía",
    solicitarServicio: "Solicitar servicio",
    elegirServicio: "Elige el servicio",
    elegirServicioTexto: "Este producto es compatible con más de un servicio.",
    // Estados
    cargando: "Buscando tus productos…",
    error: "No pudimos cargar tus productos.",
    errorTexto: "Vuelve a intentarlo en un momento.",
    reintentar: "Reintentar",
    vacioTitulo: "Aún no tienes productos registrados",
    vacioTexto:
      "Cuando compres en Novey, Cochez o Kohler, tus productos aparecerán aquí.",
    sinResultadosTitulo: "No encontramos productos",
    sinResultadosTexto: "Prueba con otro nombre, SKU o tienda.",
    // El detalle, uno solo para comprados y cargados a mano
    detalleTitulo: "Detalle del producto",
    detalleVolver: "Volver",
    detalleNoEncontrado: "No encontramos este producto.",
    detalleVolverALista: "Volver a Mis productos",
    detalleDatos: "Datos del producto",
    detalleNombre: "Nombre del producto",
    detalleCompra: "Datos de la compra",
    detalleSku: "SKU",
    detalleTienda: "Tienda",
    detalleFecha: "Fecha de compra",
    detalleFactura: "Factura",
    detalleTicket: "Ticket",
    detalleMarca: "Marca",
    detalleCategoria: "Categoría",
    detalleModelo: "Modelo",
    detalleSerie: "Número de serie",
    detalleSinDato: "Sin cargar",
    // Los datos de una compra no se tocan: vienen del comercio.
    detalleCompraFija:
      "Estos datos vienen de tu compra y no se editan desde la app.",
    editar: "Editar producto",
    editarTitulo: "Editar producto",
    editarGuardar: "Guardar cambios",
    editarCancelar: "Cancelar",
    editarAviso: "Corrige los datos que cargaste. El nombre es el único obligatorio.",
    editarListo: "Guardamos los cambios",
    // Precarga en los flujos
    precargaGarantia: "Cargamos los datos de esta compra. Revisa y continúa.",
    precargaIncompleta:
      "No encontramos todos los datos de esta compra. Te ayudaremos a completar la solicitud.",
    // Un producto cargado a mano no tiene compra registrada: no se dice que
    // "no encontramos" algo que nunca existió.
    precargaManual:
      "Este producto lo agregaste tú. Completa los datos de la compra para pedir la garantía.",
    contextoServicio: "Para este producto",
  },
  // ── Seguimiento: la línea de tiempo del detalle ──
  seguimiento: {
    titulo: "Seguimiento",
    // La acción de reagendar NO reprograma: abre el contacto con MiPRO,
    // que es como se cambia una fecha hoy de verdad.
    reagendar: "Reagendar cita",
    contactar: "Contactar a MiPRO",
  },
  // ── Historial de solicitudes: servicios y garantías en una lista ──
  misSolicitudes: {
    titulo: "Historial de solicitudes",
    volver: "Volver",
    ayuda: "Tus servicios y garantías, en un solo lugar.",
    cargando: "Buscando tus solicitudes…",
    error: "No pudimos cargar tus solicitudes.",
    sinConexion: "Revisa tu conexión e intenta de nuevo.",
    reintentar: "Reintentar",
    // Buscador
    buscar: "Busca por número, producto o servicio",
    etiquetaBusqueda: "Buscar en tu historial",
    borrarBusqueda: "Borrar búsqueda",
    // Panel de filtros: una sola fila de chips con lo que quedó puesto
    abrirFiltros: "Filtros",
    abrirFiltrosCon: (n: number) =>
      n === 1 ? "Filtros, 1 puesto" : `Filtros, ${n} puestos`,
    panelTitulo: "Filtros",
    panelEstado: "Estado",
    panelTipo: "Tipo",
    panelResultado: (n: number) => (n === 1 ? "1 solicitud" : `${n} solicitudes`),
    panelSinResultado: "Ninguna solicitud con estos filtros",
    panelLimpiar: "Limpiar",
    panelListo: "Listo",
    etiquetaFiltros: "Filtros puestos",
    quitarFiltro: (texto: string) => `Quitar el filtro ${texto}`,
    limpiarFiltros: "Limpiar filtros",
    filtroActivos: "En curso",
    filtroFinalizados: "Finalizados",
    filtroServicios: "Servicios",
    filtroGarantias: "Garantías",
    // La fila
    tipoServicio: "Servicio",
    tipoGarantia: "Garantía",
    numero: (n: string) => `N.° ${n}`,
    solicitadoEl: (fecha: string) => `Solicitado el ${fecha}`,
    proximaCita: (cuando: string) => `Próxima cita: ${cuando}`,
    verDetalle: (titulo: string) => `Ver el detalle de ${titulo}`,
    // Vacíos
    vacioTitulo: "Aún no tienes solicitudes",
    vacioTexto:
      "Cuando pidas un servicio o ayuda por garantía, podrás seguirla desde aquí.",
    sinResultadosTitulo: "No encontramos solicitudes",
    sinResultadosTexto: "Prueba con otro número, producto o filtro.",
    // La única salida que tenía "Mis Citas" y que no estaba acá: sin
    // solicitudes, la acción es pedir un servicio.
    vacioAccion: "Ver servicios",
  },
  // ── Perfil: pagos y baja de la cuenta ──
  perfil: {
    // La sección nueva va primera: consultar lo que pediste es lo que más
    // se hace al entrar a Perfil.
    seccionActividad: "Mi actividad",
    misSolicitudes: "Mis solicitudes",
    misSolicitudesNinguna: "Todavía sin solicitudes",
    misSolicitudesUna: "1 solicitud en curso",
    misSolicitudesVarias: (n: number) => `${n} solicitudes en curso`,
    misSolicitudesCerradas: "Solo solicitudes finalizadas",
    seccionPagos: "Pagos",
    metodosPago: "Métodos de pago",
    metodosPagoUna: "1 tarjeta guardada",
    metodosPagoVarias: (n: number) => `${n} tarjetas guardadas`,
    metodosPagoNinguna: "Sin métodos guardados",
    historialPagos: "Historial de pagos",
    historialPagosDetalle: "Revisa los pagos de tus servicios",
    eliminarCuenta: "Eliminar cuenta",
  },
  metodosPago: {
    titulo: "Métodos de pago",
    volver: "Volver",
    cargando: "Buscando tus métodos de pago…",
    error: "No pudimos cargar tus métodos de pago.",
    reintentar: "Intentar nuevamente",
    vacioTitulo: "No tienes métodos de pago guardados",
    vacioTexto: "Podrás agregar una tarjeta al momento de pagar un servicio.",
    vacioAccion: "Agregar tarjeta",
    agregar: "Agregar nueva tarjeta",
    agregarDetalle: "Crédito o débito Visa / Mastercard",
    acciones: (tarjeta: string) => `Acciones de ${tarjeta}`,
    hacerPredeterminada: "Establecer como predeterminada",
    editar: "Editar tarjeta",
    editada: "Guardamos los cambios de la tarjeta",
    eliminar: "Eliminar tarjeta",
    predeterminada: "Predeterminada",
    predeterminadaLista: "Tarjeta predeterminada actualizada",
    eliminada: "Tarjeta eliminada",
    agregada: "Tarjeta agregada",
    // La confirmación de borrado desde Perfil. En el checkout el modal
    // conserva su copy, que nombra la tarjeta en el título.
    eliminarTitulo: "¿Eliminar esta tarjeta?",
    eliminarTexto: (tarjeta: string) =>
      `Ya no podrás usar ${tarjeta} para pagar tus servicios.`,
  },
  historial: {
    titulo: "Historial de pagos",
    cargando: "Buscando tus pagos…",
    error: "No pudimos cargar tu historial de pagos.",
    reintentar: "Intentar nuevamente",
    vacioTitulo: "Aún no tienes pagos realizados",
    vacioTexto: "Cuando confirmes el pago de un servicio, aparecerá aquí.",
    reserva: (numero: string) => `Reserva ${numero}`,
    verDetalle: (servicio: string) => `Ver el detalle del pago de ${servicio}`,
    estadoAprobado: "Aprobado",
    estadoPendiente: "Pendiente",
    estadoReembolsado: "Reembolsado",
    estadoCancelado: "Cancelado",
    // ── Detalle de un pago ──
    detalleTitulo: "Detalle de pago",
    detalleNoEncontrado: "No encontramos este pago.",
    detalleMonto: "Monto total",
    detalleServicio: "Servicio",
    detalleMedio: "Método de pago",
    detalleAutorizacion: "Número de autorización",
    detalleReserva: "Número de reserva",
    detalleFecha: "Fecha y hora",
    detalleDireccion: "Dirección del servicio",
  },
  baja: {
    titulo: "Eliminar cuenta",
    explicacion:
      "Al eliminar tu cuenta, perderás acceso a tu perfil, direcciones guardadas y métodos de pago.",
    conPendientes:
      "Tienes solicitudes activas. Para eliminar tu cuenta, primero debes contactar a MiPRO.",
    contactar: "Contactar a MiPRO",
    continuar: "Continuar",
    // ── Confirmación final ──
    confirmarTitulo: "¿Seguro que quieres eliminar tu cuenta?",
    confirmarTexto: "Esta acción no se puede deshacer.",
    confirmarEtiqueta: "Escribe ELIMINAR para continuar",
    cancelar: "Cancelar",
    confirmarAccion: "Eliminar mi cuenta",
    eliminando: "Eliminando tu cuenta…",
    // ⚠️ La baja es SIMULADA: no se borra nada y el texto no dice que los
    // datos se hayan eliminado. Ver PENDIENTE_DE_LA_BAJA en logic/cuenta.ts.
    simulado: "Baja simulada para la demostración. No se eliminó ningún dato.",
    listoTitulo: "Cerramos tu sesión",
    listoTexto:
      "En la app definitiva, acá termina el pedido de baja y soporte confirma cuándo se completó.",
    listoAccion: "Volver al ingreso",
  },
} as const;
