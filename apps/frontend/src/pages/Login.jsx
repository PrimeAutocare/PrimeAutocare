import { useState } from "react";
import { useAuth } from "../context/useAuth";
import primeLogo from "../assets/prime-logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <img src={primeLogo} alt="PrimeAutocare" className="h-16 mx-auto mb-6 object-contain" />

        {error && (
          <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded mb-4">
            {error}
          </p>
        )}

        <label className="block text-zinc-300 text-sm mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <label className="block text-zinc-300 text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
