import { useState } from 'react';
import Editable from './Editable';
import { Wine, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 h-12">
                    <Editable
                        id="header-brand-logo"
                        initialValue="https://placehold.co/150x50/333/white?text=Baccus"
                        type="image"
                        className="h-10 w-auto"
                    />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Editable
                        id="nav-events"
                        initialValue="Events"
                        as="a"
                        href="#"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    />
                    <Editable
                        id="nav-blog"
                        initialValue="Blog"
                        as="a"
                        href="#"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    />
                    <Editable
                        id="nav-contact"
                        initialValue="Contact"
                        as="a"
                        href="#"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    />
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Nav Overlay */}
                <div className={clsx(
                    "fixed inset-0 top-20 bg-[#111] z-30 flex flex-col items-center pt-12 gap-8 md:hidden transition-transform duration-300 ease-in-out",
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <Editable
                        id="nav-events-mobile"
                        initialValue="Events"
                        as="a"
                        href="#"
                        className="text-xl font-medium text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <Editable
                        id="nav-blog-mobile"
                        initialValue="Blog"
                        as="a"
                        href="#"
                        className="text-xl font-medium text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <Editable
                        id="nav-contact-mobile"
                        initialValue="Contact"
                        as="a"
                        href="#"
                        className="text-xl font-medium text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    />
                </div>
            </div>
        </header>
    );
}
