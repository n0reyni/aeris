"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link"; // Importation du composant Link de Next.js
import { X, Menu } from "lucide-react";
import { removeToken, getToken } from "../lib/api";

export default function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Vérifie le token à chaque changement de page (pathname)
  useEffect(() => {
    setIsLogged(!!getToken());
  }, [pathname]);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    setIsLogged(false);
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5 shadow-md">
      <div className="flex items-center space-x-6">
        {/* Mobile menu toggle */}
        <button onClick={() => setIsNavOpen(!isNavOpen)} className="md:hidden">
          {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand name */}
        <h1
          className={`text-2xl font-extrabold tracking-wide ${
            isLogged ? "cursor-default text-gray-900" : "cursor-pointer text-blue-900"
          }`}
          onClick={() => {
            if (!isLogged) router.push("/");
          }}
        >
          AERIS
        </h1>
      </div>

      {/* Desktop Navigation */}
      {isLogged ? (
        <nav className="hidden space-x-8 md:flex">
          <Link href="/dashboard" className="text-lg font-medium text-gray-700 hover:text-black">
            Tableau de bord
          </Link>
          <Link href="/ia" className="text-lg font-medium text-gray-700 hover:text-black">
            Discussion IA
          </Link>
          <Link href="/carte" className="text-lg font-medium text-gray-700 hover:text-black">
            Carte des zones
          </Link>
          <button onClick={handleLogout} className="text-lg font-medium text-red-600 hover:text-red-800">
            Déconnexion
          </button>
        </nav>
      ) : (
        <nav className="hidden space-x-8 md:flex">
          <Link href="/login" className="text-lg font-medium text-gray-700 hover:text-black">
            Se connecter
          </Link>
        </nav>
      )}

      {/* Mobile Menu */}
      {isNavOpen && (
        <nav className="absolute left-0 top-16 flex w-full flex-col space-y-4 bg-white p-5 shadow-md md:hidden">
          {isLogged ? (
            <>
              <Link href="/ia" className="text-lg font-medium text-gray-700 hover:text-black">
                IA
              </Link>
              <Link href="/dashboard" className="text-lg font-medium text-gray-700 hover:text-black">
                Tableau de bord
              </Link>
              <Link href="/carte" className="text-lg font-medium text-gray-700 hover:text-black">
                Carte des zones
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-lg font-medium text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className="text-lg font-medium text-gray-700 hover:text-black">
              Connexion
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
