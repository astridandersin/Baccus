import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('baccus_auth_master') === 'true';
    });

    const hashString = async (str) => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const login = async (username, password) => {
        const userHash = await hashString(username);
        const passHash = await hashString(password);

        if (
            userHash === '54a0e1d26a27f92ca4e2f507b2871f2ba23d7a240e0a5307b050c10dbe2ecfef' &&
            passHash === '1a05756ef1be86570fa217be6a7b81a468f62da77d84a3dd40bffb391c5e0eb5'
        ) {
            setIsLoggedIn(true);
            localStorage.setItem('baccus_auth_master', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('baccus_auth_master');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
