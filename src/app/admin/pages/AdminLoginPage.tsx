import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authRepository } from "../../../infrastructure/repositories/authRepository";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ingresando, setIngresando] = useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setIngresando(true);
      setError(null);

      await authRepository.iniciarSesion(
        email,
        password
      );

      navigate("/admin");
    } catch {
      setError(
        "Email o contraseña incorrectos."
      );
    } finally {
      setIngresando(false);
    }
  }

  return (
    <section>
      <h1>Acceso administrativo</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={ingresando}
        >
          {ingresando
            ? "Ingresando..."
            : "Ingresar"}
        </button>
      </form>
    </section>
  );
}