import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, GripVertical, Image as ImageIcon, Type, Trash2 } from 'lucide-react';
import Editable from './Editable';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import clsx from 'clsx';

const defaultPosts = [
    {
        id: '1',
        date: "October 15, 2026",
        title: "The Resurgence of Old Vine Grenache",
        excerpt: "Why winemakers are returning to ancient, low-yielding vines for the purest expression of terroir.",
        blocks: [
            { id: 'b1-1', type: 'text', content: "Grenache is often misunderstood. For decades, it was the workhorse grape of the Mediterranean, producing high yields and high alcohol, but often lacking nuance.\n\nToday, a new generation of winemakers is seeking out abandoned, century-old vineyards. These ancient, gnarled vines naturally restrict yields, producing incredibly concentrated, complex fruit. The resulting wines offer a haunting purity, with notes of wild strawberry, white pepper, and garrigue that transport you straight to the sun-baked hillsides of Southern France and Northern Spain.\n\nWhen tasting these old-vine expressions, look for a balance between the grape's natural exuberance and the savory, earthy undertones brought forth by deep root systems." }
        ]
    },
    {
        id: '2',
        date: "September 28, 2026",
        title: "Cellaring Basics: When to Open That Special Bottle",
        excerpt: "A beginner's guide to temperature, humidity, and reading the structural evolution of fine wines.",
        blocks: [
            { id: 'b2-1', type: 'text', content: "Deciding when to open a special bottle of wine can be agonizing. Open it too soon, and it might be tight and unyielding. Wait too long, and its vibrant fruit may have faded entirely.\n\nThe key to cellaring wine is consistent temperature (around 55°F or 13°C) and moderate humidity. But beyond storage conditions, understanding the wine's structure is paramount. Wines age well when they have a strong backbone of acidity, tannin, or in the case of sweet wines, sugar.\n\nAs wine ages, primary fruit flavors evolve into savory, tertiary notes like leather, tobacco, and dried mushrooms. The tannins soften and integrate, creating a smoother mouthfeel. If you have a case, open a bottle every few years to track its evolution. And remember: it is always better to open a wine five years too early than five minutes too late." }
        ]
    },
    {
        id: '3',
        date: "August 10, 2026",
        title: "Decoding the Language of Tannins",
        excerpt: "Understand how skins, seeds, and oak cooperate to give legendary wines their longevity.",
        blocks: [
            { id: 'b3-1', type: 'text', content: "Tannins are an essential, yet often confusing, component of wine. They are naturally occurring polyphenols found in the skins, seeds, and stems of grapes, as well as in the oak barrels used for aging.\n\nThey create the drying sensation in your mouth—similar to drinking over-steeped black tea. But tannins are not just about texture; they act as a natural preservative, giving red wines the structural framework needed to endure decades in the cellar.\n\nNot all tannins are created equal. 'Green' or unripe tannins can taste harsh and astringent. Conversely, 'ripe' tannins are often described as velvety, powdery, or silky, integrating beautifully with the wine's fruit. When tasting a highly tannic young wine, try pairing it with protein-rich foods like a nicely marbled steak, which will bind to the tannins and soften the wine on your palate." }
        ]
    }
];

export default function BlogCarousel() {
    const { isLoggedIn } = useAuth();
    const { getContent, updateContent } = useContent();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);

    const posts = getContent('blog-posts', defaultPosts);

    useEffect(() => {
        if (selectedPostId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => document.body.style.overflow = 'unset';
    }, [selectedPostId]);

    const handleNext = () => {
        if (posts.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % posts.length);
    };

    const handlePrev = () => {
        if (posts.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    };

    const handleAddPost = () => {
        const newPost = {
            id: Date.now().toString(),
            date: "New Date",
            title: "New Blog Post",
            excerpt: "A brief excerpt...",
            blocks: [{ id: `b-${Date.now()}`, type: 'text', content: "Start writing here..." }]
        };
        const newPosts = [newPost, ...posts];
        updateContent('blog-posts', newPosts);
        setCurrentIndex(0);
        setSelectedPostId(newPost.id);
    };

    const handleDeletePost = (id) => {
        if (window.confirm("Delete this entire blog post?")) {
            const newPosts = posts.filter(p => p.id !== id);
            updateContent('blog-posts', newPosts);
            setSelectedPostId(null);
            setCurrentIndex(0);
        }
    };

    const selectedPost = posts.find(p => p.id === selectedPostId);

    const updateSelectedPost = (updatedPost) => {
        const newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
        updateContent('blog-posts', newPosts);
    };

    const handleAddBlock = (type) => {
        if (!selectedPost) return;
        const newBlock = type === 'text'
            ? { id: `b-${Date.now()}`, type: 'text', content: "New text block..." }
            : { id: `b-${Date.now()}`, type: 'image', url: "" };

        updateSelectedPost({
            ...selectedPost,
            blocks: [...selectedPost.blocks, newBlock]
        });
    };

    const handleDeleteBlock = (blockId) => {
        if (!selectedPost) return;
        if (window.confirm("Remove this block?")) {
            updateSelectedPost({
                ...selectedPost,
                blocks: selectedPost.blocks.filter(b => b.id !== blockId)
            });
        }
    };

    const handleDragStart = (index) => {
        if (!isLoggedIn) return;
        setDraggedBlockIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (!isLoggedIn || draggedBlockIndex === null || draggedBlockIndex === index) return;

        const newBlocks = [...selectedPost.blocks];
        const draggedBlock = newBlocks[draggedBlockIndex];
        newBlocks.splice(draggedBlockIndex, 1);
        newBlocks.splice(index, 0, draggedBlock);

        updateSelectedPost({ ...selectedPost, blocks: newBlocks });
        setDraggedBlockIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedBlockIndex(null);
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-12 py-10 mt-6">

            {isLoggedIn && (
                <button
                    onClick={handleAddPost}
                    className="mb-8 mx-auto px-6 py-3 bg-[#a41e32] hover:bg-[#8e192b] text-white rounded-full font-semibold flex items-center gap-2 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            )}

            {posts.length === 0 ? (
                <p className="text-gray-500">No blog posts available.</p>
            ) : (
                <div className="relative h-[320px] md:h-[280px] flex justify-center items-center overflow-visible md:overflow-hidden px-4 md:px-0">
                    {posts.map((post, index) => {
                        let position = 'opacity-0 scale-75 translate-x-[200%] z-0 pointer-events-none';

                        if (index === currentIndex) {
                            position = 'opacity-100 scale-100 translate-x-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:shadow-2xl';
                        } else if (index === (currentIndex - 1 + posts.length) % posts.length) {
                            position = 'opacity-40 scale-90 -translate-x-[75%] md:-translate-x-[90%] lg:-translate-x-[100%] z-10 cursor-pointer blur-[1px] hover:opacity-60 hover:blur-none';
                        } else if (index === (currentIndex + 1) % posts.length) {
                            position = 'opacity-40 scale-90 translate-x-[75%] md:translate-x-[90%] lg:translate-x-[100%] z-10 cursor-pointer blur-[1px] hover:opacity-60 hover:blur-none';
                        } else {
                            position = index < currentIndex
                                ? 'opacity-0 scale-75 -translate-x-[200%] z-0 pointer-events-none'
                                : 'opacity-0 scale-75 translate-x-[200%] z-0 pointer-events-none';
                        }

                        return (
                            <div
                                key={post.id}
                                onClick={() => {
                                    if (index !== currentIndex) {
                                        setCurrentIndex(index);
                                    } else {
                                        setSelectedPostId(post.id);
                                    }
                                }}
                                className={clsx(
                                    "absolute w-[95%] md:w-[60%] lg:w-[50%] max-w-lg transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                                    position,
                                    index === currentIndex ? "cursor-pointer" : ""
                                )}
                            >
                                <div className="bg-[#111] backdrop-blur-xl border border-white/10 hover:border-[#a41e32]/50 rounded-2xl p-6 md:p-8 h-full min-h-[220px] flex flex-col justify-center text-left select-none group">
                                    <Editable
                                        id={`blog-post-${post.id}-date`}
                                        initialValue={post.date}
                                        as="div"
                                        className="text-[#a41e32] text-xs font-semibold uppercase tracking-wider mb-2 md:mb-3"
                                    />
                                    <Editable
                                        id={`blog-post-${post.id}-title`}
                                        initialValue={post.title}
                                        as="h3"
                                        className="text-lg md:text-xl font-bold text-white mb-2 md:mb-4 leading-tight group-hover:text-gray-100 transition-colors"
                                    />
                                    <Editable
                                        id={`blog-post-${post.id}-excerpt`}
                                        initialValue={post.excerpt}
                                        as="p"
                                        multiline={true}
                                        className="text-xs md:text-sm text-gray-400 leading-relaxed"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Navigation Arrows */}
            {posts.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[#a41e32] transition-colors z-30 shadow-lg backdrop-blur-sm hidden md:flex"
                        aria-label="Previous post"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[#a41e32] transition-colors z-30 shadow-lg backdrop-blur-sm hidden md:flex"
                        aria-label="Next post"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center items-center gap-2 mt-8 z-30 relative">
                        {posts.map((post, index) => (
                            <button
                                key={post.id}
                                onClick={() => setCurrentIndex(index)}
                                className={clsx(
                                    "h-2 rounded-full transition-all duration-300",
                                    index === currentIndex ? "bg-[#a41e32] w-6" : "bg-white/20 hover:bg-white/50 w-2"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Modal for Full Post */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-md px-4 pt-20 pb-8 text-left"
                    onClick={() => setSelectedPostId(null)}
                >
                    <div
                        className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-10 w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedPostId(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors bg-[#111] md:bg-transparent border-none cursor-pointer z-20"
                            aria-label="Close post"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="overflow-y-auto custom-scrollbar pr-2 md:pr-6 pt-4">

                            <div className="mb-8">
                                <Editable
                                    id={`blog-post-${selectedPost.id}-date`}
                                    initialValue={selectedPost.date}
                                    as="div"
                                    className="text-[#a41e32] text-sm font-semibold uppercase tracking-wider mb-4"
                                />
                                <Editable
                                    id={`blog-post-${selectedPost.id}-title`}
                                    initialValue={selectedPost.title}
                                    as="h2"
                                    className="text-3xl md:text-5xl font-bold text-white leading-tight pr-8 md:pr-0"
                                />
                            </div>

                            <div className="space-y-6 pb-8">
                                {selectedPost.blocks.map((block, index) => (
                                    <div
                                        key={block.id}
                                        draggable={isLoggedIn}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={clsx(
                                            "relative group transition-transform duration-200",
                                            isLoggedIn ? "pl-8 hover:bg-white/5 p-2 rounded-lg -ml-2" : "",
                                            draggedBlockIndex === index ? "opacity-50" : ""
                                        )}
                                    >
                                        {isLoggedIn && (
                                            <>
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteBlock(block.id)}
                                                    className="absolute right-0 top-2 p-1.5 text-gray-500 hover:bg-red-900/30 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all border-none bg-transparent cursor-pointer"
                                                    title="Delete block"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {block.type === 'text' && (
                                            <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                                <Editable
                                                    id={`blog-block-${block.id}-text`}
                                                    initialValue={block.content}
                                                    as="div"
                                                    multiline={true}
                                                />
                                            </div>
                                        )}

                                        {block.type === 'image' && (
                                            <div className="w-full">
                                                <Editable
                                                    id={`blog-block-${block.id}-image`}
                                                    type="image"
                                                    initialValue={block.url || "https://via.placeholder.com/800x400/222222/555555?text=Click+to+upload+image"}
                                                    className="w-full rounded-lg overflow-hidden flex justify-center bg-black/30 min-h-[100px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoggedIn && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/10">
                                        <button
                                            onClick={() => handleAddBlock('text')}
                                            className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] border border-dashed border-white/20 hover:border-[#a41e32] text-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <Type className="w-4 h-4" />
                                            Add Text
                                        </button>
                                        <button
                                            onClick={() => handleAddBlock('image')}
                                            className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] border border-dashed border-white/20 hover:border-[#a41e32] text-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            Add Image
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>

                        {isLoggedIn && (
                            <div className="pt-4 mt-2 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={() => handleDeletePost(selectedPost.id)}
                                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-red-900/30 rounded-lg transition-colors cursor-pointer"
                                >
                                    Delete Entire Date/Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
