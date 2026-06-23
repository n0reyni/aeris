import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-5xl font-bold text-blue-900 mb-4">Bienvenue sur AERIS</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-xl">
        Plateforme intelligente de gestion et de surveillance de la qualité de l'air
        au Sénégal — Diamniadio, Bargny, Sébikotane.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Créer un compte
        </Link>
        <Link
          href="/login"
          className="border border-blue-900 text-blue-900 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}