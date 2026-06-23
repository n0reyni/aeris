"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeToken, getToken } from "../lib/api";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!getToken());
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-blue-900 text-white shadow-md">
      <span className="text-2xl font-bold tracking-wide">AERIS</span>
      <div className="flex gap-6 items-center">
        <Link href="/ia" className="hover:text-blue-300 transition">IA</Link>
        {isLogged && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded transition"
          >
            Déconnexion
          </button>
        )}
        {!isLogged && (
          <Link href="/login" className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded transition">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}