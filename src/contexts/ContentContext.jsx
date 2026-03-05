import { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext();

export function ContentProvider({ children }) {
    const [content, setContent] = useState(() => {
        const saved = localStorage.getItem('baccus_content');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('baccus_content', JSON.stringify(content));
    }, [content]);

    const updateContent = (id, value) => {
        setContent(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const getContent = (id, defaultValue) => {
        return content[id] !== undefined ? content[id] : defaultValue;
    };

    return (
        <ContentContext.Provider value={{ updateContent, getContent }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    return useContext(ContentContext);
}
