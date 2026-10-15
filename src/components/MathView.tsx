import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, display = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return `<span class="text-amber-400 font-mono text-sm">${math}</span>`;
    }
  }, [math, display]);

  if (display) {
    return (
      <div
        className={`my-2 overflow-x-auto overflow-y-hidden text-center py-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
