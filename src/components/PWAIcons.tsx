// This component generates SVG icons for PWA
// These will be used as placeholders until custom icons are created

export function generateIcon(size: number) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#2563eb"/>
      <g transform="translate(${size/2}, ${size/2})">
        <!-- Graduation Cap -->
        <path d="M-${size*0.3},0 L0,-${size*0.15} L${size*0.3},0 L0,${size*0.1} Z" fill="white"/>
        <rect x="-${size*0.05}" y="0" width="${size*0.1}" height="${size*0.2}" fill="white"/>
        <circle cx="${size*0.3}" cy="-${size*0.05}" r="${size*0.03}" fill="white"/>
        <!-- Certificate -->
        <rect x="-${size*0.25}" y="${size*0.15}" width="${size*0.5}" height="${size*0.35}" rx="${size*0.02}" fill="white" opacity="0.9"/>
        <line x1="-${size*0.15}" y1="${size*0.25}" x2="${size*0.15}" y2="${size*0.25}" stroke="#2563eb" stroke-width="${size*0.015}"/>
        <line x1="-${size*0.15}" y1="${size*0.35}" x2="${size*0.15}" y2="${size*0.35}" stroke="#2563eb" stroke-width="${size*0.015}"/>
      </g>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function createPWAIcons() {
  // Generate icons as data URLs
  const icon192 = generateIcon(192);
  const icon512 = generateIcon(512);
  
  // Create a utility to download these as files if needed
  return { icon192, icon512 };
}
