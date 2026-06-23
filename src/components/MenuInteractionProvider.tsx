"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MenuContextValue = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible: boolean;
  chromeVisible: boolean;
  showMenu: () => void;
  hideMenu: () => void;
  closeOnNavigate: () => void;
  showChrome: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuInteractionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showMenu = useCallback(() => {
    clearHideTimer();
    setIsHovered(true);
  }, [clearHideTimer]);

  const hideMenu = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      hideTimerRef.current = null;
    }, 150);
  }, [clearHideTimer]);

  const closeOnNavigate = useCallback(() => {
    clearHideTimer();
    setIsOpen(false);
    setIsHovered(false);
    setChromeVisible(true);
  }, [clearHideTimer]);

  const showChrome = useCallback(() => {
    setChromeVisible(true);
  }, []);

  useEffect(() => {
    const scrollThreshold = 40;

    const updateChromeFromScroll = (currentY: number, previousY: number) => {
      if (isOpen) return;
      if (currentY < 12) {
        setChromeVisible(true);
        return;
      }
      if (currentY > previousY + scrollThreshold) {
        setChromeVisible(false);
      } else if (currentY < previousY - scrollThreshold) {
        setChromeVisible(true);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      updateChromeFromScroll(y, lastScrollYRef.current);
      lastScrollYRef.current = y;
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "pmp-quiz-scroll") return;
      if (isOpen) return;
      if (event.data.direction === "down") {
        setChromeVisible(false);
      } else if (event.data.direction === "up") {
        setChromeVisible(true);
      }
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("message", onMessage);
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearHideTimer();
        setIsOpen(false);
        setIsHovered(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearHideTimer]);

  const isVisible = isOpen || isHovered;

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      isVisible,
      chromeVisible,
      showMenu,
      hideMenu,
      closeOnNavigate,
      showChrome,
    }),
    [isOpen, isVisible, chromeVisible, showMenu, hideMenu, closeOnNavigate, showChrome],
  );

  return (
    <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
  );
}

export function useBlogMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useBlogMenu must be used within MenuInteractionProvider");
  }
  return ctx;
}
