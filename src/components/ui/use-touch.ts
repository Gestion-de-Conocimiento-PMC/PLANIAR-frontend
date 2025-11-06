import * as React from "react";

/**
 * Detect if the device supports touch input. Uses both navigator.maxTouchPoints
 * and the presence of ontouchstart as a fallback.
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const detect = () => {
      try {
        // navigator.maxTouchPoints is the most reliable modern check
        if (typeof navigator !== "undefined" && "maxTouchPoints" in navigator) {
          // @ts-ignore
          setIsTouch(Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
          return;
        }
        // fallback: check for ontouchstart
        // @ts-ignore
        setIsTouch(typeof window !== "undefined" && "ontouchstart" in window);
      } catch (e) {
        setIsTouch(false);
      }
    };

    detect();
  }, []);

  return !!isTouch;
}
