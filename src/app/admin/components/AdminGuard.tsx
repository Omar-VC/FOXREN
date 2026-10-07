import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../infrastructure/firebase/firebase";

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({
  children,
}: Props) {
  const [usuario, setUsuario] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (usuarioActual) => {
        setUsuario(!!usuarioActual);
      }
    );
  }, []);

  if (usuario === null) {
    return <p>Verificando acceso...</p>;
  }

  if (!usuario) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}