import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, CheckCircle, 
  Palette, X, Info, FileText, MoreHorizontal,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { PreviewPlayer } from './components/PreviewPlayer';
import { VendorForm } from './components/VendorForm';
import { INITIAL_VENDORS, STYLE_CONFIG } from './constants';
import { StyleType, Vendor } from './types';
import { downloadAsImage } from './utils/exportUtils';

// Extracted constant for consistency across the app
const AUTHOR_AVATAR_URL = "https://scontent.fkhh1-1.fna.fbcdn.net/v/t1.6435-9/92353989_125022249140816_578947242015064064_n.png?stp=dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=lYJE8QVKis8Q7kNvwFcDCWo&_nc_oc=AdkkxB6569c0j3TIEhussHKobD9EK1mDQW85k63Ug7NCDl0vKyJPSyJGKBm3az2cybQ&_nc_zt=23&_nc_ht=scontent.fkhh1-1.fna&_nc_gid=E4kk_110p3hfBwqjmmyBpw&oh=00_Aflc_zddTxrfwq3tQlmtBp_Thp-dL4ACShM_ytb4WDuKhA&oe=69593C46";
const FALLBACK_AVATAR_URL = "https://ui-avatars.com/api/?name=BGG&background=000&color=fff&rounded=true&bold=true";

const App: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [currentStyle, setCurrentStyle] = useState<StyleType>(StyleType.ELEGANT_MINIMAL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showQR, setShowQR] = useState(true);
  
  const controlsTimeoutRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Helper to cycle styles in fullscreen
  const styleKeys = Object.keys(STYLE_CONFIG) as StyleType[];

  const changeStyle = (direction: 'prev' | 'next') => {
    const currentIndex = styleKeys.indexOf(currentStyle);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % styleKeys.length;
    } else {
      newIndex = (currentIndex - 1 + styleKeys.length) % styleKeys.length;
    }
    setCurrentStyle(styleKeys[newIndex]);
  };

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
      
      // Hide after 0.75 seconds of inactivity (reduced from 1500ms)
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 750);
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Initial trigger
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  const handleDownload = async () => {
    if (!previewRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      // Small delay to ensure any rendering updates (if any) are done
      await new Promise(resolve => setTimeout(resolve, 50));
      await downloadAsImage(previewRef.current, `ListDeck_${currentStyle}_${Date.now()}`);
    } catch (error) {
      console.error(error);
      alert('圖片輸出失敗，請確認圖片網址是否允許跨域存取 (CORS) 或網路連線正常。');
    } finally {
      setIsExporting(false);
    }
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
        {/* Wrapper for capture - Attached ref here for fullscreen export */}
        <div ref={previewRef} className="w-full h-full bg-black">
          <PreviewPlayer 
            vendors={vendors}
            currentStyle={currentStyle}
            showQR={showQR}
          />
        </div>

        {/* Top Right Controls Group */}
        <div className={`fixed top-6 right-6 flex items-center gap-3 transition-all duration-500 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
           
           {/* Export Button - Moved from main view */}
           <button 
             onClick={(e) => { e.stopPropagation(); handleDownload(); }}
             disabled={isExporting}
             className={`flex items-center gap-2 bg-black/40 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 shadow-lg hover:scale-105 transition-all active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
              <div className="w-5 h-5 rounded-full overflow-hidden">
                <AuthorImage className="w-full h-full" />
              </div>
              <span className="text-sm font-medium">{isExporting ? '處理中...' : '輸出'}</span>
           </button>

           {/* Return Button - Replaced X icon with text */}
           <button 
             onClick={() => document.exitFullscreen().then(()=>setIsFullscreen(false))} 
             className="bg-black/40 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 shadow-lg hover:scale-105 transition-all active:scale-95 text-sm font-medium"
           >
              返回
           </button>
        </div>

        {/* Style Navigation Controls (Bottom Center) */}
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 transition-all duration-500 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); changeStyle('prev'); }}
             className="bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:scale-110 transition-all active:scale-95 group"
             title="上一個風格"
           >
             <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
           </button>

           <div className="px-6 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white font-bold text-base shadow-lg tracking-wider min-w-[140px] text-center select-none">
              {STYLE_CONFIG[currentStyle].label}
           </div>

           <button 
             onClick={(e) => { e.stopPropagation(); changeStyle('next'); }}
             className="bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:scale-110 transition-all active:scale-95 group"
             title="下一個風格"
           >
             <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row h-screen overflow-hidden items-stretch">
      
      {/* Sidebar: Configuration */}
      <div className="w-full md:w-[400px] bg-[#F8F7F4] border-r border-[#E5E0D8] flex flex-col h-full z-10 shadow-xl">
        {/* Header - Height adjusted to accommodate stacking */}
        <div className="h-16 px-6 border-b border-[#E5E0D8] bg-[#F8F7F4] flex flex-col justify-center shrink-0">
           <div className="flex items-baseline gap-2 w-full overflow-hidden">
             <h1 className="text-2xl font-black text-[#4A4036] tracking-tight flex items-center shrink-0">
               <span className="text-[#B38867]">List</span>Deck
             </h1>
             <span className="text-sm text-[#786C5E] font-bold shrink-0">名單生產器</span>
           </div>
           <a 
             href="https://www.instagram.com/bgg.feng/" 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-[10px] text-[#B38867]/70 hover:text-[#B38867] font-medium transition-colors truncate mt-0.5"
           >
             By 小豐aka喜劇受害人(@Bgg.Feng)
           </a>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <VendorForm 
            vendors={vendors} 
            setVendors={setVendors}
            showQR={showQR}
            setShowQR={setShowQR}
          />
        </div>
      </div>

      {/* Main Area: Preview & Styles */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowMoreModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm px-3 py-1.5 transition-all hover:bg-gray-100 rounded-lg"
             >
                <MoreHorizontal size={18} />
                更多
             </button>

            <button onClick={toggleFullscreen} className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
              <Monitor size={16} />
              <span className="text-sm font-medium">預覽</span>
            </button>
            
            {/* Export button removed from here as per requirements */}
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 bg-gray-200 flex items-center justify-center p-8 overflow-hidden">
          <div 
            ref={previewRef}
            className="w-full max-w-6xl aspect-video bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-300 ring-4 ring-white relative group"
          >
             <PreviewPlayer 
               vendors={vendors}
               currentStyle={currentStyle}
               showQR={showQR}
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
                   className={`relative group flex-shrink-0 w-48 h-28 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left p-4 flex flex-col justify-between ${currentStyle === key ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-105 shadow-xl' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}
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
                     {currentStyle === key && <CheckCircle size={18} className="text-indigo-600 mb-1 drop-shadow-md" />}
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
                  <Info size={14} /> 關於作者 <span className="text-pink-500 ml-1">(歡迎追蹤)</span>
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
                          <p className="font-medium text-gray-800">介面更新</p>
                          輸出按鈕移至預覽全螢幕模式，優化操作體驗。
                        </div>
                     </div>
                     <div className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0 mt-0.5">UPDATE</span>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-gray-800">風格更新</p>
                          新增 侘寂美學、波西米亞、復古拍立得 等多款設計模板。
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