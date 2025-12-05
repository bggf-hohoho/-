import React, { useRef } from 'react';
import { Vendor } from '../types';
import { Plus, Trash2, Instagram, Upload, Image as ImageIcon, Link as LinkIcon, ZoomIn, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, QrCode } from 'lucide-react';

interface VendorFormProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  showQR: boolean;
  setShowQR: (show: boolean) => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({ vendors, setVendors, showQR, setShowQR }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeVendorIdRef = useRef<string | null>(null);

  const handleAddVendor = () => {
    const newVendor: Vendor = {
      id: Date.now().toString(),
      name: '',
      role: '婚禮廠商',
      handle: '',
      url: 'https://instagram.com',
      imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
      scale: 50,
      offsetX: 0,
      offsetY: 0
    };
    setVendors([...vendors, newVendor]);
  };

  const handleUpdate = (id: string, field: keyof Vendor, value: string | number) => {
    setVendors(vendors.map(v => {
      if (v.id !== id) return v;

      // Special logic for Instagram Handle
      if (field === 'handle' && typeof value === 'string') {
        const cleanHandle = value.replace('@', '').trim();
        const autoUrl = cleanHandle ? `https://www.instagram.com/${cleanHandle}` : 'https://instagram.com';
        
        // If name is empty or looks like a previous handle, auto-fill it
        const currentName = v.name;
        // Simple heuristic: if name is empty or same as previous handle, update it
        const shouldUpdateName = !currentName || currentName === v.handle; 
        const newName = shouldUpdateName ? cleanHandle : currentName;

        return {
          ...v,
          handle: cleanHandle, // Store without @ internally
          url: autoUrl,
          name: newName
        };
      }

      return { ...v, [field]: value };
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeVendorIdRef.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(activeVendorIdRef.current!, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = (id: string) => {
    activeVendorIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleRemove = (id: string) => {
    if (vendors.length > 1) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const handleMove = (id: string, dx: number, dy: number) => {
    setVendors(vendors.map(v => {
      if (v.id !== id) return v;
      return {
        ...v,
        offsetX: (v.offsetX || 0) + dx,
        offsetY: (v.offsetY || 0) + dy
      };
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">名單列表 (共 {vendors.length})</h2>
        <div className="flex gap-2">
            <button
                onClick={() => setShowQR(!showQR)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition shadow-sm border ${showQR ? 'bg-[#B76E79] border-[#B76E79] text-white hover:bg-[#9e5d66]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                title={showQR ? '點擊隱藏 QR Code' : '點擊顯示 QR Code'}
            >
                <QrCode size={16} />
                <span className="hidden sm:inline">{showQR ? 'QR On' : 'QR Off'}</span>
            </button>
            <button 
              onClick={handleAddVendor}
              className="flex items-center gap-1 bg-[#B76E79] hover:bg-[#9e5d66] text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
            >
              <Plus size={14} /> 新增名單
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-10">
        {vendors.map((vendor, index) => (
          <div key={vendor.id} className="bg-white border border-[#B38867]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
            
            <div className="space-y-4">
              
              {/* Primary Input: Instagram - Updated to Dry Rose theme */}
              <div className="bg-[#FAF0F0] p-3 rounded-lg border border-[#ECD9D9]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#B47474] flex items-center">
                    <span className="bg-white/60 border border-[#B47474]/20 text-[#B47474] text-[10px] px-1.5 py-0.5 rounded font-mono mr-2">
                      #{index + 1}
                    </span>
                    <Instagram size={14} className="mr-1"/> 
                    輸入 IG 帳號
                  </label>
                  <button 
                    onClick={() => handleRemove(vendor.id)} 
                    className="text-[#B47474]/40 hover:text-red-500 transition p-1"
                    title="刪除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    value={vendor.handle}
                    onChange={(e) => handleUpdate(vendor.id, 'handle', e.target.value)}
                    placeholder="例如: wedding_photo_tw"
                    className="w-full text-base font-medium border-b border-[#ECD9D9] bg-transparent py-1 pl-6 text-gray-800 placeholder-gray-400 focus:border-[#B47474] outline-none transition"
                  />
                  <span className="absolute left-0 top-1 text-gray-400 font-medium">@</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Role Input (Left) - Renamed Label */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">一級文字</label>
                  <input 
                    type="text" 
                    value={vendor.role}
                    onChange={(e) => handleUpdate(vendor.id, 'role', e.target.value)}
                    className="w-full text-sm border rounded p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {/* Name Input (Right) - Renamed Label */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">二級文字</label>
                  <input 
                    type="text" 
                    value={vendor.name}
                    onChange={(e) => handleUpdate(vendor.id, 'name', e.target.value)}
                    placeholder="自動帶入或自行修改"
                    className="w-full text-sm border rounded p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Image Handling */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12}/> 照片設定
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="overflow-hidden w-12 h-12 rounded-full border border-gray-200 bg-gray-100 shrink-0 relative">
                        <img 
                            src={vendor.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            style={{ 
                              transform: `translate(${vendor.offsetX || 0}px, ${vendor.offsetY || 0}px) scale(${(vendor.scale || 50) / 50})`
                            }}
                        />
                    </div>
                    {/* Position Controls */}
                    <div className="flex flex-col items-center gap-1 mt-1">
                       <button onClick={() => handleMove(vendor.id, 0, -10)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="上移">
                         <ArrowUp size={12} />
                       </button>
                       <div className="flex gap-1">
                          <button onClick={() => handleMove(vendor.id, -10, 0)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="左移">
                            <ArrowLeft size={12} />
                          </button>
                          <button onClick={() => handleMove(vendor.id, 0, 10)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="下移">
                            <ArrowDown size={12} />
                          </button>
                          <button onClick={() => handleMove(vendor.id, 10, 0)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="右移">
                            <ArrowRight size={12} />
                          </button>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => triggerFileUpload(vendor.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 rounded transition border border-gray-200"
                      >
                        <Upload size={12}/> 上傳照片
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={vendor.imageUrl}
                        onChange={(e) => handleUpdate(vendor.id, 'imageUrl', e.target.value)}
                        placeholder="或貼上圖片網址..."
                        className="w-full text-xs border rounded p-1.5 pl-7 bg-gray-50 text-gray-600 focus:bg-white outline-none"
                      />
                      <LinkIcon size={10} className="absolute left-2 top-2 text-gray-400"/>
                    </div>
                    
                    {/* Scale Slider */}
                    <div className="flex items-center gap-2 pt-1">
                      <ZoomIn size={12} className="text-gray-400" />
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={vendor.scale || 50} 
                        onChange={(e) => handleUpdate(vendor.id, 'scale', parseInt(e.target.value))}
                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B76E79]"
                      />
                      <span className="text-xs text-gray-500 font-mono w-8 text-right">{vendor.scale || 50}%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};