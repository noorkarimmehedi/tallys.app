"use client" 

import * as React from "react"
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/ui/button";
import { MousePointerClick } from "lucide-react";

interface ParticleButtonProps extends ButtonProps {
    onSuccess?: () => void;
    successDuration?: number;
}

function ParticleItem({ 
    index, 
    centerX, 
    centerY 
}: { 
    index: number, 
    centerX: number, 
    centerY: number 
}) {
    const controls = useAnimationControls();
    
    useEffect(() => {
        controls.start({
            scale: [0, 1, 0],
            x: [0, (index % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
            y: [0, -Math.random() * 50 - 20],
            transition: {
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
            }
        });
    }, [controls, index]);

    return (
        <motion.div
            key={index}
            className="fixed w-1 h-1 bg-black dark:bg-white rounded-full"
            style={{ left: centerX, top: centerY }}
            initial={{
                scale: 0,
                x: 0,
                y: 0,
            }}
            animate={controls}
        />
    );
}

function SuccessParticles({
    buttonRef,
}: {
    buttonRef: React.RefObject<HTMLButtonElement>;
}) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }
    }, [buttonRef]);

    return (
        <AnimatePresence>
            {[...Array(6)].map((_, i) => (
                <ParticleItem 
                    key={i} 
                    index={i} 
                    centerX={position.x} 
                    centerY={position.y} 
                />
            ))}
        </AnimatePresence>
    );
}

function ParticleButton({
    children,
    onClick,
    onSuccess,
    successDuration = 1000,
    className,
    ...props
}: ParticleButtonProps) {
    const [showParticles, setShowParticles] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
        }
        
        setShowParticles(true);

        if (onSuccess) {
            onSuccess();
        }

        setTimeout(() => {
            setShowParticles(false);
        }, successDuration);
    };

    return (
        <>
            {showParticles && <SuccessParticles buttonRef={buttonRef} />}
            <Button
                ref={buttonRef}
                onClick={handleClick}
                className={cn(
                    "relative",
                    showParticles && "scale-95",
                    "transition-transform duration-100",
                    className
                )}
                {...props}
            >
                {children}
                <MousePointerClick className="h-4 w-4 ml-2" />
            </Button>
        </>
    );
}

export { ParticleButton }