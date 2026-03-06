'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

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
    onImageChange?.(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-2xl flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-zinc-300 mb-2" />
        <span className="text-zinc-400 text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: Full-screen edge-to-edge immersive slider */}
      <div className="lg:hidden -mx-4">
        <div className="relative bg-gradient-to-b from-zinc-100/80 to-white">
          {isNew && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#111] text-white text-[10px] font-black uppercase tracking-wider rounded-md">
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
                <div className="relative aspect-[16/9]">
                  <Image
                    src={image.url}
                    alt={image.altText || title}
                    fill
                    className="object-contain p-6"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Floating pagination capsule */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-[5px] bg-black/20 backdrop-blur-md px-2.5 py-1.5"
              style={{ borderRadius: 20 }}
            >
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    scrollRef.current?.scrollTo({
                      left: index * (scrollRef.current?.offsetWidth || 0),
                      behavior: 'smooth',
                    });
                  }}
                  className="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    width: activeIndex === index ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      activeIndex === index ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  }}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Vertical thumbnails LEFT + main image RIGHT */}
      <div className="hidden lg:flex gap-3">
        {/* Thumbnail strip — vertical */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[72px] flex-shrink-0 max-h-[600px]">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeIndex === index
                    ? 'border-[#DB021D] ring-1 ring-[#DB021D]/20 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300'
                  }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${title} ${index + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="relative flex-1 aspect-square bg-gradient-to-br from-zinc-50 to-white rounded-2xl overflow-hidden group">
          {isNew && (
            <span className="absolute top-5 left-5 z-10 px-3 py-1 bg-[#DB021D] text-white text-[11px] font-bold uppercase tracking-wider rounded shadow-md">
              Nouveau
            </span>
          )}
          <div className="absolute inset-0 bg-white">
            <Image
              key={activeIndex}
              src={images[activeIndex]?.url || images[0].url}
              alt={images[activeIndex]?.altText || title}
              fill
              className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
