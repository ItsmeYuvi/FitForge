'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function InteractiveCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoverText, setHoverText] = useState('');

  useEffect(() => {
    // Check if device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Enable custom cursor styles
    document.documentElement.classList.add('custom-cursor-active');

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;

    const onMouseMove = (e: MouseEvent) => {
      setHidden(false);
      
      // Instantly position the dot
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      // Spring trail for the outer ring
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    // Attach event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Hover effect on buttons, anchors, and inputs
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], .interactive-card'
      );

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', (e) => {
          setHovered(true);
          const target = e.currentTarget as HTMLElement;
          const text = target.getAttribute('data-cursor-text') || '';
          setHoverText(text);
          
          gsap.to(ring, {
            scale: 2.2,
            borderColor: '#39ff14',
            backgroundColor: 'rgba(57, 255, 20, 0.05)',
            duration: 0.3,
          });
          gsap.to(dot, {
            scale: 0.5,
            backgroundColor: '#39ff14',
            duration: 0.3,
          });
        });

        el.addEventListener('mouseleave', () => {
          setHovered(false);
          setHoverText('');
          
          gsap.to(ring, {
            scale: 1,
            borderColor: '#00f0ff',
            backgroundColor: 'transparent',
            duration: 0.3,
          });
          gsap.to(dot, {
            scale: 1,
            backgroundColor: '#00f0ff',
            duration: 0.3,
          });
        });
      });
    };

    // Run initial hook
    addHoverListeners();

    // Re-run hover listener attachments periodically to capture dynamic changes (e.g., loaded blueprint pages)
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observer.disconnect();
    };
  }, []);

  // Return null if on mobile/touch screen (hidden by CSS/JS condition)
  return (
    <>
      {/* Tiny inner neon cyan dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 bg-cyber-blue rounded-full pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          hidden ? 'opacity-0' : 'opacity-100'
        } ${clicked ? 'scale-75' : ''}`}
      />
      {/* Outer spring-trailing neon cyan ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 w-8 h-8 border border-cyber-blue rounded-full pointer-events-none z-9998 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-300 ${
          hidden ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {hoverText && (
          <span className="text-[6px] tracking-widest uppercase font-mono text-neon-green absolute whitespace-nowrap pointer-events-none">
            {hoverText}
          </span>
        )}
      </div>
    </>
  );
}
