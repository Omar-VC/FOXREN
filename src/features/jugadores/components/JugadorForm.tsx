import React, { useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import type { Sexo, NivelInicial, LadoJuego, EstadoJugador } 
  from "../../../domain/jugador/jugador.types";

export const JugadorForm: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [apodo, setApodo] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState(""); // 👈 Nuevo estado obligatorio para contacto
  const [ciudad, setCiudad] = useState("");
  const [sexo, setSexo] = useState<Sexo>("masculino");
  const [nivelInicial, setNivelInicial] = useState<NivelInicial>("iniciado");
  const [ladoJuego, setLadoJuego] = useState<LadoJuego>("drive");
  const [categoriaDeclarada, setCategoriaDeclarada] = useState("sexta");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Sanitización de inputs
    const dniLimpio = dni.replace(/\D/g, "").trim();
    const telefonoLimpio = telefono.replace(/\D/g, "").trim();
    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();

    if (!dniLimpio || dniLimpio.length < 7) {
      alert("Por favor ingresa un DNI válido (mínimo 7 dígitos).");
      return;
    }

    if (!telefonoLimpio || telefonoLimpio.length < 8) {
      alert("Por favor ingresa un número de teléfono/WhatsApp válido para contacto.");
      return;
    }

    setLoading(true);

    try {
      // 2. VALIDACIÓN CRÍTICA: Verificar DNI duplicado en Firestore
      const qDni = query(
        collection(db, "jugadores"),
        where("dni", "==", dniLimpio)
      );
      const snapDni = await getDocs(qDni);

      if (!snapDni.empty) {
        alert("⚠️ Ya existe un jugador registrado con este DNI en el sistema.");
        setLoading(false);
        return;
      }

      // 3. Guardado en Firestore con el campo teléfono incluido
      await addDoc(collection(db, "jugadores"), {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        nombreCompleto: `${nombreLimpio} ${apellidoLimpio}`,
        apodo: apodo.trim(),
        dni: dniLimpio,
        telefono: telefonoLimpio, // 👈 Se guarda el número de teléfono
        ciudad: ciudad.trim(),
        sexo,
        nivelInicial,
        ladoJuego,
        categoriaDeclarada,
        categoriaId: "sin_categoria",
        estado: "pendiente" as EstadoJugador,
        fechaRegistro: Timestamp.now(),
      });

      alert("Solicitud enviada. Queda pendiente de validación.");
      setNombre("");
      setApellido("");
      setApodo("");
      setDni("");
      setTelefono("");
      setCiudad("");
      setSexo("masculino");
      setNivelInicial("iniciado");
      setLadoJuego("drive");
      setCategoriaDeclarada("sexta");
    } catch (error) {
      console.error("Error al registrar jugador:", error);
      alert("Hubo un error al registrar el jugador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[rgba(255,255,255,0.05)] p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold text-[var(--color-primary-light)] mb-4">
        Registro de Jugador
      </h2>

      <input 
        type="text" 
        placeholder="Nombre" 
        value={nombre} 
        onChange={(e) => setNombre(e.target.value)} 
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
        required 
      />

      <input 
        type="text" 
        placeholder="Apellido" 
        value={apellido} 
        onChange={(e) => setApellido(e.target.value)} 
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
        required 
      />

      <input 
        type="text" 
        placeholder="Apodo (opcional)" 
        value={apodo} 
        onChange={(e) => setApodo(e.target.value)} 
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
      />

      {/* Input DNI sanitizado (solo dígitos) */}
      <input 
        type="text" 
        placeholder="DNI (Sin puntos)" 
        value={dni} 
        onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))} 
        maxLength={8}
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
        required 
      />

      {/* Input Teléfono (Nuevo) */}
      <input 
        type="text" 
        placeholder="Teléfono / WhatsApp (Ej: 2994630150)" 
        value={telefono} 
        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} 
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
        required 
      />

      <input 
        type="text" 
        placeholder="Ciudad" 
        value={ciudad} 
        onChange={(e) => setCiudad(e.target.value)} 
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" 
        required 
      />

      <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="masculino" className="bg-slate-900 text-white">Masculino</option>
        <option value="femenino" className="bg-slate-900 text-white">Femenino</option>
      </select>

      <select value={nivelInicial} onChange={(e) => setNivelInicial(e.target.value as NivelInicial)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="iniciado" className="bg-slate-900 text-white">Iniciado</option>
        <option value="intermedio" className="bg-slate-900 text-white">Intermedio</option>
        <option value="avanzado" className="bg-slate-900 text-white">Avanzado</option>
      </select>

      <select value={ladoJuego} onChange={(e) => setLadoJuego(e.target.value as LadoJuego)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="drive" className="bg-slate-900 text-white">Drive</option>
        <option value="reves" className="bg-slate-900 text-white">Revés</option>
      </select>

      <select
        value={categoriaDeclarada}
        onChange={(e) => setCategoriaDeclarada(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
      >
        <option value="primera" className="bg-slate-900 text-white">Primera</option>
        <option value="segunda" className="bg-slate-900 text-white">Segunda</option>
        <option value="tercera" className="bg-slate-900 text-white">Tercera</option>
        <option value="cuarta" className="bg-slate-900 text-white">Cuarta</option>
        <option value="quinta" className="bg-slate-900 text-white">Quinta</option>
        <option value="sexta" className="bg-slate-900 text-white">Sexta</option>
        <option value="septima" className="bg-slate-900 text-white">Séptima</option>
        <option value="octava" className="bg-slate-900 text-white">Octava</option>
      </select>

      <button 
        type="submit" 
        disabled={loading}
        className="bg-[var(--color-primary)] text-[var(--color-light)] px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 w-full font-semibold cursor-pointer"
      >
        {loading ? "Verificando y Registrando..." : "Registrarse"}
      </button>
    </form>
  );
};