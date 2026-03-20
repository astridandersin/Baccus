import { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext();

export function ContentProvider({ children }) {
    const [isReadyForSave, setIsReadyForSave] = useState(false);
    const [content, setContent] = useState(() => {
        const saved = localStorage.getItem('baccus_content');
        return saved ? JSON.parse(saved) : {};
    });

    // Fetch permanent data from local dev backend on mount
    useEffect(() => {
        fetch('/api/content')
            .then(res => res.json())
            .then(data => {
                if (Object.keys(data).length > 0) {
                    setContent(data);
                }
            })
            .catch(err => console.error('Failed to load content from file:', err))
            .finally(() => {
                setIsReadyForSave(true);
            });
    }, []);

    // Save to localStorage immediately and sync to backend only AFTER initial load
    useEffect(() => {
        if (!isReadyForSave) return;

        try {
            localStorage.setItem('baccus_content', JSON.stringify(content));
        } catch (e) {
            console.warn('Could not save to localStorage (possibly quota exceeded due to large images).', e);
        }

        if (Object.keys(content).length > 0) {
            fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            }).catch(err => console.error('Failed to save content to file:', err));
        }
    }, [content, isReadyForSave]);

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
