import React, { useEffect, useRef } from 'react';
import { assetManager } from '../assets/assetManifest';

interface SpritePreviewProps {
  sheetUrl: string;
  frames: number;
  fps?: number;
  frameWidth?: number;
  frameHeight?: number;
  animate?: boolean;
  holdFinal?: boolean;
  flipX?: boolean;
  className?: string;
  ariaLabel: string;
}

export const SpritePreview: React.FC<SpritePreviewProps> = ({
  sheetUrl,
  frames,
  fps = 9,
  frameWidth = 288,
  frameHeight = 288,
  animate = true,
  holdFinal = false,
  flipX = false,
  className = '',
  ariaLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let timerId = 0;
    let cancelled = false;
    let frameIndex = 0;

    const drawFrame = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (flipX) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        img,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      ctx.restore();
    };

    assetManager
      .loadImage(sheetUrl)
      .then((img) => {
        if (cancelled) return;
        drawFrame(img);
        if (animate && frames > 1) {
          const stepMs = Math.max(60, Math.round(1000 / fps));
          timerId = window.setInterval(() => {
            if (cancelled) return;
            if (frameIndex + 1 < frames) {
              frameIndex++;
              drawFrame(img);
            } else if (!holdFinal) {
              frameIndex = 0;
              drawFrame(img);
            } else {
              window.clearInterval(timerId);
              timerId = 0;
            }
          }, stepMs);
        }
      })
      .catch(() => {
        // Keep clean empty canvas if unavailable
      });

    return () => {
      cancelled = true;
      if (timerId) window.clearInterval(timerId);
    };
  }, [sheetUrl, frames, fps, frameWidth, frameHeight, animate, holdFinal, flipX]);

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      role="img"
      aria-label={ariaLabel}
      className={`pixelated block ${className}`}
    />
  );
};
