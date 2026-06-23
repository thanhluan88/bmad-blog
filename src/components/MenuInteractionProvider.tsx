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
  scheduleHideChrome: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

const CHROME_HIDE_DELAY_MS = 450;

export function MenuInteractionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const menuHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chromeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMenuHideTimer = useCallback(() => {
    if (menuHideTimerRef.current) {
      clearTimeout(menuHideTimerRef.current);
      menuHideTimerRef.current = null;
    }
  }, []);

  const clearChromeHideTimer = useCallback(() => {
    if (chromeHideTimerRef.current) {
      clearTimeout(chromeHideTimerRef.current);
      chromeHideTimerRef.current = null;
    }
  }, []);

  const showMenu = useCallback(() => {
    clearMenuHideTimer();
    setIsHovered(true);
  }, [clearMenuHideTimer]);

  const hideMenu = useCallback(() => {
    clearMenuHideTimer();
    menuHideTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      menuHideTimerRef.current = null;
    }, 150);
  }, [clearMenuHideTimer]);

  const showChrome = useCallback(() => {
    clearChromeHideTimer();
    setChromeVisible(true);
  }, [clearChromeHideTimer]);

  const scheduleHideChrome = useCallback(() => {
    clearChromeHideTimer();
    if (isOpen) return;
    chromeHideTimerRef.current = setTimeout(() => {
      setChromeVisible(false);
      setIsHovered(false);
      chromeHideTimerRef.current = null;
    }, CHROME_HIDE_DELAY_MS);
  }, [isOpen, clearChromeHideTimer]);

  const closeOnNavigate = useCallback(() => {
    clearMenuHideTimer();
    clearChromeHideTimer();
    setIsOpen(false);
    setIsHovered(false);
    setChromeVisible(false);
  }, [clearMenuHideTimer, clearChromeHideTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearMenuHideTimer();
        clearChromeHideTimer();
        setIsOpen(false);
        setIsHovered(false);
        setChromeVisible(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearMenuHideTimer, clearChromeHideTimer]);

  useEffect(
    () => () => {
      clearMenuHideTimer();
      clearChromeHideTimer();
    },
    [clearMenuHideTimer, clearChromeHideTimer],
  );

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
      scheduleHideChrome,
    }),
    [
      isOpen,
      isVisible,
      chromeVisible,
      showMenu,
      hideMenu,
      closeOnNavigate,
      showChrome,
      scheduleHideChrome,
    ],
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
