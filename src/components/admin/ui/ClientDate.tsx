"use client";

import React, { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function ClientDate({ date }: { date: string | number }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return <span suppressHydrationWarning>...</span>;
  }

  let formatted = "";
  try {
    const d = new Date(date);
    formatted = d.toLocaleString();
  } catch {
    formatted = String(date);
  }

  return <span suppressHydrationWarning>{formatted}</span>;
}
