/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages sert des fichiers statiques : on demande a Next.js de
  // tout pre-generer en HTML/JS statique (dossier "out") plutot que de
  // s'appuyer sur un serveur Next.js a la demande, que Cloudflare Pages
  // n'utilise pas ici.
  output: "export",
};

module.exports = nextConfig;
