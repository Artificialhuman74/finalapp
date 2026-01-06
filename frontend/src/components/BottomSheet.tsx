import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo, useDragControls } from 'framer-motion';

interface BottomSheetProps {
    children: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ children }) => {
    const dragControls = useDragControls();
    const controls = useAnimation();
    const [snapState, setSnapState] = useState<'collapsed' | 'half' | 'full'>('collapsed');

    // Calculate positions
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const POSITIONS = {
        collapsed: windowHeight - 160,
        half: windowHeight * 0.5,
        full: 100
    };

    useEffect(() => {
        controls.start({
            y: POSITIONS[snapState],
            transition: { type: 'spring', damping: 25, stiffness: 300 }
        });
    }, [snapState]);

    const onDragEnd = (event: any, info: PanInfo) => {
        const { offset, velocity } = info;
        const swipe = velocity.y;

        if (swipe > 200) {
            if (snapState === 'full') setSnapState('half');
            else if (snapState === 'half') setSnapState('collapsed');
        } else if (swipe < -200) {
            if (snapState === 'collapsed') setSnapState('half');
            else if (snapState === 'half') setSnapState('full');
        } else {
            // Snap to closest based on position
            const currentY = POSITIONS[snapState] + offset.y;
            const distToCollapsed = Math.abs(currentY - POSITIONS.collapsed);
            const distToHalf = Math.abs(currentY - POSITIONS.half);
            const distToFull = Math.abs(currentY - POSITIONS.full);

            if (distToFull < distToHalf && distToFull < distToCollapsed) setSnapState('full');
            else if (distToHalf < distToCollapsed) setSnapState('half');
            else setSnapState('collapsed');
        }
    };

    return (
        <motion.div
            initial={{ y: POSITIONS.collapsed }}
            animate={controls}
            drag="y"
            dragListener={false} // Important: Disable auto drag
            dragControls={dragControls}
            dragConstraints={{ top: POSITIONS.full, bottom: POSITIONS.collapsed }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '100vh',
                zIndex: 9000,
                pointerEvents: 'none', // Allow clicks to pass through top area
            }}
        >
            <div style={{
                height: '100%',
                background: 'white',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -5px 30px rgba(0,0,0,0.15)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Handle - Starts Drag */}
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'grab',
                        background: 'white',
                        touchAction: 'none',
                        borderBottom: '1px solid #f0f0f0'
                    }}
                >
                    <div style={{
                        width: '60px',
                        height: '6px',
                        background: '#d1d5db',
                        borderRadius: '10px'
                    }} />
                </div>

                {/* Content - Scrolls */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingBottom: '200px', // Increased to 200px to clear dock
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

export default BottomSheet;
