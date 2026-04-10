import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import Editable from './Editable';
import { ChevronDown, Plus, Trash2, GripVertical, Image as ImageIcon, Type } from 'lucide-react';
import clsx from 'clsx';

export default function AboutToggles() {
    const { isLoggedIn } = useAuth();
    const { getContent, updateContent } = useContent();
    const [openId, setOpenId] = useState(null);
    const [draggedToggleIndex, setDraggedToggleIndex] = useState(null);
    const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);
    const [activeDragId, setActiveDragId] = useState(null);

    const defaultToggles = [
        { id: '1', titleFallback: 'Our Events', contentFallback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
        { id: '2', titleFallback: 'The Board', contentFallback: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
        { id: '3', titleFallback: 'History', contentFallback: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.' }
    ];

    const toggles = getContent('about-toggles-list', defaultToggles);

    // Ensure all toggles have a valid blocks array (Migration step)
    const normalizedToggles = toggles.map(t => {
        if (!t.blocks) {
            return {
                ...t,
                blocks: [{ id: `b-init-${t.id}`, type: 'text', content: t.contentFallback || 'New text' }]
            };
        }
        return t;
    });

    const updateToggles = (newToggles) => {
        updateContent('about-toggles-list', newToggles);
    };

    const handleAddToggle = () => {
        const newId = Date.now().toString();
        const newToggles = [...normalizedToggles, {
            id: newId,
            titleFallback: 'New Section',
            blocks: [{ id: `b-${Date.now()}`, type: 'text', content: 'Lorem ipsum...' }]
        }];
        updateToggles(newToggles);
        setOpenId(newId);
    };

    const handleDeleteToggle = (idToRemove) => {
        if (window.confirm('Are you sure you want to delete this entire section?')) {
            const newToggles = normalizedToggles.filter(t => t.id !== idToRemove);
            updateToggles(newToggles);
            if (openId === idToRemove) setOpenId(null);
        }
    };

    const toggleOpen = (id) => {
        setOpenId(prev => prev === id ? null : id);
    };

    // --- TOGGLE DRAG HANDLERS ---
    const handleToggleDragStart = (e, index) => {
        if (!isLoggedIn) return;
        setDraggedToggleIndex(index);
    };

    const handleToggleDragOver = (e, index) => {
        e.preventDefault();
        // Ignore if we are dragging an inner block, not a toggle
        if (!isLoggedIn || draggedToggleIndex === null || draggedToggleIndex === index || draggedBlockIndex !== null) return;

        const newToggles = [...normalizedToggles];
        const draggedToggle = newToggles[draggedToggleIndex];
        newToggles.splice(draggedToggleIndex, 1);
        newToggles.splice(index, 0, draggedToggle);

        updateToggles(newToggles);
        setDraggedToggleIndex(index);
    };

    const handleToggleDragEnd = () => {
        setDraggedToggleIndex(null);
    };

    // --- BLOCK ACTIONS & DRAG HANDLERS ---
    const handleAddBlock = (toggleId, type) => {
        const toggleIndex = normalizedToggles.findIndex(t => t.id === toggleId);
        if (toggleIndex === -1) return;

        const newBlock = type === 'text'
            ? { id: `b-${Date.now()}`, type: 'text', content: "New text block..." }
            : { id: `b-${Date.now()}`, type: 'image', url: "" };

        const newToggles = [...normalizedToggles];
        newToggles[toggleIndex] = {
            ...newToggles[toggleIndex],
            blocks: [...newToggles[toggleIndex].blocks, newBlock]
        };
        updateToggles(newToggles);
    };

    const handleDeleteBlock = (toggleId, blockId) => {
        if (!window.confirm("Remove this block?")) return;
        const toggleIndex = normalizedToggles.findIndex(t => t.id === toggleId);
        if (toggleIndex === -1) return;

        const newToggles = [...normalizedToggles];
        newToggles[toggleIndex] = {
            ...newToggles[toggleIndex],
            blocks: newToggles[toggleIndex].blocks.filter(b => b.id !== blockId)
        };
        updateToggles(newToggles);
    };

    const handleBlockDragStart = (e, index) => {
        e.stopPropagation(); // prevent grabbing parent toggle
        if (!isLoggedIn) return;
        setDraggedBlockIndex(index);
    };

    const handleBlockDragOver = (e, toggleId, index) => {
        e.preventDefault();
        e.stopPropagation(); // prevent triggering parent toggle drag over

        if (!isLoggedIn || draggedBlockIndex === null || draggedBlockIndex === index || draggedToggleIndex !== null) return;

        const toggleIndex = normalizedToggles.findIndex(t => t.id === toggleId);
        if (toggleIndex === -1) return;

        const newToggles = [...normalizedToggles];
        const newBlocks = [...newToggles[toggleIndex].blocks];

        const draggedBlock = newBlocks[draggedBlockIndex];
        newBlocks.splice(draggedBlockIndex, 1);
        newBlocks.splice(index, 0, draggedBlock);

        newToggles[toggleIndex] = { ...newToggles[toggleIndex], blocks: newBlocks };
        updateToggles(newToggles);
        setDraggedBlockIndex(index);
    };

    const handleBlockDragEnd = (e) => {
        e.stopPropagation();
        setDraggedBlockIndex(null);
    };

    return (
        <div className="mt-8 space-y-4">
            {normalizedToggles.map((toggle, toggleIndex) => {
                const isOpen = openId === toggle.id;

                return (
                    <div
                        key={toggle.id}
                        draggable={isLoggedIn && openId === null && activeDragId === `toggle-${toggle.id}`}
                        onDragStart={(e) => handleToggleDragStart(e, toggleIndex)}
                        onDragOver={(e) => handleToggleDragOver(e, toggleIndex)}
                        onDragEnd={handleToggleDragEnd}
                        className={clsx(
                            "border rounded-xl bg-[#1a1a1a]/50 transition-all duration-300 relative group/toggle",
                            isOpen ? "border-[#a41e32]/50 shadow-[0_0_20px_rgba(0,0,0,0.25)] z-40" : "border-white/10 hover:border-[#a41e32]/30 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] z-10",
                            draggedToggleIndex === toggleIndex ? "opacity-40" : ""
                        )}
                    >
                        {/* Drag Handle for Toggle */}
                        {isLoggedIn && !isOpen && (
                            <div
                                className="absolute left-0 top-0 bottom-0 w-8 flex justify-center items-center cursor-grab active:cursor-grabbing text-gray-600 opacity-0 group-hover/toggle:opacity-100 transition-opacity z-10 hover:bg-white/5"
                                onMouseEnter={() => setActiveDragId(`toggle-${toggle.id}`)}
                                onMouseLeave={() => setActiveDragId(null)}
                            >
                                <GripVertical className="w-5 h-5 pointer-events-none" />
                            </div>
                        )}

                        <div
                            className={clsx(
                                "flex items-center justify-between p-5 cursor-pointer transition-colors relative z-0",
                                isLoggedIn && !isOpen ? "pl-10" : "pl-5"
                            )}
                            onClick={() => toggleOpen(toggle.id)}
                        >
                            <div className="flex-1">
                                <Editable
                                    id={`about-toggle-${toggle.id}-title`}
                                    initialValue={toggle.titleFallback}
                                    as="h3"
                                    className="text-xl font-semibold text-white"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                {isLoggedIn && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteToggle(toggle.id);
                                        }}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                        title="Delete section"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className={clsx(
                                    "p-1 rounded-full border transition-all duration-300 text-gray-400",
                                    isOpen ? "bg-[#a41e32]/20 border-[#a41e32]/50 text-[#a41e32] rotate-180" : "border-white/20"
                                )}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div
                            className={clsx(
                                "grid transition-all duration-300 ease-in-out relative z-0",
                                isOpen ? "grid-rows-[1fr] opacity-100 border-t border-white/5" : "grid-rows-[0fr] opacity-0 border-t border-transparent"
                            )}
                        >
                            <div className={isOpen ? "overflow-visible" : "overflow-hidden"}>
                                <div className="p-5 bg-[#111]/30 flex flex-col gap-6">
                                    {/* Map inner blocks */}
                                    {toggle.blocks.map((block, blockIndex) => (
                                        <div
                                            key={block.id}
                                            draggable={isLoggedIn && activeDragId === `block-${block.id}`}
                                            onDragStart={(e) => handleBlockDragStart(e, blockIndex)}
                                            onDragOver={(e) => handleBlockDragOver(e, toggle.id, blockIndex)}
                                            onDragEnd={handleBlockDragEnd}
                                            className={clsx(
                                                "relative group/block transition-transform duration-200",
                                                isLoggedIn ? "pl-8 hover:bg-white/5 p-2 rounded-lg -mx-2" : "",
                                                draggedBlockIndex === blockIndex ? "opacity-40" : ""
                                            )}
                                        >
                                            {isLoggedIn && (
                                                <>
                                                    <div
                                                        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing text-gray-600 opacity-0 group-hover/block:opacity-100 transition-opacity"
                                                        onMouseEnter={() => setActiveDragId(`block-${block.id}`)}
                                                        onMouseLeave={() => setActiveDragId(null)}
                                                    >
                                                        <GripVertical className="w-4 h-4 pointer-events-none" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteBlock(toggle.id, block.id)}
                                                        className="absolute right-1 top-1 p-1.5 text-gray-500 hover:bg-red-900/30 hover:text-red-400 rounded opacity-0 group-hover/block:opacity-100 transition-all border-none bg-transparent cursor-pointer"
                                                        title="Delete block"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {block.type === 'text' && (
                                                <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                                    <Editable
                                                        id={`about-toggle-block-${block.id}-text`}
                                                        initialValue={block.content}
                                                        as="div"
                                                        multiline={true}
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'image' && (
                                                <div className="w-full">
                                                    <Editable
                                                        id={`about-toggle-block-${block.id}-image`}
                                                        type="image"
                                                        initialValue={block.url || "https://via.placeholder.com/800x400/222222/555555?text=Click+to+upload+image"}
                                                        className="w-full rounded-lg overflow-hidden flex justify-center bg-black/30 min-h-[100px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add buttons */}
                                    {isLoggedIn && (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 mt-2">
                                            <button
                                                onClick={() => handleAddBlock(toggle.id, 'text')}
                                                className="flex-1 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-dashed border-white/20 hover:border-[#a41e32] text-gray-400 hover:text-gray-200 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                                            >
                                                <Type className="w-3.5 h-3.5" />
                                                Add Text
                                            </button>
                                            <button
                                                onClick={() => handleAddBlock(toggle.id, 'image')}
                                                className="flex-1 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-dashed border-white/20 hover:border-[#a41e32] text-gray-400 hover:text-gray-200 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                                            >
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                Add Image
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {isLoggedIn && (
                <button
                    onClick={handleAddToggle}
                    className="w-full mt-4 py-4 border border-dashed border-white/20 hover:border-[#a41e32] rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add New Toggle Section
                </button>
            )}
        </div>
    );
}
