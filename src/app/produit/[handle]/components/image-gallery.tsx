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
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.altText || title}
                    fill
                    className="object-contain p-8"
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
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[68px] flex-shrink-0 max-h-[560px]">
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
        <div className="relative flex-1 aspect-square bg-white rounded-xl overflow-hidden">
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
            className="object-contain p-10"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
