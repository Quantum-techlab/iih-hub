import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";

interface MarqueeAlongSvgPathProps {
  path: string;
  children: React.ReactNode;
  baseVelocity?: number;
  slowdownOnHover?: boolean;
  draggable?: boolean;
  repeat?: number;
  dragSensitivity?: number;
  className?: string;
  grabCursor?: boolean;
}

const MarqueeAlongSvgPath: React.FC<MarqueeAlongSvgPathProps> = ({
  path,
  children,
  baseVelocity = 8,
  slowdownOnHover = true,
  draggable = false,
  repeat = 2,
  dragSensitivity = 0.1,
  className = "",
  grabCursor = false
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(0);
  
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [path]);

  useEffect(() => {
    if (pathLength > 0) {
      const velocity = isHovered && slowdownOnHover ? baseVelocity * 0.3 : baseVelocity;
      
      controls.start({
        x: [-pathLength, 0],
        transition: {
          duration: pathLength / velocity,
          ease: "linear",
          repeat: Infinity,
        }
      });
    }
  }, [pathLength, baseVelocity, isHovered, slowdownOnHover, controls]);

  const childrenArray = React.Children.toArray(children);
  const repeatedChildren = Array(repeat).fill(childrenArray).flat();

  return (
    <div 
      className={`relative overflow-hidden ${className} ${grabCursor ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <path
            ref={pathRef}
            id="marquee-path"
            d={path}
            fill="none"
            stroke="none"
          />
        </defs>
      </svg>
      
      <motion.div
        animate={controls}
        drag={draggable ? "x" : false}
        dragConstraints={{ left: -pathLength, right: 0 }}
        dragElastic={0.1}
        whileDrag={{ scale: 0.95 }}
        className="flex items-center space-x-4"
        style={{
          x: draggable ? x : undefined,
        }}
      >
        {repeatedChildren.map((child, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MarqueeAlongSvgPath;