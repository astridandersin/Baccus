import { useState } from 'react';
import { Wine, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import baccusLogo from '../assets/Baccus_logo_white.svg';

export default function Header({ onOpenGallery }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <header className={clsx("fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-md border-b border-white/10", isMenuOpen ? "z-[60]" : "z-40")}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <a
                        href="#top"
                        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-3 h-12 cursor-pointer"
                    >
                        <img src={baccusLogo} alt="Baccus Logo" className="h-10 w-auto mix-blend-screen" />
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</a>
                        <a href="#upcoming-events" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Events</a>
                        <a href="#blog" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onOpenGallery?.(); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Gallery</a>
                        <a href="#contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Contact</a>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2 relative z-[60]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Overlay — rendered outside header to avoid stacking issues with WebGL canvas */}
            <div
                className={clsx(
                    "md:hidden flex flex-col items-center justify-center gap-8 bg-[#0a0a0a] transition-transform duration-300 ease-in-out",
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 55 }}
            >
                <a href="#about" className="text-2xl font-medium text-gray-300 hover:text-[#a41e32] transition-colors" onClick={() => setIsMenuOpen(false)}>About</a>
                <a href="#upcoming-events" className="text-2xl font-medium text-gray-300 hover:text-[#a41e32] transition-colors" onClick={() => setIsMenuOpen(false)}>Events</a>
                <a href="#blog" className="text-2xl font-medium text-gray-300 hover:text-[#a41e32] transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onOpenGallery?.(); }} className="text-2xl font-medium text-gray-300 hover:text-[#a41e32] transition-colors">Gallery</a>
                <a href="#contact" className="text-2xl font-medium text-gray-300 hover:text-[#a41e32] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
            </div>
        </>
    );
}
