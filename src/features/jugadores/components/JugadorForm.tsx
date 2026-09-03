import React, { useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import type { Sexo, NivelInicial, LadoJuego, EstadoJugador } 
  from "../../../domain/jugador/jugador.types";

export const JugadorForm: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [apodo, setApodo] = useState("");
  const [dni, setDni] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sexo, setSexo] = useState<Sexo>("masculino");
  const [nivelInicial, setNivelInicial] = useState<NivelInicial>("iniciado");
  const [ladoJuego, setLadoJuego] = useState<LadoJuego>("drive");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "jugadores"), {
        nombre,
        apellido,
        apodo,
        dni,
        ciudad,
        sexo,
        nivelInicial,
        ladoJuego,
        categoriaId: "sin_categoria", // valor fijo por ahora
        estado: "pendiente" as EstadoJugador,
        fechaRegistro: Timestamp.now(),
      });

      alert("Solicitud enviada. Queda pendiente de validación.");
      setNombre("");
      setApellido("");
      setApodo("");
      setDni("");
      setCiudad("");
      setSexo("masculino");
      setNivelInicial("iniciado");
      setLadoJuego("drive");
    } catch (error) {
      console.error("Error al registrar jugador:", error);
      alert("Hubo un error al registrar el jugador.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[rgba(255,255,255,0.05)] p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold text-[var(--color-primary-light)] mb-4">
        Registro de Jugador
      </h2>

      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" required />
      <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" required />
      <input type="text" placeholder="Apodo (opcional)" value={apodo} onChange={(e) => setApodo(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" />
      <input type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" required />
      <input type="text" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white" required />

      <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <select value={nivelInicial} onChange={(e) => setNivelInicial(e.target.value as NivelInicial)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="iniciado">Iniciado</option>
        <option value="intermedio">Intermedio</option>
        <option value="avanzado">Avanzado</option>
      </select>

      <select value={ladoJuego} onChange={(e) => setLadoJuego(e.target.value as LadoJuego)} className="w-full mb-3 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
        <option value="drive">Drive</option>
        <option value="reves">Revés</option>
      </select>

      <button type="submit" className="bg-[var(--color-primary)] text-[var(--color-light)] px-4 py-2 rounded-lg hover:opacity-90">
        Registrarse
      </button>
    </form>
  );
};
