"use client" 

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";

interface MagnetizeNavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    className?: string;
    particleCount?: number;
    attractRadius?: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
}

export function MagnetizeNavItem({
    href,
    icon,
    label,
    isActive,
    className,
    particleCount = 8,
    attractRadius = 30,
}: MagnetizeNavItemProps) {
    const [isAttracting, setIsAttracting] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const particlesControl = useAnimation();

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100 - 50,
            y: Math.random() * 40 - 20,
        }));
        setParticles(newParticles);
    }, [particleCount]);

    const handleInteractionStart = useCallback(async () => {
        setIsAttracting(true);
        await particlesControl.start({
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 10,
            },
        });
    }, [particlesControl]);

    const handleInteractionEnd = useCallback(async () => {
        setIsAttracting(false);
        await particlesControl.start((i) => ({
            x: particles[i].x,
            y: particles[i].y,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        }));
    }, [particlesControl, particles]);

    return (
        <Link
            href={href} 
            className={cn(
                "relative touch-none flex items-center px-3 py-2 text-xs font-medium",
                isActive ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50",
                "transition-all duration-300 group",
                className
            )}
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
        >
            {particles.map((_, index) => (
                <motion.div
                    key={index}
                    custom={index}
                    initial={{ x: particles[index].x, y: particles[index].y }}
                    animate={particlesControl}
                    className={cn(
                        "absolute w-1 h-1 rounded-full",
                        "bg-violet-400 dark:bg-violet-300",
                        "transition-opacity duration-300",
                        isAttracting ? "opacity-80" : "opacity-0"
                    )}
                />
            ))}
            <span className={cn(
                "mr-2 relative",
                isActive ? "text-gray-800" : "text-gray-600"
            )}>
                {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
            </span>
            <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm relative">
                {label}
            </span>
        </Link>
    );
}