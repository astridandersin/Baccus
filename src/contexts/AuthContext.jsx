import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('baccus_auth_master') === 'true';
    });

    const login = (username, password) => {
        if (username === 'baccus@ky.fi' && password === 'Viinikerho26!') {
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
