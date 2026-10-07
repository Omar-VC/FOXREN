import type { Categoria } from "./categoria.types";

export function categoriaEstaActiva(
  categoria: Categoria
): boolean {
  return categoria.estado === "activa";
}

export function categoriaEstaInactiva(
  categoria: Categoria
): boolean {
  return categoria.estado === "inactiva";
}