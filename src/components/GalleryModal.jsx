import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import { X, Plus, ChevronLeft, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import Editable from './Editable';

// Compress an image file to JPEG base64
function compressImage(file) {
    return new Promise((resolve) => {
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
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function GalleryModal({ onClose }) {
    const { isLoggedIn } = useAuth();
    const { getContent, updateContent } = useContent();

    const [activeAlbumId, setActiveAlbumId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const dragCounter = useRef(0);

    // Load albums from ContentContext
    const albums = getContent('gallery-albums', []);

    const handleCreateAlbum = () => {
        const newAlbum = {
            id: Date.now().toString(),
            title: 'New Album',
            coverUrl: '',
            photos: []
        };
        updateContent('gallery-albums', [newAlbum, ...albums]);
    };

    const handleDeleteAlbum = (id, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this album and all its photos?')) {
            updateContent('gallery-albums', albums.filter(a => a.id !== id));
            if (activeAlbumId === id) setActiveAlbumId(null);
        }
    };

    const updateAlbum = (id, updates) => {
        updateContent('gallery-albums', albums.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const activeAlbum = albums.find(a => a.id === activeAlbumId);

    // Process multiple image files and add them all to the album
    const processFiles = async (files, album) => {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setIsUploading(true);
        const newPhotos = [];
        for (const file of imageFiles) {
            const base64 = await compressImage(file);
            newPhotos.push({ id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 7), url: base64 });
        }
        // Re-read latest album state to avoid stale data
        const latestAlbums = getContent('gallery-albums', []);
        const latestAlbum = latestAlbums.find(a => a.id === album.id);
        if (latestAlbum) {
            updateContent('gallery-albums', latestAlbums.map(a =>
                a.id === album.id ? { ...a, photos: [...a.photos, ...newPhotos] } : a
            ));
        }
        setIsUploading(false);
    };

    // Drag-and-drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e, album) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files, album);
        }
    };
    const handleFileSelect = (e, album) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files, album);
            e.target.value = ''; // reset input
        }
    };

    // Photos View (Active Album)
    if (activeAlbum) {
        const handleDeletePhoto = (photoId) => {
            updateAlbum(activeAlbum.id, {
                photos: activeAlbum.photos.filter(p => p.id !== photoId)
            });
        };

        return (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-md px-4 pt-20 pb-8 text-left" onClick={onClose}>
                <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-10 w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* Header Controls */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <button onClick={() => setActiveAlbumId(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                            <ChevronLeft className="w-5 h-5" />
                            Back to Albums
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar pr-2 md:pr-4">
                        <Editable
                            id={`album-${activeAlbum.id}-title`}
                            initialValue={activeAlbum.title}
                            as="h2"
                            className="text-3xl md:text-4xl font-bold text-white mb-8"
                        />

                        {/* Multi-file Drop Box (Master Access) */}
                        {isLoggedIn && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, activeAlbum)}
                                className={`mb-8 p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer w-full ${isDragging
                                        ? 'border-[#a41e32] bg-[#a41e32]/10 text-[#a41e32] scale-[1.02]'
                                        : 'border-white/20 hover:border-[#a41e32] text-gray-500 hover:text-[#a41e32] bg-black/30'
                                    } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, activeAlbum)}
                                />
                                {isUploading ? (
                                    <>
                                        <div className="w-8 h-8 border-2 border-[#a41e32] border-t-transparent rounded-full animate-spin mb-2" />
                                        <span className="font-medium">Uploading photos...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="font-medium">{isDragging ? 'Drop photos here!' : 'Drag & drop photos here'}</span>
                                        <span className="text-xs text-gray-600 mt-1">or click to browse · supports multiple files</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Photos Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
                            {activeAlbum.photos.length === 0 && !isLoggedIn && (
                                <div className="col-span-full text-center text-gray-600 py-12">No photos in this album yet.</div>
                            )}
                            {activeAlbum.photos.length === 0 && isLoggedIn && !isUploading && (
                                <div className="col-span-full text-center text-gray-600 py-8 text-sm">Drop or select photos above to get started.</div>
                            )}
                            {activeAlbum.photos.map(photo => (
                                <div key={photo.id} className="relative aspect-square group rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                    <img
                                        src={photo.url || "https://via.placeholder.com/400x400/222222/555555?text=No+Image"}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {isLoggedIn && (
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-900/80 text-white rounded opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer z-10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Albums View (Default)
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-md px-4 pt-20 pb-8 text-left" onClick={onClose}>
            <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-10 w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header Options */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <Editable
                            id="gallery-modal-title"
                            initialValue="Baccus Gallery"
                            as="h2"
                            className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                        />
                        {isLoggedIn && (
                            <button onClick={handleCreateAlbum} className="flex items-center gap-2 bg-[#a41e32]/20 text-[#a41e32] hover:bg-[#a41e32] hover:text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-none cursor-pointer">
                                <Plus className="w-4 h-4" />
                                New Album
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar pr-2 md:pr-4 pb-8">
                    {albums.length === 0 && !isLoggedIn && (
                        <div className="text-gray-500 py-16 text-center text-lg">
                            Our gallery is currently empty. Check back soon for photos!
                        </div>
                    )}

                    {albums.length === 0 && isLoggedIn && (
                        <div className="text-[#a41e32]/80 py-16 text-center text-lg border border-dashed border-[#a41e32]/30 rounded-2xl">
                            Create your first album by clicking "+ New Album" above.
                        </div>
                    )}

                    {/* Albums Grid (Rows of 3 via MD:grid-cols-3) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {albums.map(album => (
                            <div
                                key={album.id}
                                className="group cursor-pointer flex flex-col gap-3"
                                onClick={() => setActiveAlbumId(album.id)}
                            >
                                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-white/30">
                                    {/* Album Cover */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {isLoggedIn ? (
                                            <Editable
                                                id={`album-${album.id}-cover`}
                                                type="image"
                                                initialValue={album.coverUrl || "https://via.placeholder.com/600x600/1a1a1a/444444?text=Set+Album+Cover"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={album.coverUrl || "https://via.placeholder.com/600x600/1a1a1a/444444?text=Album"}
                                                alt={album.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Overlay Gradient & UI */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

                                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                                        <span className="text-sm text-gray-300 flex items-center gap-1.5 font-medium">
                                            <ImageIcon className="w-4 h-4" />
                                            {album.photos?.length || 0} Photos
                                        </span>
                                    </div>

                                    {isLoggedIn && (
                                        <button
                                            onClick={(e) => handleDeleteAlbum(album.id, e)}
                                            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer z-10 backdrop-blur-sm"
                                            title="Delete album"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Album Title Below */}
                                <div className="px-1">
                                    <Editable
                                        id={`album-${album.id}-title`}
                                        initialValue={album.title}
                                        as="h3"
                                        className="text-xl font-bold text-white group-hover:text-[#a41e32] transition-colors"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
