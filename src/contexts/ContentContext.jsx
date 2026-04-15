import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

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
    const saveTimer = useRef(null);
    const isSaving = useRef(false);

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

    // Debounced save to localStorage + backend
    const saveContent = useCallback(async (contentToSave) => {
        if (isSaving.current) return;
        isSaving.current = true;

        try {
            // Always save to localStorage immediately (with base64 intact — it's local)
            try {
                localStorage.setItem('baccus_content', JSON.stringify(contentToSave));
            } catch (e) {
                console.warn('Could not save to localStorage (possibly quota exceeded).', e);
            }

            if (Object.keys(contentToSave).length === 0) return;

            // In production, upload base64 images to blob storage first
            let cleaned = contentToSave;
            if (!IS_DEV) {
                cleaned = await extractAndUploadImages(contentToSave);
                // Update local state with URL-replaced content so future saves don't re-upload
                setContent(cleaned);
                try {
                    localStorage.setItem('baccus_content', JSON.stringify(cleaned));
                } catch (e) { /* ignore */ }
            }

            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleaned),
            });
        } catch (err) {
            console.error('Failed to save content:', err);
        } finally {
            isSaving.current = false;
        }
    }, []);

    // Debounced save effect — waits 800ms after last change before saving
    useEffect(() => {
        if (!isReadyForSave) return;

        // Immediate localStorage write for responsiveness
        try {
            localStorage.setItem('baccus_content', JSON.stringify(content));
        } catch (e) { /* ignore */ }

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveContent(content);
        }, 800);

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [content, isReadyForSave, saveContent]);

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
