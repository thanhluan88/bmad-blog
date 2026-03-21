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
  showMenu: () => void;
  hideMenu: () => void;
  closeOnNavigate: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuInteractionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [clearHideTimer]);

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
      showMenu,
      hideMenu,
      closeOnNavigate,
    }),
    [isOpen, isVisible, showMenu, hideMenu, closeOnNavigate],
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
