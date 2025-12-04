import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, CheckCircle, 
  Palette, X, Info, FileText, MoreHorizontal
} from 'lucide-react';
import { PreviewPlayer } from './components/PreviewPlayer';
import { VendorForm } from './components/VendorForm';
import { INITIAL_VENDORS, STYLE_CONFIG } from './constants';
import { StyleType, Vendor } from './types';
import { generateStaticHTML } from './utils/exportUtils';

// Extracted constant for consistency across the app
const AUTHOR_AVATAR_URL = "https://scontent.fkhh1-1.fna.fbcdn.net/v/t1.6435-9/92353989_125022249140816_578947242015064064_n.png?stp=dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=lYJE8QVKis8Q7kNvwFcDCWo&_nc_oc=AdkkxB6569c0j3TIEhussHKobD9EK1mDQW85k63Ug7NCDl0vKyJPSyJGKBm3az2cybQ&_nc_zt=23&_nc_ht=scontent.fkhh1-1.fna&_nc_gid=E4kk_110p3hfBwqjmmyBpw&oh=00_Aflc_zddTxrfwq3tQlmtBp_Thp-dL4ACShM_ytb4WDuKhA&oe=69593C46";
const FALLBACK_AVATAR_URL = "https://ui-avatars.com/api/?name=BGG&background=000&color=fff&rounded=true&bold=true";

const App: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [currentStyle, setCurrentStyle] = useState<StyleType>(StyleType.ELEGANT_MINIMAL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
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

  const AuthorImage = ({ className }: { className?: string }) => (
    <img 
      src={AUTHOR_AVATAR_URL}
      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR_URL; }}
      alt="BGG Feng" 
      className={`object-cover ${className}`} 
    />
  );

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
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <p className="text-sm text-gray-500">廠商名單產生器</p>
            <p className="text-xs text-gray-400 font-medium">By 小豐aka喜劇受害人(@Bgg.Feng)</p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <VendorForm vendors={vendors} setVendors={setVendors} />
        </div>
      </div>

      {/* Main Area: Preview & Styles */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          {/* Modified: Only "More" Button remains here */}
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowMoreModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm px-3 py-1.5 transition-all hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200"
             >
                <MoreHorizontal size={18} />
                更多資訊
             </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleFullscreen} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
              <Monitor size={16} />
              <span className="text-sm font-medium">預覽</span>
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition shadow-lg shadow-gray-200/50">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30">
                <AuthorImage className="w-full h-full" />
              </div>
              <span className="text-sm font-medium">輸出</span>
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
                   {/* Mini Preview Mockups */}
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

      {/* "More" Info Modal */}
      {showMoreModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowMoreModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowMoreModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-800 mb-6">更多資訊</h2>
              
              {/* Section 1: About Author */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Info size={14} /> 關於作者
                </h3>
                <a 
                  href="https://www.instagram.com/bgg.feng/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100 group"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform bg-black">
                     <AuthorImage className="w-full h-full" />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800">小豐aka喜劇受害人</h4>
                     <p className="text-xs text-blue-600 font-medium mt-0.5">@Bgg.Feng</p>
                     <p className="text-[10px] text-gray-400 mt-1">Instagram 婚禮主持 / 喜劇演員</p>
                  </div>
                </a>
              </div>

              {/* Section 2: Changelog */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <FileText size={14} /> 更新日誌
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-40 overflow-y-auto">
                   <div className="space-y-3">
                     <div className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded shrink-0 mt-0.5">NEW</span>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-gray-800">風格更新</p>
                          新增 侘寂美學、波西米亞、復古拍立得 等多款設計模板。
                        </div>
                     </div>
                     <div className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0 mt-0.5">FIX</span>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-gray-800">QR Code 優化</p>
                          修正部分深色模式下 QR Code 掃描不易的問題，並增加輸出解析度。
                        </div>
                     </div>
                     <div className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0 mt-0.5">v1.0</span>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-gray-800">正式發布</p>
                          婚禮廠商卡片產生器上線。
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400">© 2024 Wedding Card Generator. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;