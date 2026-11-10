import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../infrastructure/firebase/firebase";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { usuariosRepository } from "../../../infrastructure/repositories/usuariosRepository";
import { FOXREN_OWNER_UID } from "../../../infrastructure/firebase/adminIdentity";
import { resolverAcceso } from "../../../domain/usuario/usuario.acceso";
import type { SesionAdmin } from "../../../domain/usuario/usuario.types";
import { SesionAdminContext } from "./SesionAdminContext";

type Estado =
  | { tipo: "verificando" }
  | { tipo: "anonimo" }
  | { tipo: "denegado" }
  | { tipo: "autorizado"; sesion: SesionAdmin };

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: "verificando" });

  useEffect(() => {
    let vigente = true;

    const cancelar = onAuthStateChanged(auth, (usuarioActual) => {
      if (!usuarioActual) {
        setEstado({ tipo: "anonimo" });
        return;
      }

      setEstado({ tipo: "verificando" });
      const uid = usuarioActual.uid;

      // El propietario no necesita documento: se resuelve sin leer Firestore.
      const perfilPromesa =
        uid === FOXREN_OWNER_UID
          ? Promise.resolve(null)
          : usuariosRepository.obtenerPerfil(uid).catch(() => null);

      void perfilPromesa.then((perfil) => {
        if (!vigente) return;
        const sesion = resolverAcceso(uid, FOXREN_OWNER_UID, perfil);
        setEstado(sesion ? { tipo: "autorizado", sesion } : { tipo: "denegado" });
      });
    });

    return () => {
      vigente = false;
      cancelar();
    };
  }, []);

  if (estado.tipo === "verificando") {
    return <p>Verificando acceso...</p>;
  }

  if (estado.tipo === "anonimo") {
    return <Navigate to="/admin/login" replace />;
  }

  if (estado.tipo === "denegado") {
    return (
      <section role="alert">
        <p>Esta cuenta no está autorizada para administrar FOXREN.</p>
        <button type="button" onClick={() => void authRepository.cerrarSesion()}>
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <SesionAdminContext.Provider value={estado.sesion}>
      {children}
    </SesionAdminContext.Provider>
  );
}
