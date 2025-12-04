import { Vendor, StyleType } from '../types';
import { renderToString } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

// Render QR code to base64 string with high resolution and margin
const renderQR = (url: string) => {
  const qrString = renderToString(
    React.createElement(QRCodeSVG, { 
      value: url, 
      size: 256, // High resolution for print/large screens
      level: 'M', 
      includeMargin: true,
      fgColor: '#000000',
      bgColor: '#ffffff'
    })
  );
  return `data:image/svg+xml;base64,${btoa(qrString)}`;
};

export const generateStaticHTML = (vendors: Vendor[], style: StyleType): string => {
  const vendorsWithQR = vendors.map(v => ({
    ...v,
    qrDataUri: renderQR(v.url),
    displayHandle: v.handle.startsWith('@') ? v.handle : `@${v.handle}`
  }));

  const count = vendors.length;
  
  // Common QR styles ensuring visibility
  const commonCSS = `
    .qr-wrap { 
      background: white; 
      padding: 8px; 
      border-radius: 8px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      display: inline-block; 
      margin-top: 10px;
      line-height: 0;
    }
    .qr-img { 
      width: ${count === 1 ? '120px' : '80px'}; 
      height: ${count === 1 ? '120px' : '80px'}; 
      display: block;
    }
    /* Scale adjustments for large counts */
    @media (min-width: 1200px) {
       .qr-img { width: ${count > 6 ? '60px' : (count === 1 ? '120px' : '80px')}; height: ${count > 6 ? '60px' : (count === 1 ? '120px' : '80px')}; }
    }
    /* Fullscreen Button Style */
    #fs-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s, transform 0.2s;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    #fs-btn:hover { background: rgba(0, 0, 0, 0.8); transform: scale(1.1); }
    #fs-btn svg { width: 24px; height: 24px; fill: white; }
  `;

  let styleCSS = '';
  let contentHTML = '';

  // Helper to generate grid items
  const renderCards = (cardContentFn: (v: any, i: number) => string, containerClass = 'container', cardClass = 'card') => `
    <div class="${containerClass}">
      ${vendorsWithQR.map((v, i) => `
        <div class="${cardClass}" style="animation-delay: ${i * 0.1}s">
          ${cardContentFn(v, i)}
        </div>
      `).join('')}
    </div>
  `;

  const qrHtml = (v: any) => `<div class="qr-wrap"><img src="${v.qrDataUri}" class="qr-img" /></div>`;

  switch (style) {
    case StyleType.ELEGANT_MINIMAL:
      styleCSS = `
        body { background-color: #f8f5f2; color: #4a4a4a; font-family: 'Noto Serif TC', serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .container { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 4rem; width: 90%; }
        .card { display: flex; flex-direction: column; align-items: center; text-align: center; width: 250px; animation: fadeIn 1s ease-out backwards; }
        .avatar { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); mb: 1rem; }
        h1 { font-size: 1.8rem; margin: 1rem 0 0.5rem; font-weight: 400; color: #2c2c2c; }
        h2 { font-size: 0.9rem; color: #8b7355; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; }
        .handle { font-family: 'Noto Sans TC'; font-size: 0.8rem; margin-top: 0.5rem; color: #999; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `;
      contentHTML = renderCards(v => `
        <img src="${v.imageUrl}" class="avatar" />
        <h2>${v.role}</h2>
        <h1>${v.name}</h1>
        ${qrHtml(v)}
        <div class="handle">${v.displayHandle}</div>
      `);
      break;

    case StyleType.PLAYFUL_POP:
      styleCSS = `body { background: #FFDEE9; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; }
      .card { background: white; border: 3px solid black; padding: 1.5rem; box-shadow: 8px 8px 0 black; width: 260px; text-align: center; border-radius: 0; }
      .img { width: 100px; height: 100px; border-radius: 50%; border: 2px solid black; object-fit: cover; background: #eee; margin-bottom: 10px; }
      .badge { background: #FF6B6B; color: white; padding: 4px 12px; border: 2px solid black; border-radius: 20px; font-weight: bold; font-size: 0.8rem; display: inline-block; margin-bottom: 8px; }
      h1 { font-weight: 900; font-size: 1.5rem; margin: 0 0 10px 0; }
      .qr-wrap { background: #E3F2FD; border: 2px solid black; box-shadow: none; border-radius: 8px; }
      `;
      contentHTML = renderCards(v => `
        <img src="${v.imageUrl}" class="img" />
        <br><span class="badge">${v.role}</span>
        <h1>${v.name}</h1>
        ${qrHtml(v)}
      `);
      break;

    case StyleType.MODERN_GRID:
      styleCSS = `body { background: #f0f2f5; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: grid; grid-template-columns: repeat(${count === 8 ? 4 : (count > 4 ? 3 : Math.min(count, 3))}, 1fr); gap: 2rem; width: 90%; max-width: 1400px; }
      .card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; display: flex; flex-direction: column; align-items: center; }
      .img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem; }
      h3 { color: #2563eb; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin: 0; }
      h1 { font-size: 1.2rem; margin: 5px 0 15px 0; color: #1f2937; }
      `;
      contentHTML = renderCards(v => `
        <img src="${v.imageUrl}" class="img" />
        <h3>${v.role}</h3>
        <h1>${v.name}</h1>
        ${qrHtml(v)}
      `);
      break;

    case StyleType.RUSTIC_GARDEN:
      styleCSS = `body { background: #F0F4F1; font-family: serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; }
      .card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 260px; text-align: center; position: relative; overflow: hidden; }
      .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 5px; background: #4A6741; }
      .img { width: 120px; height: 120px; border-radius: 12px; object-fit: cover; margin-bottom: 12px; margin-top: 10px; }
      h3 { color: #4A6741; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
      h1 { color: #2d3748; font-size: 1.4rem; margin: 5px 0 15px 0; }
      `;
      contentHTML = renderCards(v => `
        <div class="top-bar"></div>
        <img src="${v.imageUrl}" class="img" />
        <h3>${v.role}</h3>
        <h1>${v.name}</h1>
        ${qrHtml(v)}
      `);
      break;
    
    case StyleType.LUXURY_MARBLE:
      styleCSS = `body { background: #fff; font-family: serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; }
      .card { border: 1px solid rgba(212, 175, 55, 0.3); outline: 1px solid rgba(212, 175, 55, 0.3); outline-offset: 4px; padding: 2rem; width: 260px; text-align: center; display: flex; flex-direction: column; align-items: center; }
      .img { width: 100px; height: 100px; object-fit: cover; border: 1px solid #D4AF37; padding: 4px; margin-bottom: 1rem; }
      h3 { color: #D4AF37; letter-spacing: 0.2em; font-size: 0.7rem; margin: 0; }
      h1 { font-size: 1.4rem; margin: 0.5rem 0 1rem 0; color: #111; }
      `;
      contentHTML = renderCards(v => `<img src="${v.imageUrl}" class="img" /><h3>${v.role}</h3><h1>${v.name}</h1>${qrHtml(v)}`);
      break;

    case StyleType.VINTAGE_POLAROID:
      styleCSS = `body { background: #E8E6E1; font-family: cursive; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; }
      .card { background: white; padding: 12px 12px 40px 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 240px; transform: rotate(-1deg); display: flex; flex-direction: column; align-items: flex-start; }
      .img { width: 100%; aspect-ratio: 1; object-fit: cover; background: #eee; margin-bottom: 10px; filter: contrast(1.1); }
      h1 { font-size: 1.2rem; color: #333; margin: 0; }
      p { color: #666; font-size: 0.8rem; margin: 0; }
      .qr-wrap { position: absolute; bottom: -20px; right: -10px; transform: rotate(5deg); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      `;
      contentHTML = renderCards((v, i) => `
        <div style="transform: rotate(${i%2===0?2:-2}deg); width:100%; text-align:left;">
        <img src="${v.imageUrl}" class="img" />
        <h1>${v.name}</h1>
        <p>${v.role}</p>
        ${qrHtml(v)}
        </div>
      `);
      break;
      
    case StyleType.ANIME_MANGA:
      styleCSS = `body { background: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
      .bg-lines { position: absolute; inset: 0; background: conic-gradient(from 0deg at 50% 50%, white 0deg, transparent 5deg, white 10deg, transparent 15deg); opacity: 0.1; z-index: -1; }
      .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; }
      .card { border: 4px solid black; padding: 1rem; background: white; box-shadow: 10px 10px 0 black; width: 240px; position: relative; display: flex; flex-direction: column; align-items: center; }
      .badge { position: absolute; top: -10px; left: -10px; background: red; color: white; padding: 4px 8px; border: 2px solid black; font-weight: bold; }
      .img { width: 100%; aspect-ratio: 1; object-fit: cover; border: 2px solid black; margin-bottom: 0.5rem; }
      h1 { font-size: 1.5rem; font-weight: 900; margin: 0; line-height: 1; text-shadow: 2px 2px 0 #eee; text-align: center; }
      h3 { font-size: 1rem; font-style: italic; font-weight: 900; margin-bottom: 0.2rem; text-align: center; }
      .qr-wrap { border: 2px solid black; box-shadow: none; }
      `;
      contentHTML = renderCards((v,i) => `<div class="badge">NO.${i+1}</div><img src="${v.imageUrl}" class="img" /><h3>${v.role}</h3><h1>${v.name}</h1>${qrHtml(v)}`);
      break;

    case StyleType.IOS_MODERN:
      styleCSS = `body { background: #F2F2F7; font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; }
      .card { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); border-radius: 24px; padding: 20px; width: 220px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; }
      .img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; }
      h1 { font-size: 1.2rem; font-weight: 600; margin: 0 0 4px 0; color: #000; }
      h3 { font-size: 0.9rem; color: #8E8E93; margin: 0 0 16px 0; font-weight: 400; }
      .btn { background: #007AFF; color: white; padding: 6px 16px; border-radius: 99px; font-size: 0.8rem; font-weight: 500; display: inline-block; margin-bottom: 12px; }
      `;
      contentHTML = renderCards(v => `<img src="${v.imageUrl}" class="img" /><h1>${v.name}</h1><h3>${v.role}</h3><div class="btn">Follow</div>${qrHtml(v)}`);
      break;

    case StyleType.MUJI_SIMPLE:
      styleCSS = `body { background: #EFEBE9; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; color: #444; }
      .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem; }
      .card { width: 240px; border-top: 1px solid #7F0019; padding-top: 1rem; display: flex; flex-direction: column; align-items: flex-start; }
      .img { width: 100%; aspect-ratio: 4/3; object-fit: cover; filter: grayscale(20%); margin-bottom: 0.8rem; }
      h3 { color: #7F0019; font-size: 0.7rem; font-weight: bold; margin: 0 0 4px 0; }
      h1 { font-size: 1.1rem; font-weight: bold; margin: 0 0 4px 0; color: #333; }
      p { font-size: 0.7rem; color: #666; margin: 0 0 10px 0; }
      .qr-wrap { padding: 4px; border: 1px solid #ddd; }
      `;
      contentHTML = renderCards(v => `<img src="${v.imageUrl}" class="img" /><h3>${v.role}</h3><h1>${v.name}</h1>${qrHtml(v)}`);
      break;

    default:
      // Generic fallback
      styleCSS = `body { background: #f3f4f6; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
      .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; }
      .card { background: white; padding: 20px; border-radius: 12px; width: 240px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
      h1 { font-size: 1.2rem; margin: 0; }
      h3 { font-size: 0.9rem; color: #666; }
      `;
      contentHTML = renderCards(v => `<img src="${v.imageUrl}" class="img" /><h3>${v.role}</h3><h1>${v.name}</h1>${qrHtml(v)}`);
      break;
  }

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Vendors - ${style}</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Noto+Serif+TC:wght@400;700&family=Comic+Neue:wght@700&family=Courier+Prime&display=swap" rel="stylesheet">
    <style>
      ${commonCSS}
      ${styleCSS}
    </style>
</head>
<body>
    <button id="fs-btn" onclick="toggleFullScreen()" title="全螢幕/退出全螢幕">
        <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
    </button>
    ${contentHTML}
    <script>
      function toggleFullScreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    </script>
</body>
</html>
  `.trim();
}