'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Package, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: { url: string; altText: string | null }[];
  title: string;
  selectedImageIndex?: number;
  onImageChange?: (index: number) => void;
  isNew?: boolean;
}

export function ImageGallery({
  images,
  title,
  selectedImageIndex = 0,
  onImageChange,
  isNew = false,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(selectedImageIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedImageIndex === activeIndex) return;
    setActiveIndex(selectedImageIndex);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: selectedImageIndex * scrollRef.current.offsetWidth,
        behavior: 'instant',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex]);

  // Sync parent when activeIndex changes (from lightbox nav, keyboard, etc.)
  useEffect(() => {
    onImageChange?.(activeIndex);
  }, [activeIndex, onImageChange]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  // Keyboard navigation in lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowRight') {
      setActiveIndex((prev) => Math.min(prev + 1, images.length - 1));
    }
    if (e.key === 'ArrowLeft') {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        onImageChange?.(newIndex);
      }
    }
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const openLightbox = (index?: number) => {
    if (typeof index === 'number') {
      setActiveIndex(index);
    }
    setLightboxOpen(true);
  };

  const lightboxPrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const lightboxNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, images.length - 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-200 mb-2" />
        <span className="text-[#9CA3AF] text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: Edge-to-edge slider */}
      <div className="lg:hidden -mx-4">
        <div className="relative bg-white">
          {isNew && (
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider rounded">
              Nouveau
            </span>
          )}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-full snap-center">
                <div
                  className="relative aspect-[4/3] cursor-zoom-in"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || title}
                    fill
                    className="object-contain p-4"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    scrollRef.current?.scrollTo({
                      left: index * (scrollRef.current?.offsetWidth || 0),
                      behavior: 'smooth',
                    });
                  }}
                  className={`rounded-full transition-all duration-200 ${
                    activeIndex === index
                      ? 'w-5 h-1.5 bg-[#1A1A1A]'
                      : 'w-1.5 h-1.5 bg-gray-300'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Thumbnails left + main image right */}
      <div className="hidden lg:flex gap-3">
        {images.length > 1 && (
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[68px] flex-shrink-0 max-h-[440px]">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-[68px] h-[68px] flex-shrink-0 rounded-lg overflow-hidden border transition-all ${activeIndex === index
                    ? 'border-[#1A1A1A]'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${title} ${index + 1}`}
                  fill
                  className="object-contain p-1.5"
                  sizes="68px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          className="group relative flex-1 aspect-[4/3] bg-[#F5F5F5] rounded-xl overflow-hidden cursor-zoom-in"
          onClick={() => openLightbox()}
        >
          {isNew && (
            <span className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider rounded">
              Nouveau
            </span>
          )}
          <Image
            key={activeIndex}
            src={images[activeIndex]?.url || images[0].url}
            alt={images[activeIndex]?.altText || title}
            fill
            className="object-contain p-6"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <ZoomIn className="w-4 h-4 text-[#4B5563]" />
          </div>
        </div>
      </div>

      {/* Lightbox — rendered via portal to escape sticky/stacking contexts */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Prev */}
          {images.length > 1 && activeIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && activeIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-[90vw] h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]?.url || images[0].url}
              alt={images[activeIndex]?.altText || title}
              fill
              className="object-contain"
              sizes="90vw"
              quality={90}
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeIndex === index
                      ? 'border-white'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${title} ${index + 1}`}
                    fill
                    className="object-contain bg-white/10 p-1"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
