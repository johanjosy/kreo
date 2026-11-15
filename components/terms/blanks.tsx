'use client';

import { useId, useState, type ReactNode } from 'react';
import { num, parseNumber } from '@/lib/format';

/**
 * The highlighted box around every blank. It sizes itself to the text it holds: a hidden copy of the text
 * (CSS `::after` from `data-value`) sits in the same grid cell as the control, so the box always fits what's typed,
 * in every browser.
 */
function Box({ text, minCh, invalid, className = '', children }: { text: string; minCh: number; invalid?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={`blank ${className}`} data-value={text} data-invalid={invalid || undefined} style={{ minWidth: `${minCh}ch` }}>
      {children}
    </span>
  );
}

export function TextBlank({ value, onChange, label, placeholder, minCh = 6, maxLength = 120 }: { value: string; onChange: (v: string) => void; label: string; placeholder: string; minCh?: number; maxLength?: number }) {
  return (
    <Box text={value || placeholder} minCh={minCh}>
      <input type="text" value={value} aria-label={label} placeholder={placeholder} maxLength={maxLength} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}

interface NumberBlankProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  placeholder?: string;
  min?: number;
  max: number;
  decimals?: boolean;
  /** Shown under the sentence when the value is out of range. */
  describedBy?: string;
  minCh?: number;
}

/**
 * Numeric blank. Users type freely ("31,000", "6.2"); the value commits on every valid keystroke so totals stay live,
 * and the text is reformatted with separators on blur. Out-of-range input is clamped on blur and flagged meanwhile.
 */
export function NumberBlank({ value, onChange, label, placeholder = '0', min = 0, max, decimals = false, minCh = 2 }: NumberBlankProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const errorId = useId();
  const shown = draft ?? (value ? num(value) : '');
  const parsed = draft == null ? value : parseNumber(draft);
  const invalid = parsed != null && (parsed < min || parsed > max);

  return (
    <>
      <Box text={shown || placeholder} minCh={minCh} invalid={invalid} className="figures">
      <input
        type="text"
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={shown}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setDraft(value ? String(value) : '')}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseNumber(e.target.value);
          const v = n == null ? 0 : decimals ? n : Math.floor(n);
          if (v >= min && v <= max) onChange(v);
        }}
        onBlur={() => {
          const n = parseNumber(draft ?? '') ?? 0;
          onChange(Math.min(max, Math.max(min, decimals ? Math.round(n * 10) / 10 : Math.floor(n))));
          setDraft(null);
        }}
      />
      </Box>
      {invalid && (
        <span id={errorId} role="alert" className="ml-1 align-middle font-ui text-ui-sm text-error">
          Use {num(min)} to {num(max)}
        </span>
      )}
    </>
  );
}

export function ChoiceBlank<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { value: T; text: string }[]; onChange: (v: T) => void; label: string }) {
  const current = options.find((o) => o.value === value)?.text ?? '';
  return (
    <Box text={current} minCh={4}>
      <select value={value} aria-label={label} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
    </Box>
  );
}
