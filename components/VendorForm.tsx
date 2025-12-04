import React, { useRef } from 'react';
import { Vendor } from '../types';
import { Plus, Trash2, Instagram, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface VendorFormProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({ vendors, setVendors }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeVendorIdRef = useRef<string | null>(null);

  const handleAddVendor = () => {
    const newVendor: Vendor = {
      id: Date.now().toString(),
      name: '',
      role: '婚禮廠商',
      handle: '',
      url: 'https://instagram.com',
      imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`
    };
    setVendors([...vendors, newVendor]);
  };

  const handleUpdate = (id: string, field: keyof Vendor, value: string) => {
    setVendors(vendors.map(v => {
      if (v.id !== id) return v;

      // Special logic for Instagram Handle
      if (field === 'handle') {
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
        <h2 className="text-xl font-bold text-gray-800">廠商列表 ({vendors.length})</h2>
        <button 
          onClick={handleAddVendor}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          <Plus size={16} /> 新增廠商
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-10">
        {vendors.map((vendor, index) => (
          <div key={vendor.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-mono">#{index + 1}</span>
              <button onClick={() => handleRemove(vendor.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              
              {/* Primary Input: Instagram */}
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                <label className="text-xs font-bold text-pink-600 mb-1 block flex items-center gap-1">
                  <Instagram size={14}/> 輸入 IG 帳號 (自動產生連結與名稱)
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={vendor.handle}
                    onChange={(e) => handleUpdate(vendor.id, 'handle', e.target.value)}
                    placeholder="例如: wedding_photo_tw"
                    className="w-full text-base font-medium border-b border-pink-200 bg-transparent py-1 pl-6 text-gray-800 placeholder-gray-400 focus:border-pink-500 outline-none transition"
                  />
                  <span className="absolute left-0 top-1 text-gray-400 font-medium">@</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">廠商名稱 (Name)</label>
                  <input 
                    type="text" 
                    value={vendor.name}
                    onChange={(e) => handleUpdate(vendor.id, 'name', e.target.value)}
                    placeholder="自動帶入或自行修改"
                    className="w-full text-sm border rounded p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">類別 (Role)</label>
                  <input 
                    type="text" 
                    value={vendor.role}
                    onChange={(e) => handleUpdate(vendor.id, 'role', e.target.value)}
                    className="w-full text-sm border rounded p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Image Handling */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12}/> 照片設定 (圓形頭貼)
                </label>
                <div className="flex gap-3 items-start">
                  <img 
                    src={vendor.imageUrl} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-100 shrink-0"
                  />
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