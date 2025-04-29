import React, { useEffect, useState } from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import logoImage from "@assets/lgoooo.png";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export function EvervaultCardDemo() {
  const isMobile = useIsMobile();
  const [elementsVisible, setElementsVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  // Sequence the animations for a smoother experience
  useEffect(() => {
    // First animate the container
    const containerTimer = setTimeout(() => {
      setElementsVisible(true);
    }, 200);
    
    // Then animate the logo
    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 400);
    
    // Finally animate the text
    const textTimer = setTimeout(() => {
      setTextVisible(true);
    }, 700);
    
    return () => {
      clearTimeout(containerTimer);
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
    };
  }, []);

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: isMobile ? 0.98 : 0.99
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut" 
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, y: isMobile ? -5 : -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4
      }
    }
  };

  return (
    <motion.div 
      className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-lg mx-auto p-4 relative md:h-[28rem] h-auto mb-2"
      variants={containerVariants}
      initial="hidden"
      animate={elementsVisible ? "visible" : "hidden"}
    >
      <motion.div variants={iconVariants} custom={0}>
        <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      </motion.div>
      <motion.div variants={iconVariants} custom={1}>
        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      </motion.div>
      <motion.div variants={iconVariants} custom={2}>
        <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      </motion.div>
      <motion.div variants={iconVariants} custom={3}>
        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
      </motion.div>

      <motion.div 
        className="w-full md:min-h-[240px] min-h-[120px] flex items-center justify-center"
        variants={logoVariants}
        initial="hidden"
        animate={logoVisible ? "visible" : "hidden"}
      >
        <EvervaultCard 
          logoSrc={logoImage}
          className="md:h-[240px] h-28" 
        />
      </motion.div>
      
      {/* Description visible on desktop */}
      <motion.div 
        className="mt-4 hidden md:block dark:text-white text-black w-full"
        variants={textVariants}
        initial="hidden"
        animate={textVisible ? "visible" : "hidden"}
      >
        <motion.h2 
          className="text-lg md:text-xl font-medium mb-2"
          variants={textItemVariants}
        >
          What is tallys?
        </motion.h2>
        <motion.p 
          className="text-sm font-light mb-3"
          variants={textItemVariants}
        >
          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
        </motion.p>
        <motion.p 
          className="text-sm font-light"
          variants={textItemVariants}
        >
          Build forms, schedule events, brand with your logo, and manage responses all in one place.
        </motion.p>
      </motion.div>
      
      {/* Only show this on mobile */}
      <motion.div 
        className="mt-2 md:hidden dark:text-white text-black w-full"
        variants={textVariants}
        initial="hidden"
        animate={textVisible ? "visible" : "hidden"}
      >
        <motion.h2 
          className="text-lg font-medium mb-1"
          variants={textItemVariants}
        >
          What is tallys?
        </motion.h2>
        <motion.p 
          className="text-xs font-light mb-1"
          variants={textItemVariants}
        >
          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
        </motion.p>
        <motion.p 
          className="text-xs font-light"
          variants={textItemVariants}
        >
          Build forms, schedule events, brand with your logo, and manage responses all in one place.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}