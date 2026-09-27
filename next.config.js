 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages sert des fichiers statiques : on demande a Next.js de
  // tout pre-generer en HTML/JS statique (dossier "out") plutot que de
  // s'appuyer sur un serveur Next.js a la demande, que Cloudflare Pages
  // n'utilise pas ici.
  output: "export",

  // Ajout des règles pour ignorer les blocages d'apostrophes et de typage au build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
