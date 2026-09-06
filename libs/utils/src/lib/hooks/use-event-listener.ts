"use client";

import { useEffect, useRef } from "react";

/** Subscribes to a `window` event with the latest handler, no re-subscription churn. */
export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: WindowEventMap[K]) => handlerRef.current(event);
    window.addEventListener(type, listener, options);
    return () => window.removeEventListener(type, listener, options);
  }, [type, options]);
}

/** Same as `useWindowEvent` but for `CustomEvent`s dispatched by app code (e.g. "api:unauthorized"). */
export function useCustomEvent<T = unknown>(type: string, handler: (detail: T) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: Event) => handlerRef.current((event as CustomEvent<T>).detail);
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type]);
}
