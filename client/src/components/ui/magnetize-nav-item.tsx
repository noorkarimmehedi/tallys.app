"use client" 

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "wouter";

interface MagnetizeNavItemProps {
    href: string;
    icon: React.ReactNode;
    label: React.ReactNode;
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
    
    // Refs for debouncing and optimization
    const timeoutRef = useRef<number | null>(null);
    const isInteractingRef = useRef(false);

    useEffect(() => {
        // Create particles with more optimized spacing and arrangement
        const newParticles = Array.from({ length: particleCount }, (_, i) => {
            // More strategic particle positioning for better visual effect
            const angle = (i / particleCount) * Math.PI * 2; // Distribute in a circle
            const distance = 20 + Math.random() * 30; // Vary the distance
            return {
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
            };
        });
        setParticles(newParticles);
    }, [particleCount]);
    
    // When isActive changes, reset interaction state and hide particles
    useEffect(() => {
        if (isActive) {
            isInteractingRef.current = false;
            setIsAttracting(false);
            
            // If particles are visible, make them return to their starting positions
            particlesControl.start((i) => {
                const particle = particles[i];
                return {
                    x: particle.x,
                    y: particle.y,
                    opacity: 0,
                    transition: { duration: 0.3 }
                };
            });
        }
    }, [isActive, particlesControl, particles]);

    // Clean up timeouts to prevent memory leaks
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleInteractionStart = useCallback(async () => {
        // Skip magnetize effect if this nav item is already active
        if (isActive) return;
        
        // Prevent rapid toggling with debounce
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        // Avoid unnecessary state updates
        if (isInteractingRef.current) return;
        isInteractingRef.current = true;
        
        // Batch state update with animation for better performance
        requestAnimationFrame(() => {
            setIsAttracting(true);
            particlesControl.start({
                x: 0,
                y: 0,
                transition: {
                    type: "spring",
                    stiffness: 120,  // Higher stiffness for even faster movement
                    damping: 16,     // Increased damping for smoother animation
                    mass: 0.5,       // Lower mass for more responsive particles
                    restDelta: 0.01  // More precise rest detection
                },
            });
        });
    }, [particlesControl, isActive]);

    const handleInteractionEnd = useCallback(() => {
        // Skip magnetize effect if this nav item is already active
        if (isActive) return;
        
        // Add debounce to prevent flickering if the user quickly moves in and out
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }
        
        // Use a slightly longer delay for better user experience
        timeoutRef.current = window.setTimeout(() => {
            // Use requestAnimationFrame for smoother visual updates
            requestAnimationFrame(() => {
                isInteractingRef.current = false;
                setIsAttracting(false);
                
                // Start particles returning to their original positions
                particlesControl.start((i) => {
                    const particle = particles[i];
                    return {
                        x: particle.x,
                        y: particle.y,
                        transition: {
                            type: "spring",
                            stiffness: 140, // Higher stiffness for more snappy return
                            damping: 18,    // Increased damping for smoother stops
                            mass: 0.7,      // Balanced mass for return
                            velocity: 3,    // Increased initial velocity
                            restDelta: 0.01 // More precise rest detection
                        },
                    };
                });
                
                timeoutRef.current = null;
            });
        }, 70); // Slightly longer delay for better visual effect
    }, [particlesControl, particles, isActive]);

    return (
        <Link
            href={href} 
            className={cn(
                "relative touch-none flex items-center px-3 py-2 text-xs font-medium",
                isActive ? "bg-blue-100/80 text-blue-900" : "text-gray-600 hover:bg-blue-100/50",
                "transition-all duration-300 group",
                className
            )}
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
        >
            {/* Memoized particle rendering for better performance */}
            {useMemo(() => {
                // Only render particles when needed AND only when not active (clicked)
                const shouldRenderParticles = !isActive && (isAttracting || particles.some(p => p.x !== 0 || p.y !== 0));
                if (!shouldRenderParticles) return null;
                
                return particles.map((particle, index) => (
                    <motion.div
                        key={particle.id}
                        custom={index}
                        initial={{ x: particle.x, y: particle.y }}
                        animate={particlesControl}
                        className={cn(
                            "absolute w-1 h-1 rounded-full",
                            "bg-blue-400 dark:bg-blue-300",
                            "transition-opacity duration-300",
                            "will-change-transform", // Hardware acceleration hint
                            isAttracting ? "opacity-80" : "opacity-0"
                        )}
                        style={{
                            // Use GPU-accelerated properties for smoother animation
                            contain: "layout", // Improve performance by isolating layout
                            backfaceVisibility: "hidden" // Additional GPU boost
                        }}
                    />
                ));
            }, [particles, isAttracting, particlesControl, isActive])}
            
            <span className={cn(
                "mr-2 relative",
                isActive ? "text-blue-800" : "text-gray-600 group-hover:text-blue-600"
            )}>
                {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
            </span>
            <span className={cn(
                "tracking-wide text-sm relative sidebar-alt-gothic",
                isActive ? "text-blue-900" : "group-hover:text-blue-700"
            )}>
                {label}
            </span>
        </Link>
    );
}