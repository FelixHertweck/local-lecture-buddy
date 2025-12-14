"use client";

import { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePopupProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePopup({ src, alt, isOpen, onClose }: ImagePopupProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return;
    
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-lg max-w-4xl max-h-[90vh] flex flex-col dark:bg-black bg-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 border-b dark:border-white/10 border-gray-300 dark:bg-black bg-gray-100">
          <h2 className="dark:text-white text-gray-900 font-semibold">{alt}</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="dark:hover:bg-white/10 hover:bg-gray-200"
            >
              <ZoomIn className="w-4 h-4 dark:text-white text-gray-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="dark:hover:bg-white/10 hover:bg-gray-200"
            >
              <ZoomOut className="w-4 h-4 dark:text-white text-gray-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="dark:hover:bg-white/10 hover:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4 dark:text-white text-gray-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="dark:hover:bg-white/10 hover:bg-gray-200"
            >
              <X className="w-4 h-4 dark:text-white text-gray-900" />
            </Button>
          </div>
        </div>

        {/* Image container */}
        <div
          className="flex-1 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="select-none"
            style={{
              "--zoom": zoom,
              "--pan-x": `${pan.x / zoom}px`,
              "--pan-y": `${pan.y / zoom}px`,
              transform: `scale(var(--zoom)) translate(var(--pan-x), var(--pan-y))`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
              maxHeight: "calc(90vh - 60px)",
              maxWidth: "100%",
              willChange: isDragging ? "transform" : "auto",
            } as React.CSSProperties}
            draggable={false}
          />
        </div>

        {/* Zoom indicator */}
        <div className="dark:border-white/10 border-gray-300 px-4 py-2 text-center text-sm dark:text-white/60 text-gray-600 dark:bg-black bg-gray-100 border-t">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
