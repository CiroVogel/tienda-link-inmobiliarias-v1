import { useState } from "react";
import { Settings } from "lucide-react";

export default function LocalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Credenciales incorrectas");
        return;
      }

      // Login OK — redirigir al admin
      window.location.href = "/admin";
    } catch {
      setError("Error de conexión. Verificá que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black flex items-center justify-center mx-auto mb-6">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-1 tracking-tight">
            Panel Admin
          </h1>
          <p className="text-xs text-black/40 uppercase tracking-widest font-bold">
            Acceso local — desarrollo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}