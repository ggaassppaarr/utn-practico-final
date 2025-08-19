import React, { useState } from "react";
import { X } from "lucide-react";

function LoginModal({ open, onClose, onLogin, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-sm p-8 bg-white shadow-lg dark:bg-gray-900 rounded-xl">
        <button
          className="absolute text-gray-400 top-3 right-3 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Iniciar sesión
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email, password); // <-- pasa email y password
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-100"
          />
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;