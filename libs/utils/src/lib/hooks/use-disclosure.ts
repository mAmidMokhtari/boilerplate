"use client";

import { useCallback, useState } from "react";

/** Open/close state for dialogs, drawers and popovers. */
export function useDisclosure(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((v) => !v), []);
  return { open, setOpen, onOpen, onClose, onToggle } as const;
}
