import { motion } from 'framer-motion';
import React from 'react';
import '../styles/FloatingDecorations.css';

const FloatingDecorations: React.FC = () => {
    // Fixed positions for truly even distribution - no clustering
    const butterflyPositions = [
        { left: '15%', top: '20%' },
        { left: '75%', top: '25%' },
        { left: '35%', top: '60%' },
        { left: '85%', top: '70%' },
        { left: '55%', top: '35%' },
    ];

    const heartPositions = [
        { left: '25%', top: '40%' },
        { left: '65%', top: '15%' },
        { left: '45%', top: '75%' },
        { left: '10%', top: '65%' },
        { left: '80%', top: '50%' },
        { left: '50%', top: '10%' },
    ];

    const flowerPositions = [
        { left: '20%', top: '80%' },
        { left: '70%', top: '60%' },
        { left: '40%', top: '25%' },
        { left: '90%', top: '35%' },
        { left: '60%', top: '85%' },
        { left: '30%', top: '45%' },
        { left: '5%', top: '35%' },
    ];

    const butterflies = butterflyPositions.map((pos, i) => ({
        ...pos,
        id: i,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
    }));

    const hearts = heartPositions.map((pos, i) => ({
        ...pos,
        id: i,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 8,
    }));

    const flowers = flowerPositions.map((pos, i) => ({
        ...pos,
        id: i,
        delay: Math.random() * 5,
        duration: 18 + Math.random() * 12,
    }));

    return (
        <div className="floating-decorations">
            {/* Butterflies */}
            {butterflies.map((butterfly) => (
                <motion.div
                    key={`butterfly-${butterfly.id}`}
                    className="decoration butterfly"
                    style={{ left: butterfly.left, top: butterfly.top }}
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 15, 0, -15, 0],
                        rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                        duration: butterfly.duration,
                        repeat: Infinity,
                        delay: butterfly.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <svg width="48" height="48" viewBox="0 0 32 32" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0.8">
                        {/* Simple butterfly with 4 clear wings */}
                        {/* Body */}
                        <ellipse cx="16" cy="16" rx="1.5" ry="7" />
                        {/* Upper left wing */}
                        <path d="M14 12 Q8 8 5 10 Q2 12 4 16 Q6 18 12 15 Z" strokeLinejoin="round" />
                        <ellipse cx="8" cy="12" rx="2" ry="1.5" fillOpacity="0.4" stroke="none" />
                        {/* Upper right wing */}
                        <path d="M18 12 Q24 8 27 10 Q30 12 28 16 Q26 18 20 15 Z" strokeLinejoin="round" />
                        <ellipse cx="24" cy="12" rx="2" ry="1.5" fillOpacity="0.4" stroke="none" />
                        {/* Lower left wing */}
                        <path d="M14 18 Q9 22 6 24 Q4 26 6 28 Q8 28 13 23 Z" strokeLinejoin="round" />
                        <circle cx="9" cy="24" r="1.5" fillOpacity="0.4" stroke="none" />
                        {/* Lower right wing */}
                        <path d="M18 18 Q23 22 26 24 Q28 26 26 28 Q24 28 19 23 Z" strokeLinejoin="round" />
                        <circle cx="23" cy="24" r="1.5" fillOpacity="0.4" stroke="none" />
                        {/* Antennae */}
                        <path d="M15 9 Q13 6 11 4" strokeLinecap="round" strokeWidth="1" fill="none" />
                        <path d="M17 9 Q19 6 21 4" strokeLinecap="round" strokeWidth="1" fill="none" />
                        <circle cx="11" cy="4" r="1" />
                        <circle cx="21" cy="4" r="1" />
                    </svg>
                </motion.div>
            ))}

            {/* Hearts */}
            {hearts.map((heart) => (
                <motion.div
                    key={`heart-${heart.id}`}
                    className="decoration heart"
                    style={{ left: heart.left, top: heart.top }}
                    animate={{
                        y: [0, -15, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                        duration: heart.duration,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 21c-1-1-9-6-9-12 0-3 2-5 4.5-5C9.5 4 11 5 12 7c1-2 2.5-3 4.5-3 2.5 0 4.5 2 4.5 5 0 6-8 11-9 12z" />
                    </svg>
                </motion.div>
            ))}

            {/* Flowers */}
            {flowers.map((flower) => (
                <motion.div
                    key={`flower-${flower.id}`}
                    className="decoration flower"
                    style={{ left: flower.left, top: flower.top }}
                    animate={{
                        rotate: [0, 360],
                        y: [0, -12, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: flower.duration,
                        repeat: Infinity,
                        delay: flower.delay,
                        ease: 'linear',
                    }}
                >
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <ellipse cx="12" cy="7" rx="2.5" ry="3" />
                        <ellipse cx="12" cy="17" rx="2.5" ry="3" />
                        <ellipse cx="7" cy="12" rx="3" ry="2.5" />
                        <ellipse cx="17" cy="12" rx="3" ry="2.5" />
                        <ellipse cx="8.5" cy="8.5" rx="2" ry="2.5" transform="rotate(-45 8.5 8.5)" />
                        <ellipse cx="15.5" cy="8.5" rx="2" ry="2.5" transform="rotate(45 15.5 8.5)" />
                        <ellipse cx="8.5" cy="15.5" rx="2" ry="2.5" transform="rotate(45 8.5 15.5)" />
                        <ellipse cx="15.5" cy="15.5" rx="2" ry="2.5" transform="rotate(-45 15.5 15.5)" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingDecorations;
