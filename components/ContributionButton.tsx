'use client';

import React, { useState } from 'react';
import { openSWGDialog, isSWGAvailable } from '@/lib/swgClient';

interface ContributionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  productId?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'compact' | 'secondary';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ContributionButton({
  productId,
  children = 'Contribuí con Google',
  variant = 'primary',
  className = '',
  onSuccess,
  onError,
  disabled = false,
  ...rest
}: ContributionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition duration-200';
  
  const variants: Record<string, string> = {
    primary: 'bg-primary text-slate-950 hover:bg-primary/90 active:bg-primary/80 px-8 py-4 shadow-lg hover:shadow-xl',
    compact: 'bg-primary/90 text-slate-900 text-sm px-4 py-2 hover:bg-primary',
    secondary: 'border-2 border-primary text-primary hover:bg-primary/10 px-8 py-4',
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Check if SWG SDK is available
      if (!isSWGAvailable()) {
        console.warn('⚠️ SWG SDK not available, attempting to open anyway');
      }

      // Open SWG dialog with product ID if available
      const opened = await openSWGDialog(productId);
      
      if (opened && onSuccess) {
        onSuccess();
      } else if (!opened && onError) {
        onError(new Error('Failed to open SWG dialog'));
      }
    } catch (err) {
      console.error('❌ Error opening SWG dialog:', err);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className={`${baseStyles} ${variants[variant]} ${className} ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      disabled={isDisabled}
      onClick={handleClick}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="mr-2">⏳</span>
          Abriendo...
        </>
      ) : (
        <>
          <span className="mr-2">💳</span>
          {children}
        </>
      )}
    </button>
  );
}
