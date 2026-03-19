import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Editable from './Editable';
import { Lock, Unlock, ArrowRight, Instagram, Send } from 'lucide-react';

export default function Footer() {
    const { isLoggedIn, login, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (login(email, password)) {
            setShowLogin(false);
            setEmail('');
            setPassword('');
            setError('');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <footer className="bg-[#111] py-12 px-6 mt-auto border-t border-white/5 relative">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-12 relative w-full">
                {/* Left: Copyright */}
                <div className="text-gray-500 text-sm text-center md:text-left z-10 hidden md:block">
                    <p>© {new Date().getFullYear()} Baccus Wine Club.</p>
                    <div className="mt-2 text-xs opacity-50">
                        <Editable id="footer-address" initialValue="Helsinki, Finland" />
                    </div>
                </div>

                {/* Center: Social Links */}
                <div className="flex items-center justify-center gap-6 z-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-0">
                    <a
                        href="https://www.instagram.com/viinikerhobaccus/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors p-2"
                    >
                        <Instagram className="w-5 h-5" />
                        <span className="sr-only">Instagram</span>
                    </a>
                    <a
                        href="https://t.me/viinikerhobaccus"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#2AABEE] transition-colors p-2"
                    >
                        <Send className="w-5 h-5" />
                        <span className="sr-only">Telegram</span>
                    </a>
                </div>

                {/* Left: Copyright (Mobile only, rendered after socials for flex-col ordering) */}
                <div className="text-gray-500 text-sm text-center md:hidden z-10 w-full">
                    <p>© {new Date().getFullYear()} Baccus Wine Club.</p>
                    <div className="mt-2 text-xs opacity-50">
                        <Editable id="footer-address" initialValue="Helsinki, Finland" />
                    </div>
                </div>

                {/* Right: Master Access */}
                <div className="flex flex-col items-center md:items-end z-10 w-full md:w-auto mt-4 md:mt-0">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3 bg-green-900/20 px-4 py-2 rounded-full border border-green-900/50">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-500 text-sm font-medium">Master Account Active</span>
                            <button
                                onClick={logout}
                                className="ml-2 p-1 hover:bg-green-900/40 rounded text-green-400 hover:text-green-300 transition-colors"
                                title="Logout"
                            >
                                <Unlock className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            {!showLogin ? (
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className="text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1 transition-colors"
                                >
                                    <Lock className="w-3 h-3" />
                                    Master Access
                                </button>
                            ) : (
                                <form onSubmit={handleLogin} className="flex flex-col gap-2 p-4 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl absolute bottom-0 right-0 w-64 z-10 transition-all">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white text-xs font-semibold">Master Sign In</span>
                                        <button type="button" onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="bg-[#242424] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:border-[#a41e32] focus:outline-none"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="bg-[#242424] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:border-[#a41e32] focus:outline-none"
                                        required
                                    />
                                    {error && <p className="text-red-500 text-[10px]">{error}</p>}
                                    <button type="submit" className="bg-[#a41e32] hover:bg-[#8e192b] text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors">
                                        Sign In <ArrowRight className="w-3 h-3" />
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}
