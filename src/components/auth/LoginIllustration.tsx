/**
 * Illustration d'entrepôt (rayonnages + cartons + palettes), dessinée en SVG
 * pour ce projet — pas une photo tierce : pas de droit d'auteur à gérer, pas
 * de dépendance à une URL externe, et léger (quelques Ko) pour les connexions
 * lentes. Peut être remplacée plus tard par une vraie photo de vos entrepôts
 * (mettez-la dans public/ et utilisez-la en background-image à la place).
 */
export default function LoginIllustration() {
  const crate = (x: number, y: number, w: number, h: number, shade = 0) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={`rgba(255,255,255,${0.16 + shade})`} />
      <rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0954F" />
          <stop offset="55%" stopColor="#E07B39" />
          <stop offset="100%" stopColor="#B5561F" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
        </linearGradient>
      </defs>

      <rect width="800" height="900" fill="url(#bg)" />

      {/* Lumières de plafond */}
      {[120, 330, 540, 750].map((x) => (
        <rect key={x} x={x - 45} y="40" width="90" height="8" rx="4" fill="rgba(255,255,255,0.45)" />
      ))}

      {/* Rayonnage 1 (gauche) */}
      <g>
        <rect x="40" y="160" width="6" height="560" fill="rgba(255,255,255,0.55)" />
        <rect x="290" y="160" width="6" height="560" fill="rgba(255,255,255,0.55)" />
        {[250, 400, 550].map((y) => (
          <rect key={y} x="40" y={y} width="256" height="8" fill="rgba(255,255,255,0.6)" />
        ))}
        {crate(58, 178, 70, 72)}
        {crate(136, 190, 66, 60, 0.05)}
        {crate(210, 174, 72, 76)}
        {crate(58, 330, 90, 70, 0.04)}
        {crate(158, 342, 60, 58)}
        {crate(226, 326, 58, 74, 0.06)}
        {crate(70, 480, 74, 70)}
        {crate(152, 492, 66, 58, 0.05)}
        {crate(226, 476, 58, 74)}
      </g>

      {/* Rayonnage 2 (droite) */}
      <g>
        <rect x="470" y="160" width="6" height="560" fill="rgba(255,255,255,0.55)" />
        <rect x="740" y="160" width="6" height="560" fill="rgba(255,255,255,0.55)" />
        {[250, 400, 550].map((y) => (
          <rect key={y} x="470" y={y} width="276" height="8" fill="rgba(255,255,255,0.6)" />
        ))}
        {crate(488, 186, 84, 64, 0.05)}
        {crate(582, 172, 70, 78)}
        {crate(662, 190, 68, 60, 0.04)}
        {crate(490, 336, 66, 64)}
        {crate(566, 322, 96, 78, 0.06)}
        {crate(672, 340, 58, 60)}
        {crate(492, 480, 92, 70, 0.04)}
        {crate(594, 492, 64, 58)}
        {crate(668, 478, 62, 72, 0.06)}
      </g>

      {/* Allée centrale + sol */}
      <polygon points="296,720 470,720 560,900 206,900" fill="rgba(255,255,255,0.10)" />
      <rect y="720" width="800" height="180" fill="url(#floor)" />

      {/* Palette + cartons au sol */}
      <g>
        <rect x="330" y="800" width="140" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
        {crate(338, 748, 60, 52, 0.06)}
        {crate(404, 758, 58, 42)}
      </g>
    </svg>
  );
}
