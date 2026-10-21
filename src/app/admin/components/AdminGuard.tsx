import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../infrastructure/firebase/firebase";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { FOXREN_OWNER_UID } from "../../../infrastructure/firebase/adminIdentity";

type EstadoAcceso = "verificando" | "anonimo" | "denegado" | "propietario";

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({
  children,
}: Props) {
  const [estado, setEstado] = useState<EstadoAcceso>("verificando");

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (usuarioActual) => {
        if (!usuarioActual) {
          setEstado("anonimo");
        } else {
          setEstado(usuarioActual.uid === FOXREN_OWNER_UID ? "propietario" : "denegado");
        }
      }
    );
  }, []);

  if (estado === "verificando") {
    return <p>Verificando acceso...</p>;
  }

  if (estado === "anonimo") {
    return <Navigate to="/admin/login" replace />;
  }

  if (estado === "denegado") {
    return (
      <section role="alert">
        <p>Esta cuenta no está autorizada para administrar FOXREN.</p>
        <button type="button" onClick={() => void authRepository.cerrarSesion()}>
          Cerrar sesión
        </button>
      </section>
    );
  }

  return <>{children}</>;
}
