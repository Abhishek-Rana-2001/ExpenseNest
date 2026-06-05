import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = "xs" | keyof typeof BREAKPOINTS;

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

const useResponsive = () => {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? BREAKPOINTS.lg : window.innerWidth
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth((prev) =>
          prev === window.innerWidth ? prev : window.innerWidth
        );
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const breakpoint = getBreakpoint(width);

  return {
    width,
    breakpoint,
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
};

export default useResponsive;
