import { useEffect, RefObject } from "react";

export const usePreventPageScroll = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (
        e.deltaY > 0 &&
        element.scrollTop + element.clientHeight >= element.scrollHeight
      ) {
        return;
      }
      if (e.deltaY < 0 && element.scrollTop === 0) {
        return;
      }
      e.stopPropagation();
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [ref]);
};
