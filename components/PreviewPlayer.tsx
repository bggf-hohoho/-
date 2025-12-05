import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Vendor, StyleType } from '../types';
import { STYLE_CONFIG } from '../constants';

interface PreviewPlayerProps {
  vendors: Vendor[];
  currentStyle: StyleType;
  showQR: boolean;
}

interface LayoutSettings {
  cols: number;
  scale: number;
  gap: string;
  qrSize: number;
  maxWidth: string;
}

// --- Reusable Components (Defined Outside) ---

// Standardized QR Wrapper for high visibility
const QRWrapper: React.FC<{ size: number; url: string; className?: string; style?: React.CSSProperties }> = ({ size, url, className, style }) => (
  <div 
    className={`bg-white p-2 rounded-lg shadow-md border border-gray-100 flex items-center justify-center shrink-0 ${className || ''}`}
    style={style}
  >
    <QRCodeSVG value={url} size={size} level="M" fgColor="#000000" />
  </div>
);

// Grid Container Helper
const GridContainer: React.FC<{ children: React.ReactNode; layout: LayoutSettings; className?: string }> = ({ children, layout, className }) => (
  <div className="w-full h-full flex items-center justify-center p-8">
    <motion.div 
      layout
      className={`grid place-items-center ${layout.gap} ${layout.maxWidth} w-full ${className || ''}`}
      style={{ 
        gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
        transform: `scale(${layout.scale})`
      }}
    >
      {children}
    </motion.div>
  </div>
);

const PreviewPlayerComponent: React.FC<PreviewPlayerProps> = ({ 
  vendors, 
  currentStyle,
  showQR
}) => {
  const styleConfig = STYLE_CONFIG[currentStyle];
  const count = vendors.length;

  // --- Smart Layout Engine ---
  const getLayoutSettings = (): LayoutSettings => {
    // Highly optimized layout settings for visibility on 16:9 screens
    if (count === 1) return { cols: 1, scale: 1.6, gap: 'gap-0', qrSize: 140, maxWidth: 'max-w-xl' };
    if (count === 2) return { cols: 2, scale: 1.35, gap: 'gap-32', qrSize: 120, maxWidth: 'max-w-6xl' };
    if (count === 3) return { cols: 3, scale: 1.15, gap: 'gap-16', qrSize: 110, maxWidth: 'max-w-7xl' };
    if (count === 4) return { cols: 2, scale: 1.1, gap: 'gap-x-32 gap-y-12', qrSize: 100, maxWidth: 'max-w-5xl' };
    if (count <= 6) return { cols: 3, scale: 1.0, gap: 'gap-x-20 gap-y-10', qrSize: 95, maxWidth: 'max-w-[1400px]' };
    if (count <= 8) return { cols: 4, scale: 0.9, gap: 'gap-x-12 gap-y-8', qrSize: 90, maxWidth: 'max-w-[1700px]' };
    if (count <= 10) return { cols: 5, scale: 0.85, gap: 'gap-x-10 gap-y-6', qrSize: 85, maxWidth: 'max-w-[1900px]' };
    
    // Fallback for very large numbers
    return { cols: 6, scale: 0.75, gap: 'gap-x-8 gap-y-6', qrSize: 75, maxWidth: 'max-w-full' };
  };

  const layout = getLayoutSettings();

  // Helper for image scaling and positioning style
  // Applied order: Translate first (move element), then Scale (grow around center)
  const imgStyle = (vendor: Vendor) => ({ 
    transform: `translate(${vendor.offsetX || 0}px, ${vendor.offsetY || 0}px) scale(${(vendor.scale || 50) / 50})` 
  });

  // --- Style Renderers ---

  const renderElegant = () => (
    <GridContainer layout={layout}>
      {vendors.map((vendor, i) => (
        <motion.div 
          key={vendor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center text-center w-full"
        >
           <div className="w-32 h-32 mb-4 rounded-full overflow-hidden shadow-xl border-4 border-white relative">
             <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
           </div>
           <h3 className="text-[#8b7355] tracking-[0.2em] uppercase text-xs mb-2 font-serif-tc">{vendor.role}</h3>
           <h1 className="text-2xl font-serif-tc text-gray-800 mb-3 truncate w-full px-2">{vendor.name}</h1>
           {showQR && <QRWrapper size={layout.qrSize} url={vendor.url} />}
           <span className="text-gray-400 text-[10px] font-medium tracking-wider mt-2">{vendor.handle.startsWith('@') ? vendor.handle : `@${vendor.handle}`}</span>
        </motion.div>
      ))}
    </GridContainer>
  );

  const renderPop = () => (
    <GridContainer layout={layout}>
       {vendors.map((vendor, i) => (
         <motion.div
           key={vendor.id}
           initial={{ scale: 0, rotate: -10 }}
           animate={{ scale: 1, rotate: i % 2 === 0 ? 2 : -2 }}
           whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
           className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center p-5 w-[260px]"
         >
            <div className="relative mb-3">
               <div className="absolute inset-0 bg-yellow-300 rounded-full translate-x-1 translate-y-1 border-2 border-black"></div>
               <div className="w-24 h-24 rounded-full border-2 border-black relative z-10 bg-gray-200 overflow-hidden">
                 <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
               </div>
            </div>
            <span className="bg-[#FF6B6B] text-white px-3 py-1 rounded-full border-2 border-black font-bold text-xs mb-2 truncate max-w-full">
              {vendor.role}
            </span>
            <h1 className="text-xl font-black text-black leading-tight mb-3 truncate w-full">{vendor.name}</h1>
            {showQR && (
              <div className="bg-blue-100 p-2 rounded-lg border-2 border-black">
                  <QRWrapper size={layout.qrSize} url={vendor.url} className="shadow-none border-none p-0 bg-transparent" />
              </div>
            )}
         </motion.div>
       ))}
    </GridContainer>
  );

  const renderRustic = () => (
    <GridContainer layout={layout}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center text-center relative overflow-hidden group w-[260px]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#4A6741]" />
            <div className="w-32 h-32 rounded-xl mb-3 overflow-hidden relative">
              <img src={vendor.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={imgStyle(vendor)} />
            </div>
            <h3 className="text-[#4A6741] text-xs font-serif tracking-widest uppercase mb-1">{vendor.role}</h3>
            <h1 className="text-gray-800 font-serif-tc font-bold text-xl mb-3 truncate w-full">{vendor.name}</h1>
            {showQR && (
              <div className="border border-gray-100 p-2 rounded-lg bg-gray-50">
                 <QRWrapper size={layout.qrSize} url={vendor.url} className="p-0 shadow-none border-none" />
              </div>
            )}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderPolaroid = () => (
    <GridContainer layout={layout}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: (i % 2 === 0 ? 2 : -2) + (Math.random() * 2 - 1) }}
            whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
            className="bg-white p-3 pb-8 shadow-lg flex flex-col items-start transition-all duration-300 w-[240px]"
          >
            <div className="w-full aspect-square bg-gray-100 mb-3 overflow-hidden relative">
                <img src={vendor.imageUrl} className="w-full h-full object-cover filter contrast-110" style={imgStyle(vendor)} />
            </div>
            <h1 className="font-handwriting text-gray-700 font-bold transform -rotate-1 truncate w-full text-left text-lg font-comic">{vendor.name}</h1>
            <p className="text-gray-400 text-xs mt-1 font-mono text-left">{vendor.role}</p>
            {showQR && (
              <div className="absolute -bottom-6 -right-4 transform rotate-6">
                 <QRWrapper size={layout.qrSize * 0.8} url={vendor.url} />
              </div>
            )}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderBoho = () => (
    <GridContainer layout={layout}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center w-[220px]"
          >
             <div className="relative p-2 border border-[#A16E5C] rounded-t-full border-b-0">
               <div className="w-32 h-40 rounded-t-[100px] rounded-b-lg overflow-hidden relative">
                 <img src={vendor.imageUrl} className="object-cover w-full h-full" style={imgStyle(vendor)} />
               </div>
             </div>
             <div className="mt-4 bg-white/60 p-3 rounded-xl w-full backdrop-blur-sm border border-white">
               <h3 className="text-[#A16E5C] text-xs tracking-widest uppercase mb-1">{vendor.role}</h3>
               <h1 className="text-[#5D4037] font-serif-tc text-lg mb-2 truncate">{vendor.name}</h1>
               {showQR && (
                 <div className="flex justify-center mt-2">
                   <QRWrapper size={layout.qrSize} url={vendor.url} className="bg-transparent shadow-none border-none p-0" />
                 </div>
               )}
             </div>
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderArtDeco = () => (
    <GridContainer layout={layout}>
        {/* Update: Desaturated colors and reduced sepia */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,#C5A582_1px,transparent_1px)] bg-[size:20px_20px]" />
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border-2 border-[#C5A582] p-1 flex flex-col items-center text-center relative w-[240px]"
          >
             <div className="border border-[#C5A582] p-4 w-full h-full flex flex-col items-center bg-[#1a1a1a]">
                <div className="w-full aspect-[3/4] overflow-hidden border border-[#C5A582] mb-3 p-1 relative">
                  <div className="w-full h-full overflow-hidden">
                    {/* Update: Reduced sepia intensity */}
                    <img src={vendor.imageUrl} className="w-full h-full object-cover sepia-[.2]" style={imgStyle(vendor)} />
                  </div>
                </div>
                <h3 className="text-[#E8DCC5] font-serif text-[10px] tracking-[0.3em] uppercase mb-1 border-b border-[#C5A582] pb-1">{vendor.role}</h3>
                <h1 className="text-[#C5A582] font-serif text-lg truncate w-full mt-1">{vendor.name}</h1>
                {showQR && (
                  <div className="mt-3">
                      <QRWrapper size={layout.qrSize} url={vendor.url} className="bg-[#C5A582] p-1" />
                  </div>
                )}
             </div>
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderComic = () => (
    <GridContainer layout={layout}>
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:8px_8px] opacity-10" />
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: i * 0.1 }}
            className="bg-white border-[4px] border-black p-4 relative shadow-[8px_8px_0px_#000] flex flex-col items-center w-[250px]"
          >
            <div className="absolute -top-3 -right-3 bg-[#F44336] text-white font-bold border-2 border-black px-2 py-1 transform rotate-12 z-10 text-xs">POW!</div>
            <div className="w-full aspect-square border-[3px] border-black mb-3 overflow-hidden relative">
              <img src={vendor.imageUrl} className="w-full h-full object-cover filter contrast-125 saturate-150" style={imgStyle(vendor)} />
            </div>
            <div className="bg-cyan-300 border-[2px] border-black w-full p-1 mb-2 transform -skew-x-6">
              <h3 className="text-black font-black text-xs uppercase text-center transform skew-x-6">{vendor.role}</h3>
            </div>
            <h1 className="font-black text-xl uppercase italic tracking-tighter truncate w-full text-center">{vendor.name}</h1>
            {showQR && (
              <div className="mt-3 border-2 border-black p-1 bg-yellow-300">
                 <QRWrapper size={layout.qrSize} url={vendor.url} className="shadow-none border-none p-0 bg-transparent" />
              </div>
            )}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderWatercolor = () => (
    <GridContainer layout={layout}>
         <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/watercolor.png')]"></div>
         {vendors.map((vendor, i) => (
           <motion.div
             key={vendor.id}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: i * 0.15 }}
             className="relative flex flex-col items-center text-center w-[240px]"
           >
             <div className="relative mb-3">
               <div className="absolute inset-0 bg-pink-200/50 rounded-[40%_60%_70%_30%/50%_60%_30%_60%] blur-xl transform scale-110"></div>
               <div className="relative w-32 h-32 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-lg border-2 border-white overflow-hidden">
                 <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
               </div>
             </div>
             <h3 className="font-serif text-[#8EA6D1] italic text-sm mb-1">{vendor.role}</h3>
             <h1 className="font-serif text-[#555] text-xl mb-2">{vendor.name}</h1>
             {showQR && (
               <div className="bg-white/80 p-2 rounded-xl shadow-sm border border-pink-100">
                 <QRWrapper size={layout.qrSize} url={vendor.url} className="bg-transparent shadow-none border-none p-0" />
               </div>
             )}
           </motion.div>
         ))}
    </GridContainer>
  );

  const renderAnime = () => (
    <GridContainer layout={layout}>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,white_0deg,transparent_5deg,white_10deg,transparent_15deg,white_20deg,transparent_25deg,white_30deg)] opacity-10"></div>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
            className="relative border-4 border-black p-3 bg-white w-[250px]"
            style={{ transform: `rotate(${i % 2 === 0 ? '1deg' : '-1deg'})`, boxShadow: '8px 8px 0 black' }}
          >
            <div className="absolute -top-3 -left-3 bg-red-600 text-white font-black px-2 py-1 text-xs border-2 border-black z-10">NO.{i+1}</div>
            <div className="w-full aspect-square border-2 border-black mb-2 overflow-hidden relative">
              <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
            </div>
            <h3 className="text-black font-black text-sm italic uppercase">{vendor.role}</h3>
            <h1 className="text-3xl font-black text-black leading-none mb-2" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 0 #eee' }}>{vendor.name}</h1>
            {showQR && (
              <div className="border-2 border-black p-1 inline-block bg-white">
                  <QRWrapper size={layout.qrSize} url={vendor.url} className="shadow-none border-none p-0" />
              </div>
            )}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderIOS = () => (
    <GridContainer layout={layout}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm flex flex-col items-center text-center w-[240px]"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-sm relative">
              <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
            </div>
            <h1 className="text-black font-semibold text-lg mb-0.5 truncate w-full">{vendor.name}</h1>
            <h3 className="text-[#8E8E93] text-xs mb-3">{vendor.role}</h3>
            <div className="bg-[#007AFF] text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">Follow</div>
            {showQR && <QRWrapper size={layout.qrSize} url={vendor.url} className="shadow-none bg-transparent" />}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderStarbucks = () => (
    <GridContainer layout={layout}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center w-[220px]"
          >
             <div className="p-1 border-2 border-[#00704A] rounded-full mb-3">
               <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden relative">
                 <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
               </div>
             </div>
             <h1 className="text-[#1E3932] font-bold text-lg mb-1 tracking-tight truncate w-full">{vendor.name}</h1>
             <h3 className="text-[#00704A] text-xs uppercase font-bold tracking-widest mb-3">{vendor.role}</h3>
             {showQR && <QRWrapper size={layout.qrSize} url={vendor.url} className="bg-white border-[#00704A]" />}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderWabiSabi = () => (
    <GridContainer layout={layout}>
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
         {vendors.map((vendor, i) => (
           <motion.div
             key={vendor.id}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: i * 0.1 }}
             className="flex flex-col items-center relative z-10 w-[240px]"
           >
             <div className="overflow-hidden rounded-[30%_70%_70%_30%/30%_30%_70%_70%] mb-4 w-full aspect-square relative">
               <img src={vendor.imageUrl} className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" style={imgStyle(vendor)} />
             </div>
             <h3 className="text-[#786C5E] font-serif italic text-sm mb-1">{vendor.role}</h3>
             <h1 className="text-[#4A4036] font-serif text-2xl mb-3 tracking-wide truncate w-full text-center">{vendor.name}</h1>
             {/* Update: Changed QR container to rounded-lg square background */}
             {showQR && (
               <div className="p-2 border border-[#786C5E] rounded-lg bg-white/40 backdrop-blur-sm overflow-hidden">
                   <QRWrapper size={layout.qrSize} url={vendor.url} className="bg-transparent shadow-none border-none p-0" />
               </div>
             )}
           </motion.div>
         ))}
    </GridContainer>
  );

  const renderKawaii = () => (
    <GridContainer layout={layout}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 200, delay: i * 0.1 }}
            className="bg-white rounded-[2rem] p-4 shadow-[0_4px_0_#FFB6C1] border-2 border-[#FFB6C1] flex flex-col items-center text-center w-[230px]"
          >
             <div className="w-24 h-24 rounded-full border-4 border-[#FF69B4] mb-2 overflow-hidden relative">
               <img src={vendor.imageUrl} className="w-full h-full object-cover" style={imgStyle(vendor)} />
             </div>
             <div className="bg-[#FF69B4] text-white text-xs px-3 py-1 rounded-full mb-2">♥ {vendor.role} ♥</div>
             <h1 className="text-[#555] font-bold text-lg mb-3 truncate w-full">{vendor.name}</h1>
             {showQR && (
               <div className="bg-[#FFEFF5] p-2 rounded-xl border border-[#FF69B4]">
                   <QRWrapper size={layout.qrSize} url={vendor.url} className="shadow-none border-none p-0 bg-transparent" />
               </div>
             )}
          </motion.div>
        ))}
    </GridContainer>
  );

  const renderContent = () => {
    switch (currentStyle) {
      case StyleType.ELEGANT_MINIMAL: return renderElegant();
      case StyleType.PLAYFUL_POP: return renderPop();
      case StyleType.RUSTIC_GARDEN: return renderRustic();
      case StyleType.VINTAGE_POLAROID: return renderPolaroid();
      case StyleType.BOHO_CHIC: return renderBoho();
      case StyleType.ART_DECO: return renderArtDeco();
      case StyleType.COMIC_POP: return renderComic();
      case StyleType.WATERCOLOR_DREAM: return renderWatercolor();
      case StyleType.ANIME_MANGA: return renderAnime();
      case StyleType.IOS_MODERN: return renderIOS();
      case StyleType.COFFEE_HOUSE: return renderStarbucks();
      case StyleType.WABI_SABI: return renderWabiSabi();
      case StyleType.CUTE_KAWAII: return renderKawaii();
      default: return <div>Unknown</div>;
    }
  };

  return (
    <div className={`w-full h-full relative ${styleConfig.bg} ${styleConfig.text} transition-colors duration-500 overflow-hidden`}>
      <AnimatePresence mode='wait'>
         {renderContent()}
      </AnimatePresence>
      
      {/* Footer Credit */}
      <a 
        href="https://www.instagram.com/bgg.feng/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-sans font-medium opacity-40 hover:opacity-100 transition-opacity z-50 mix-blend-difference text-white"
        style={{ textShadow: '0 0 2px rgba(0,0,0,0.2)' }}
      >
        AI Studio & Code By 小豐｜婚禮主持aka喜劇受害人 (@Bgg.Feng)
      </a>
    </div>
  );
};

export const PreviewPlayer = React.memo(PreviewPlayerComponent);