import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import { Pencil } from 'lucide-react';
import clsx from 'clsx';

export default function Editable({ id, initialValue, as: Tag = 'div', className, multiline = false, type = 'text', children, ...props }) {
    const { isLoggedIn } = useAuth();
    const { getContent, updateContent } = useContent();
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(getContent(id, initialValue));
    const [tempValue, setTempValue] = useState(currentValue);

    const value = getContent(id, initialValue);

    const handleContextMenu = (e) => {
        if (isLoggedIn) {
            e.preventDefault();
            setIsEditing(true);
            setTempValue(value);
        }
    };

    const handleSave = () => {
        updateContent(id, tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleReset = () => {
        setTempValue('');
        updateContent(id, ''); // Immediate update or waiting for save? User expectation on "Reset" usually implies saving. 
        // Let's stick to setting tempValue and let user save, or provide specific Reset button.
        // Actually for "Restore Default", it's better to clear it.
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const MAX_WIDTH = 1200;
                    if (width > MAX_WIDTH) {
                        height = Math.floor((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality to vastly reduce base64 footprint
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    setTempValue(compressedBase64);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    if (isEditing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleCancel}>
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Pencil className="w-5 h-5" />
                        Edit {type === 'image' || type === 'background' ? (type === 'background' ? 'Background' : 'Image') : 'Content'}
                    </h3>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Content for ID: <span className="font-mono text-gray-300">{id}</span></label>

                        {type === 'image' || type === 'background' ? (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-[#333] rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-[#a41e32] transition-colors">
                                    {tempValue ? (
                                        <img src={tempValue} alt="Preview" className="max-h-32 object-contain mb-2" />
                                    ) : (
                                        <div className="text-gray-500 text-sm">
                                            {type === 'background' ? 'Default Effect Active' : 'No image selected'}
                                        </div>
                                    )}
                                    <label className="cursor-pointer bg-[#242424] px-3 py-1.5 rounded text-sm text-white hover:bg-[#333] transition-colors">
                                        Upload File
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-[#333]"></span>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#1a1a1a] px-2 text-gray-500">Or use URL</span>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={tempValue || ''}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full bg-[#242424] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#a41e32]"
                                />
                                {type === 'background' && (
                                    <button
                                        onClick={() => setTempValue('')}
                                        className="w-full py-2 text-sm text-red-400 hover:text-red-300 border border-red-900/30 hover:bg-red-900/10 rounded transition-colors"
                                    >
                                        Reset to Default Effect
                                    </button>
                                )}
                            </div>
                        ) : multiline ? (
                            <textarea
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full bg-[#242424] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#a41e32] min-h-[150px]"
                                autoFocus
                            />
                        ) : (
                            <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full bg-[#242424] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#a41e32]"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded bg-transparent border border-[#333] hover:border-gray-500 text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded bg-[#a41e32] text-white hover:bg-[#8e192b] border-none"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'image') {
        return (
            <div
                className={clsx(className, "relative group", isLoggedIn && "cursor-context-menu")}
                onContextMenu={handleContextMenu}
                {...props}
            >
                <img src={value} alt={id} className="h-full w-full object-contain" />
                {isLoggedIn && (
                    <div className={clsx(
                        "absolute inset-0 border-2 border-[#a41e32] border-dashed rounded opacity-0 transition-opacity pointer-events-none",
                        "group-hover:opacity-100"
                    )} />
                )}
                {isLoggedIn && (
                    <span className="absolute -top-3 -right-3 hidden group-hover:flex bg-[#a41e32] text-white text-[10px] px-1.5 py-0.5 rounded-full items-center shadow-lg pointer-events-none z-10">
                        Edit Image
                    </span>
                )}
            </div>
        );
    }

    if (type === 'background') {
        return (
            <div
                className={clsx(className, "group", isLoggedIn && "cursor-context-menu")}
                onContextMenu={handleContextMenu}
                {...props}
                style={value ? { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {!value && children}
                {isLoggedIn && (
                    <div className={clsx(
                        "absolute inset-0 border-2 border-[#a41e32] border-dashed rounded opacity-0 transition-opacity pointer-events-none z-50",
                        "group-hover:opacity-100"
                    )} />
                )}
                {isLoggedIn && (
                    <span className="absolute top-4 right-4 hidden group-hover:flex bg-[#a41e32] text-white text-[10px] px-1.5 py-0.5 rounded-full items-center shadow-lg pointer-events-none z-50">
                        Edit Background
                    </span>
                )}
            </div>
        );
    }

    return (
        <Tag
            className={clsx(
                className,
                multiline && "whitespace-pre-wrap",
                isLoggedIn && "hover:outline hover:outline-2 hover:outline-[#a41e32] hover:outline-dashed cursor-context-menu relative group"
            )}
            onContextMenu={handleContextMenu}
            {...props}
        >
            {value}
            {isLoggedIn && (
                <span className="absolute -top-3 -right-3 hidden group-hover:flex bg-[#a41e32] text-white text-[10px] px-1.5 py-0.5 rounded-full items-center shadow-lg pointer-events-none">
                    Edit
                </span>
            )}
        </Tag>
    );
}
