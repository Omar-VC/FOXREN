import { useEffect, useState } from "react";

import { categoriasRepository } from "../../../../infrastructure/repositories/categoriasRepository";

import type { Categoria } from "../../../../domain/categoria/categoria.types";

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarCategorias() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await categoriasRepository.obtenerCategorias();

      setCategorias(datos);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  }

  async function crearCategoria(
    datos: Omit<Categoria, "id">
  ) {
    try {
      setCreando(true);
      setError(null);

      await categoriasRepository.crearCategoria(datos);

      await cargarCategorias();
    } catch {
      setError("No se pudo crear la categoría.");
      throw new Error("Error al crear categoría");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  return {
    categorias,
    cargando,
    creando,
    error,
    crearCategoria,
  };
}