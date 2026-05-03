import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DOT_COLORS = ['#10b981', '#00f0ff', '#8b5cf6', '#3b82f6', '#ffffff'];

export default function MoneyAnimation() {
  const [items, setItems] = useState<{ id: number; x: number; y: number; delay: number; color: string; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate ambient dust
    const newItems = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      delay: Math.random() * 5, // seconds
      color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
      size: Math.random() * 3 + 1, // 1px to 4px
      duration: Math.random() * 10 + 10, // 10 to 20 seconds drifting
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-40">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: `${item.y}vh`, x: `${item.x}vw`, opacity: 0, scale: 0 }}
          animate={{ 
            y: [`${item.y}vh`, `${item.y - Math.random() * 20}vh`], 
            x: [`${item.x}vw`, `${item.x + (Math.random() * 20 - 10)}vw`],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute rounded-full"
          style={{
            width: item.size,
            height: item.size,
            backgroundColor: item.color,
            boxShadow: `0 0 ${item.size * 3}px ${item.size}px ${item.color}80`
          }}
        />
      ))}
    </div>
  );
}
