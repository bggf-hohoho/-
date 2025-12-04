import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Monitor, CheckCircle, 
  Palette, X
} from 'lucide-react';
import { PreviewPlayer } from './components/PreviewPlayer';
import { VendorForm } from './components/VendorForm';
import { INITIAL_VENDORS, STYLE_CONFIG } from './constants';
import { StyleType, Vendor } from './types';
import { generateStaticHTML } from './utils/exportUtils';

const App: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [currentStyle, setCurrentStyle] = useState<StyleType>(StyleType.ELEGANT_MINIMAL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setShowControls(true); // Show initially
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Handle auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      
      // Hide after 3 seconds of inactivity
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Initial trigger
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  const handleDownload = () => {
    // Generate an HTML file for ALL vendors
    const htmlContent = generateStaticHTML(vendors, currentStyle);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-card-list-${currentStyle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If Fullscreen, show minimal UI
  if (isFullscreen) {
    return (
      <div className="w-screen h-screen bg-black group relative overflow-hidden cursor-none hover:cursor-default">
        <PreviewPlayer 
          vendors={vendors}
          currentStyle={currentStyle}
        />
        {/* Floating Close Button for fullscreen - Shows on mouse move */}
        <button 
           onClick={() => document.exitFullscreen().then(()=>setIsFullscreen(false))} 
           className={`fixed top-6 right-6 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all duration-500 z-50 transform hover:scale-110 shadow-2xl border border-white/10 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}
           title="退出全螢幕"
        >
           <X size={28} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Sidebar: Configuration */}
      <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <span className="text-blue-600">Wedding</span>Cards
          </h1>
          <p className="text-sm text-gray-500 mt-1">廠商名單產生器</p>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <VendorForm vendors={vendors} setVendors={setVendors} />
        </div>
      </div>

      {/* Main Area: Preview & Styles */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 font-medium">
               共 {vendors.length} 位廠商
             </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleFullscreen} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
              <Monitor size={18} />
              <span className="text-sm font-medium">全螢幕預覽</span>
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg shadow-gray-200/50">
              <Download size={18} />
              <span className="text-sm font-medium">下載 HTML</span>
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 bg-gray-200 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full max-w-6xl aspect-video bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-300 ring-4 ring-white relative group">
             <PreviewPlayer 
               vendors={vendors}
               currentStyle={currentStyle}
             />
          </div>
        </div>

        {/* Style Selector Footer */}
        <div className="h-48 bg-white border-t border-gray-200 shrink-0 flex flex-col">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-500 font-medium">
             <Palette size={16} /> 選擇風格模板
          </div>
          <div className="flex-1 overflow-x-auto flex items-center gap-6 px-8 p-4">
             {Object.entries(STYLE_CONFIG).map(([key, config]) => {
               // TypeScript hint: config has label, subLabel, etc.
               const conf = config as any; 
               return (
                 <button
                   key={key}
                   onClick={() => setCurrentStyle(key as StyleType)}
                   className={`relative group flex-shrink-0 w-48 h-28 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left p-4 flex flex-col justify-between ${currentStyle === key ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105 shadow-xl' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
                 >
                   {/* Mini Preview Mockups - Removed opacity-10 to show full color, improving text visibility for dark themes */}
                   <div className={`absolute inset-0 ${conf.bg}`}></div>
                   <div className="relative z-10 mb-2">
                     <div className="w-6 h-6 rounded-full mb-1.5 bg-gray-300 shadow-sm"></div>
                     <div className={`h-1.5 w-16 rounded bg-current opacity-40 mb-1 ${conf.text}`}></div>
                   </div>
                   
                   <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                     <div className="flex flex-col">
                       <span className={`text-base font-bold tracking-tight leading-none mb-0.5 ${conf.text}`}>
                         {conf.label}
                       </span>
                       <span className={`text-[10px] font-medium opacity-60 uppercase tracking-wider ${conf.text}`}>
                         {conf.subLabel}
                       </span>
                     </div>
                     {currentStyle === key && <CheckCircle size={18} className="text-blue-600 mb-1 drop-shadow-md" />}
                   </div>
                 </button>
               );
             })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;