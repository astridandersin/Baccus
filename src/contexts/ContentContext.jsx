import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ContentContext = createContext();

const IS_DEV = import.meta.env.DEV;

// Upload a base64 data URI to /api/upload and return the blob URL
async function uploadImage(dataUri) {
    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUri }),
    });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
}

// Recursively walk a value and upload any base64 data URIs found
async function extractAndUploadImages(value) {
    if (typeof value === 'string') {
        if (value.startsWith('data:image/')) {
            return await uploadImage(value);
        }
        return value;
    }
    if (Array.isArray(value)) {
        return Promise.all(value.map(item => extractAndUploadImages(item)));
    }
    if (value && typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = await extractAndUploadImages(val);
        }
        return result;
    }
    return value;
}

export function ContentProvider({ children }) {
    const [isReadyForSave, setIsReadyForSave] = useState(false);
    const [content, setContent] = useState(() => {
        const saved = localStorage.getItem('baccus_content');
        return saved ? JSON.parse(saved) : {};
    });
    const contentRef = useRef(content);
    contentRef.current = content;

    // Fetch permanent data from backend on mount
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

    // Save immediately on every content change (no debounce)
    useEffect(() => {
        if (!isReadyForSave) return;

        // Save to localStorage immediately
        try {
            localStorage.setItem('baccus_content', JSON.stringify(content));
        } catch (e) {
            console.warn('Could not save to localStorage (possibly quota exceeded).', e);
        }

        if (Object.keys(content).length === 0) return;

        // Save to backend immediately — content without base64 is small (~10KB)
        fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content),
        }).catch(err => console.error('Failed to save content to file:', err));

        // In production, upload any new base64 images in the background
        // Once uploaded, save again with URLs replacing the base64 strings
        if (!IS_DEV) {
            extractAndUploadImages(content).then(cleaned => {
                const cleanedStr = JSON.stringify(cleaned);
                const originalStr = JSON.stringify(contentRef.current);
                // Only update if images were actually replaced
                if (cleanedStr !== originalStr) {
                    setContent(cleaned);
                }
            }).catch(err => console.error('Failed to upload images:', err));
        }
    }, [content, isReadyForSave]);

    // Flush pending save on page unload as a safety net
    useEffect(() => {
        const handleBeforeUnload = () => {
            const data = JSON.stringify(contentRef.current);
            navigator.sendBeacon('/api/content', new Blob([data], { type: 'application/json' }));
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

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
