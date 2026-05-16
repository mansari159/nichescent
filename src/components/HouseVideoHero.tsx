'use client';
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface HouseVideoHeroProps {
  cityName: string;
  houseName: string;
  storyLine?: string;
  fallbackImage?: string;
}

function getVideoForCity(city: string): string | null {
  const map: Record<string, string> = {
    dubai: '/videos/dubai.mp4',
    abu_dhabi: '/videos/abu-dhabi.mp4',
    riyadh: '/videos/riyadh.mp4',
    paris: '/videos/paris.mp4',
    london: '/videos/london.mp4',
    new_york: '/videos/new-york.mp4',
    grasse: '/videos/grasse.mp4',
    mumbai: '/videos/mumbai.mp4',
    istanbul: '/videos/istanbul.mp4',
  };
  const key = city.toLowerCase().replace(/\s+/g, '_');
  return map[key] ?? null;
}

export default function HouseVideoHero({ cityName, houseName, storyLine, fallbackImage }: HouseVideoHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const videoSrc = getVideoForCity(cityName);

  return (
    // overflow:hidden is REQUIRED — parallax translateY clips within section
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Background: video or image */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y }}>
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.55)' }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={fallbackImage || '/placeholder.jpg'}
            alt={cityName}
            fill
            className="object-cover"
            style={{ filter: 'brightness(0.55)' }}
            priority
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(14,11,8,0.3) 0%, rgba(14,11,8,0.7) 100%)' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 max-w-5xl mx-auto"
        style={{ opacity }}
      >
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: '#B8762A' }}>
          {cityName}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light mb-6" style={{ color: '#f2e8d8' }}>
          {houseName}
        </h1>
        {storyLine && (
          <p className="font-body text-lg max-w-xl font-light" style={{ color: '#e0d0b8' }}>
            {storyLine}
          </p>
        )}
      </motion.div>
    </section>
  );
}
