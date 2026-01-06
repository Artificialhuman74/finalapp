import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { Children, cloneElement, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

import '../styles/Dock.css';

interface DockItemProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    mouseX: MotionValue<number>;
    spring: { mass: number; stiffness: number; damping: number };
    distance: number;
    magnification: number;
    onLongPress?: () => void;
    baseItemSize: number;
}

function DockItem({ children, className = '', onClick, onLongPress, mouseX, spring, distance, magnification, baseItemSize }: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isHovered = useMotionValue(0);
    const [isPressed, setIsPressed] = useState(false);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);

    const mouseDistance = useTransform(mouseX, val => {
        const rect = ref.current?.getBoundingClientRect() ?? {
            x: 0,
            width: baseItemSize
        };
        return val - rect.x - baseItemSize / 2;
    });

    const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
    const size = useSpring(targetSize, spring);

    const startPress = () => {
        if (!onLongPress) return;
        setIsPressed(true);
        pressTimer.current = setTimeout(() => {
            onLongPress();
            setIsPressed(false);
            if (navigator.vibrate) navigator.vibrate(200);
        }, 1500); // 1.5s long press
    };

    const endPress = () => {
        if (!onLongPress) return;
        setIsPressed(false);
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    return (
        <motion.div
            ref={ref}
            style={{
                width: size,
                height: size,
                position: 'relative'
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            onClick={onClick}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            className={`dock-item ${className}`}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
        >
            {/* Long press animation ring */}
            {onLongPress && isPressed && (
                <svg
                    style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        width: 'calc(100% + 8px)',
                        height: 'calc(100% + 8px)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="4"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="4"
                        strokeDasharray="301.59" // 2 * pi * 48
                        strokeDashoffset="301.59"
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.5, ease: "linear" }}
                    />
                </svg>
            )}

            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Children.map(children, child => cloneElement(child as React.ReactElement<any>, { isHovered }))}
            </div>
        </motion.div>
    );
}

interface DockLabelProps {
    children: ReactNode;
    className?: string;
    isHovered?: MotionValue<number>;
}

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isHovered) return;
        const unsubscribe = isHovered.on('change', latest => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`dock-label ${className}`}
                    role="tooltip"
                    style={{ x: '-50%' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface DockIconProps {
    children: ReactNode;
    className?: string;
}

function DockIcon({ children, className = '' }: DockIconProps) {
    return <div className={`dock-icon ${className}`}>{children}</div>;
}

interface DockItem {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    onLongPress?: () => void;
    className?: string;
}

interface DockProps {
    items: DockItem[];
    className?: string;
    spring?: { mass: number; stiffness: number; damping: number };
    magnification?: number;
    distance?: number;
    panelHeight?: number;
    dockHeight?: number;
    baseItemSize?: number;
}

export default function Dock({
    items,
    className = '',
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = 70,
    distance = 200,
    panelHeight = 68,
    dockHeight = 256,
    baseItemSize = 50
}: DockProps) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isTouch || isSmallScreen);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Disable magnification on mobile and reduce item size to fit
    const effectiveMagnification = isMobile ? (baseItemSize > 45 ? 45 : baseItemSize) : magnification;
    const effectiveDistance = isMobile ? 0 : distance;
    const effectiveBaseSize = isMobile ? (baseItemSize > 45 ? 45 : baseItemSize) : baseItemSize;

    const maxHeight = useMemo(
        () => Math.max(dockHeight, effectiveMagnification + effectiveMagnification / 2 + 4),
        [effectiveMagnification, dockHeight]
    );
    const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
    const height = useSpring(heightRow, spring);

    return (
        <motion.div style={{ height, scrollbarWidth: 'none' }} className="dock-outer">
            <motion.div
                onMouseMove={({ pageX }) => {
                    isHovered.set(1);
                    mouseX.set(pageX);
                }}
                onMouseLeave={() => {
                    isHovered.set(0);
                    mouseX.set(Infinity);
                }}
                className={`dock-panel ${className}`}
                style={{ height: panelHeight }}
                role="toolbar"
                aria-label="Application dock"
            >
                {items.map((item, index) => (
                    <DockItem
                        key={index}
                        onClick={item.onClick}
                        onLongPress={item.onLongPress}
                        className={item.className}
                        mouseX={mouseX}
                        spring={spring}
                        distance={effectiveDistance}
                        magnification={effectiveMagnification}
                        baseItemSize={effectiveBaseSize}
                    >
                        <DockIcon>{item.icon}</DockIcon>
                        <DockLabel>{item.label}</DockLabel>
                    </DockItem>
                ))}
            </motion.div>
        </motion.div>
    );
}
