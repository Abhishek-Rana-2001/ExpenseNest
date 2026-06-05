import { useOutlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useNavigation } from "@/context/NavigationContext";
import { useRef } from "react";
import useResponsive from "@/hooks/useResponsive";

const AnimatedOutlet = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const { direction } = useNavigation();
  const { isMobile } = useResponsive();

  const prevOutletRef = useRef(outlet);
  const prevPathRef = useRef(location.pathname);

  if (location.pathname !== prevPathRef.current) {
    prevOutletRef.current = outlet;
    prevPathRef.current = location.pathname;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prevPathRef.current}
        initial={{
          y: direction === 1 ? 80 : -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: direction === 1 ? -80 : 80,
          opacity: 0,
        }}
        transition={{
          duration: isMobile ? 0.1 : 0.35,
          ease: "easeInOut",
        }}
        className="p-5"
      >
        {prevOutletRef.current}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
