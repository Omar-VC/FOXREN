import { useCallback, useEffect, useState } from "react";

import type { CuentaUsuario } from "../../../../domain/usuario/usuario.types";
import { usuariosRepository } from "../../../../infrastructure/repositories/usuariosRepository";
import {
  crearAccesoComplejo,
  enviarMailCambioPassword,
} from "../../../../application/usuarios/accesos";

export function useAccesosComplejo(complejoId: string, habilitado: boolean) {
  const [cuentas, setCuentas] = useState<CuentaUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setCuentas(await usuariosRepository.obtenerPorComplejo(complejoId));
    } catch {
      setError("No se pudieron cargar los accesos.");
    } finally {
      setCargando(false);
    }
  }, [complejoId]);

  useEffect(() => {
    if (habilitado) void Promise.resolve().then(cargar);
  }, [habilitado, cargar]);

  async function ejecutar(accion: () => Promise<void>, ok: string) {
    try {
      setTrabajando(true);
      setError(null);
      setMensaje(null);
      await accion();
      setMensaje(ok);
      return true;
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo completar la operación.");
      return false;
    } finally {
      setTrabajando(false);
    }
  }

  async function crearAcceso(email: string, password: string) {
    const creado = await ejecutar(
      () => crearAccesoComplejo(complejoId, email, password),
      "Acceso creado. Pasale el email y la contraseña a la persona.",
    );
    if (creado) await cargar();
    return creado;
  }

  async function alternarActivo(cuenta: CuentaUsuario) {
    const hecho = await ejecutar(
      () => usuariosRepository.cambiarActivo(cuenta.uid, !cuenta.activo),
      cuenta.activo ? "Acceso desactivado." : "Acceso activado.",
    );
    if (hecho) await cargar();
  }

  async function enviarMailPassword(email: string) {
    await ejecutar(
      () => enviarMailCambioPassword(email),
      `Le enviamos un mail a ${email} para que elija su contraseña.`,
    );
  }

  return { cuentas, cargando, trabajando, error, mensaje, crearAcceso, alternarActivo, enviarMailPassword };
}
