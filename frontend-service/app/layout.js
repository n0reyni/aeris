import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "AERIS - Qualité de l'air",
  description: "Plateforme de gestion de la qualité de l'air",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}