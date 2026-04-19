import { useState } from 'react';
import { copyToClipboard } from '../lib/clipboard';

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' copied' : ''} ${className}`}
      onClick={handle}
      title={label}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
