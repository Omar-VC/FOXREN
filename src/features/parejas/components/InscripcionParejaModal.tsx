import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";

interface InscripcionParejaModalProps {
  competencia: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const InscripcionParejaModal: React.FC<InscripcionParejaModalProps> = ({
  competencia,
  onClose,
  onSuccess,
}) => {
  const [dni1, setDni1] = useState("");
  const [j1Existe, setJ1Existe] = useState<boolean | null>(null);
  const [nombre1, setNombre1] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [telefono1, setTelefono1] = useState("");

  const [dni2, setDni2] = useState("");
  const [j2Existe, setJ2Existe] = useState<boolean | null>(null);
  const [nombre2, setNombre2] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [telefono2, setTelefono2] = useState("");

  const [comprobantePago, setComprobantePago] = useState("");
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [loadingGuardado, setLoadingGuardado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aliasCopiado, setAliasCopiado] = useState(false);

  // Datos calculados del torneo / competencia
  const precioCalculado =
    competencia?.precioInscripcionBase ??
    competencia?.precio ??
    competencia?.costo ??
    0;

  // Busca el alias en las distintas propiedades donde pudo haber sido guardado
  const aliasPago =
    competencia?.aliasPago ||
    competencia?.alias ||
    competencia?.torneoAlias ||
    competencia?.datosPago?.alias ||
    "Sin Alias Configurado";

  const validarFormatoDNI = (dni: string) => /^\d{7,8}$/.test(dni.trim());
  const validarFormatoTel = (tel: string) => /^\d{10,13}$/.test(tel.trim());

  const copiarAlias = () => {
    navigator.clipboard.writeText(aliasPago);
    setAliasCopiado(true);
    setTimeout(() => setAliasCopiado(false), 2000);
  };

  const buscarJugadores = async () => {
    const d1 = dni1.trim();
    const d2 = dni2.trim();

    if (!validarFormatoDNI(d1) || !validarFormatoDNI(d2)) {
      setErrorMsg(
        "Ingresá números de DNI válidos (7 u 8 dígitos sin puntos ni espacios).",
      );
      return;
    }

    if (d1 === d2) {
      setErrorMsg("El Jugador 1 y el Jugador 2 no pueden tener el mismo DNI.");
      return;
    }

    setLoadingBusqueda(true);
    setErrorMsg(null);

    try {
      const q1 = query(collection(db, "jugadores"), where("dni", "==", d1));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const doc1 = snap1.docs[0].data();
        setNombre1(doc1.nombre || "");
        setApellido1(doc1.apellido || "");
        setTelefono1(doc1.telefono || "");
        setJ1Existe(true);
      } else {
        setJ1Existe(false);
      }

      const q2 = query(collection(db, "jugadores"), where("dni", "==", d2));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const doc2 = snap2.docs[0].data();
        setNombre2(doc2.nombre || "");
        setApellido2(doc2.apellido || "");
        setTelefono2(doc2.telefono || "");
        setJ2Existe(true);
      } else {
        setJ2Existe(false);
      }

      setBusquedaRealizada(true);
    } catch (err) {
      console.error("Error al consultar DNI:", err);
      setErrorMsg("Error de conexión al validar los DNI. Intentá de nuevo.");
    } finally {
      setLoadingBusqueda(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nombre1.trim() ||
      !apellido1.trim() ||
      !nombre2.trim() ||
      !apellido2.trim()
    ) {
      setErrorMsg("Completa los nombres y apellidos de ambos jugadores.");
      return;
    }

    if (
      (!j1Existe && !validarFormatoTel(telefono1)) ||
      (!j2Existe && !validarFormatoTel(telefono2))
    ) {
      setErrorMsg(
        "Ingresá números de WhatsApp válidos (mínimo 10 dígitos, ej: 2991234567).",
      );
      return;
    }

    setLoadingGuardado(true);
    setErrorMsg(null);

    try {
      const qParejas = query(
        collection(db, "parejas"),
        where("competenciaId", "==", competencia.id),
      );
      const snapParejas = await getDocs(qParejas);

      let duplicado = false;
      snapParejas.forEach((doc) => {
        const p = doc.data();
        if (
          p.jugador1?.dni === dni1.trim() ||
          p.jugador2?.dni === dni1.trim() ||
          p.jugador1?.dni === dni2.trim() ||
          p.jugador2?.dni === dni2.trim()
        ) {
          duplicado = true;
        }
      });

      if (duplicado) {
        setErrorMsg(
          "Uno o ambos jugadores ya figuran inscriptos en esta categoría.",
        );
        setLoadingGuardado(false);
        return;
      }

      if (!j1Existe) {
        await addDoc(collection(db, "jugadores"), {
          dni: dni1.trim(),
          nombre: nombre1.trim(),
          apellido: apellido1.trim(),
          telefono: telefono1.trim(),
          esVerificado: false,
          origenRegistro: "INSCRIPCION_RAPIDA",
          fechaRegistro: serverTimestamp(),
        });
      }

      if (!j2Existe) {
        await addDoc(collection(db, "jugadores"), {
          dni: dni2.trim(),
          nombre: nombre2.trim(),
          apellido: apellido2.trim(),
          telefono: telefono2.trim(),
          esVerificado: false,
          origenRegistro: "INSCRIPCION_RAPIDA",
          fechaRegistro: serverTimestamp(),
        });
      }

      await addDoc(collection(db, "parejas"), {
        competenciaId: competencia.id,
        torneoId: competencia.torneoId || competencia.id,
        categoria: competencia.categoria || competencia.nombre,
        estadoPago: comprobantePago.trim() ? "REVISION_PENDIENTE" : "PENDIENTE",
        comprobantePago: comprobantePago.trim(),
        fechaInscripcion: serverTimestamp(),
        jugador1: {
          dni: dni1.trim(),
          nombre: nombre1.trim(),
          apellido: apellido1.trim(),
          telefono: telefono1.trim(),
        },
        jugador2: {
          dni: dni2.trim(),
          nombre: nombre2.trim(),
          apellido: apellido2.trim(),
          telefono: telefono2.trim(),
        },
      });

      alert(
        "¡Inscripción registrada con éxito! El organizador revisará tu comprobante para confirmar el cupo.",
      );
      onSuccess();
    } catch (err) {
      console.error("Error al guardar inscripción:", err);
      setErrorMsg(
        "Ocurrió un error al registrar la pareja. Revisa tu conexión.",
      );
    } finally {
      setLoadingGuardado(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-white max-w-lg w-full relative shadow-2xl my-8">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="mb-5 border-b border-slate-800 pb-3 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-blue-500/20">
              Inscripción Abierta
            </span>
            <span className="text-xs text-slate-400">
              Paso {busquedaRealizada ? "2 de 2" : "1 de 2"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {competencia.categoria ||
              competencia.nombre ||
              "Inscripción de Pareja"}
          </h3>
        </div>

        {/* Banner de Valor e Información de Pago */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-medium">
              Monto por pareja:
            </span>
            <span className="text-xl font-black text-green-400">
              ${precioCalculado}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-[11px] text-slate-400 block">
                Alias para transferencia:
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 truncate block">
                {aliasPago}
              </span>
            </div>
            <button
              type="button"
              onClick={copiarAlias}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 transition shrink-0 cursor-pointer"
            >
              {aliasCopiado ? "¡Copiado! ✓" : "Copiar Alias"}
            </button>
          </div>
        </div>

        {/* Mensajes de error */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PASO 1: Validación de DNI */}
        {!busquedaRealizada ? (
          <div className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300">
              🔍 <strong>Paso 1:</strong> Ingresá los DNI de ambos integrantes
              para comprobar si ya forman parte de nuestro padrón de jugadores.
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                DNI Jugador 1 (Capitán/a)
              </label>
              <input
                type="text"
                placeholder="Ej: 38123456"
                value={dni1}
                onChange={(e) => setDni1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                DNI Jugador 2 (Compañero/a)
              </label>
              <input
                type="text"
                placeholder="Ej: 39123456"
                value={dni2}
                onChange={(e) => setDni2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={buscarJugadores}
                disabled={loadingBusqueda}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {loadingBusqueda ? "Validando DNI..." : "Verificar Jugadores →"}
              </button>
            </div>
          </div>
        ) : (
          /* PASO 2: Confirmación de Datos y Pago */
          <form onSubmit={handleSubmit} className="space-y-4">
            {(!j1Existe || !j2Existe) && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl">
                ℹ️ Uno o ambos DNI no están en el padrón. Completá sus datos
                básicos para continuar.
              </div>
            )}

            {/* Ficha Jugador 1 */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">
                  JUGADOR 1 (DNI: {dni1})
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    j1Existe
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {j1Existe ? "En Padrón ✓" : "Nuevo Registro ➕"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre1}
                    disabled={!!j1Existe}
                    onChange={(e) => setNombre1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={apellido1}
                    disabled={!!j1Existe}
                    onChange={(e) => setApellido1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  placeholder="2991234567"
                  value={telefono1}
                  disabled={!!j1Existe}
                  onChange={(e) => setTelefono1(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                />
              </div>
            </div>

            {/* Ficha Jugador 2 */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">
                  JUGADOR 2 (DNI: {dni2})
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    j2Existe
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {j2Existe ? "En Padrón ✓" : "Nuevo Registro ➕"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre2}
                    disabled={!!j2Existe}
                    onChange={(e) => setNombre2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={apellido2}
                    disabled={!!j2Existe}
                    onChange={(e) => setApellido2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  placeholder="2991234567"
                  value={telefono2}
                  disabled={!!j2Existe}
                  onChange={(e) => setTelefono2(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60 text-white"
                />
              </div>
            </div>

            {/* Referencia de Pago */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-green-400 mb-1">
                Nº de Comprobante o Transacción (Opcional)
              </label>
              <input
                type="text"
                value={comprobantePago}
                onChange={(e) => setComprobantePago(e.target.value)}
                placeholder="Ej: 9812739123 o 'Transferido desde MP'"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Si ya realizaste la transferencia al Alias, ingresá el número
                para acelerar la confirmación del organizador.
              </span>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBusquedaRealizada(false)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer transition-colors"
              >
                ← Cambiar DNI
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingGuardado}
                  className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-green-500/20"
                >
                  {loadingGuardado ? "Confirmando..." : "Confirmar e Inscribir"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
