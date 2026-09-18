"use client";

import { useState, useRef, useEffect } from "react";

const useIndustriesScroller = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Increased tolerance to 40px to account for CSS scroll-snap offsets
      setIsAtStart(scrollLeft <= 40);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 40);
    }
  };

  useEffect(() => {
    handleScroll();
    const timeout = setTimeout(handleScroll, 200);
    window.addEventListener("resize", handleScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 320;
      scrollRef.current.scrollBy({ left: -(cardWidth + 16), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 320;
      scrollRef.current.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    }
  };

  return {
    scrollRef,
    isAtStart,
    isAtEnd,
    handleScroll,
    scrollLeft,
    scrollRight,
  };
};

export default useIndustriesScroller;
