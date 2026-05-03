import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
      {/* Deep Flowing Aurora Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: ['-10%', '20%', '-10%'],
          y: ['-10%', '10%', '-10%'],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(0,240,255,0) 70%)' }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: ['10%', '-20%', '10%'],
          y: ['0%', '30%', '0%'],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] -right-[20%] w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(139,92,246,0) 70%)' }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: ['0%', '15%', '0%'],
          y: ['10%', '-20%', '10%'],
          rotate: [0, 60, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[30%] left-[20%] w-[90vw] h-[90vw] rounded-full blur-[150px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(245,158,11,0) 70%)' }}
      />
      
      {/* Animated Flowing SVG Waves Layer */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none">
         <motion.div 
            animate={{ y: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="w-full h-[200%] absolute top-0 left-0"
         >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[200%] h-full ml-[-50%] text-white" stroke="currentColor" fill="none" strokeWidth="0.5">
               <path d="M0 20 Q 25 10, 50 20 T 100 20" />
               <path d="M0 40 Q 25 30, 50 40 T 100 40" />
               <path d="M0 60 Q 25 50, 50 60 T 100 60" />
               <path d="M0 80 Q 25 70, 50 80 T 100 80" />
               <path d="M0 100 Q 25 90, 50 100 T 100 100" />
            </svg>
         </motion.div>
      </div>

       {/* Flowing animated grid on top */}
       <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_80%)]">
         <motion.div
            animate={{
              backgroundPosition: ['0px 0px', '0px 40px']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-white/[0.02]"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
         />
      </div>
      
      {/* Fine-grained Noise for Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiLz48L3N2Zz4=')]"></div>
    </div>
  );
}
