'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface PageHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

const subscribe = () => () => {};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actions }) => {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;

  const titleSlot = document.getElementById('page-title');
  const actionsSlot = document.getElementById('page-actions');

  return (
    <>
      {titleSlot &&
        createPortal(
          <h1 className="truncate text-center text-xl md:text-2xl font-bold text-foreground">{title}</h1>,
          titleSlot
        )}
      {actionsSlot && actions && createPortal(actions, actionsSlot)}
    </>
  );
};
