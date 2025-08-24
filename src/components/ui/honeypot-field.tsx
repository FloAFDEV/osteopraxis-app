import React from 'react';

interface HoneypotFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  tabIndex?: number;
}

/**
 * Champ honeypot pour la protection anti-spam
 * Ce champ est caché visuellement mais reste accessible aux bots
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({
  name,
  value,
  onChange,
  tabIndex = -1
}) => {
  return (
    <div 
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        zIndex: -1,
        visibility: "hidden"
      }}
      aria-hidden="true"
    >
      <label htmlFor={name}>
        Website (leave blank)
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={tabIndex}
        autoComplete="off"
        placeholder="Do not fill this field"
      />
    </div>
  );
};