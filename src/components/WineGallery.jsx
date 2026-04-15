import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

// Sample data for testing
export const SAMPLE_WINES = [
  { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80', title: 'Château Margaux', year: '2015' },
  { url: 'https://images.unsplash.com/photo-1474722883378-4d7e17f0bdc4?w=600&q=80', title: 'Barolo Riserva', year: '2018' },
  { url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=900&q=80', title: 'Vintage Tasting', year: '2023' },
  { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=700&q=80', title: 'Pinot Noir Reserve', year: '2020' },
  { url: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=850&q=80', title: 'Cellar Selection', year: '2019' },
  { url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=650&q=80', title: 'Sommelier\'s Pick', year: '2021' },
  { url: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=750&q=80', title: 'Grand Cru Classé', year: '2016' },
  { url: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80', title: 'Harvest Evening', year: '2022' },
];

const ROW_HEIGHT = 220;
const ROW_HEIGHT_MOBILE = 160;
const GAP = 6;
const DEFAULT_ASPECT = 1.5;

export default function WineGallery({ images = [], onDelete = null }) {
  const [ratios, setRatios] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Measure container and detect mobile viewport
  useEffect(() => {
    const measure = () => {
      setIsMobile(window.innerWidth < 640);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Store natural aspect ratios as images load
  const handleImageLoad = useCallback((index, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setRatios(prev => ({ ...prev, [index]: naturalWidth / naturalHeight }));
    }
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') setSelectedIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setSelectedIndex(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex, images.length]);

  // Reset lightbox loaded state on index change
  useEffect(() => {
    setLightboxLoaded(false);
  }, [selectedIndex]);

  const rowHeight = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT;

  // Build justified rows
  const rows = [];
  if (containerWidth > 0 && images.length > 0) {
    let currentRow = [];
    let currentRowWidth = 0;

    images.forEach((img, idx) => {
      const aspect = ratios[idx] || DEFAULT_ASPECT;
      const itemWidth = aspect * rowHeight;
      currentRow.push({ ...img, idx, aspect });
      currentRowWidth += itemWidth;

      const gaps = currentRow.length > 1 ? (currentRow.length - 1) * GAP : 0;
      if (currentRowWidth + gaps >= containerWidth) {
        rows.push({ items: currentRow, full: true });
        currentRow = [];
        currentRowWidth = 0;
      }
    });

    // Last incomplete row
    if (currentRow.length > 0) {
      rows.push({ items: currentRow, full: false });
    }
  }

  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600 text-lg">
        No images to display.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Justified Grid */}
      <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex" style={{ gap: `${GAP}px` }}>
            {row.items.map((item) => {
              const aspect = item.aspect;
              // For full rows, flex-grow proportional to aspect ratio fills the width
              // For incomplete last row, constrain to natural size
              const flexStyle = row.full
                ? { flexGrow: aspect, flexBasis: 0 }
                : { width: `${aspect * rowHeight}px`, flexShrink: 0, flexGrow: 0 };

              return (
                <div
                  key={item.idx}
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-[#a41e32]/40 transition-all duration-300"
                  style={{ ...flexStyle, height: `${rowHeight}px` }}
                  onClick={() => setSelectedIndex(item.idx)}
                >
                  <img
                    src={item.url}
                    alt={item.title || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={(e) => handleImageLoad(item.idx, e)}
                    loading="lazy"
                  />

                  {/* Delete button (only when onDelete is provided) */}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.idx); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-900/80 text-white rounded opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border-none cursor-pointer backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex - 1 + images.length) % images.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border-none cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex + 1) % images.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border-none cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Image + Caption */}
          <div
            className="flex flex-col items-center max-w-[90vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.url}
              alt={selected.title || ''}
              onLoad={() => setLightboxLoaded(true)}
              className={`max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain transition-all duration-500 ${lightboxLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            />
            {(selected.title || selected.year) && (
              <div className={`mt-5 text-center transition-all duration-500 delay-100 ${lightboxLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {selected.title && (
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    {selected.title}
                  </h3>
                )}
                {selected.year && (
                  <p className="text-[#d4a0a9] text-sm mt-1 font-medium">
                    {selected.year}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gray-500 text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
