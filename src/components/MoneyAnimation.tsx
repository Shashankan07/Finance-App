import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MONEY_SYMBOLS = ['₹', '💰', '💸', '🪙', '₹'];

export default function MoneyAnimation() {
  const [items, setItems] = useState<{ id: number; x: number; delay: number; symbol: string; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate random money items
    const newItems = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      delay: Math.random() * 10, // seconds
      symbol: MONEY_SYMBOLS[Math.floor(Math.random() * MONEY_SYMBOLS.length)],
      size: Math.random() * 24 + 16, // 16px to 40px
      duration: Math.random() * 5 + 7, // 7 to 12 seconds falling
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: -100, x: `${item.x}vw`, opacity: 0, rotate: 0 }}
          animate={{ 
            y: '120vh', 
            opacity: [0, 1, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            fontSize: `${item.size}px`,
            filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))'
          }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
}
