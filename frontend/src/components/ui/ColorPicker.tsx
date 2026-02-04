import React, { useState, useRef, useEffect } from 'react';
import { Palette, Droplet, Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  opacity = 1,
  onOpacityChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(opacity);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Common color presets
  const colorPresets = [
    // Primary colors
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    
    // Grayscale
    '#000000', // Black
    '#374151', // Gray-700
    '#6b7280', // Gray-500
    '#d1d5db', // Gray-300
    '#ffffff', // White
    
    // Additional colors
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#f43f5e', // Rose
  ];

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Convert Hex to HSL
  const hexToHsl = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Initialize HSL values from current color
  useEffect(() => {
    const hsl = hexToHsl(value);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [value]);

  // Handle color change from HSL
  const handleHslChange = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    onChange(hex);
  };

  // Handle click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle opacity change
  const handleOpacityChange = (newOpacity: number) => {
    setAlpha(newOpacity);
    if (onOpacityChange) {
      onOpacityChange(newOpacity);
    }
  };

  // Current color with opacity
  const currentColorWithOpacity = value + Math.round(alpha * 255).toString(16).padStart(2, '0');

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Color preview button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Open color picker"
      >
        <div className="relative">
          <div 
            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
            style={{ 
              backgroundColor: value,
              backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
            }}
          />
          <div 
            className="absolute inset-0 rounded border border-slate-300 dark:border-slate-600"
            style={{ 
              backgroundColor: currentColorWithOpacity,
            }}
          />
        </div>
        <Palette className="w-4 h-4 text-slate-500" />
      </button>

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50">
          {/* Current color preview */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Color
              </span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {value.toUpperCase()}
                </code>
                {onOpacityChange && (
                  <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {Math.round(alpha * 100)}%
                  </code>
                )}
              </div>
            </div>
            <div className="relative h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              {/* Checkerboard background for transparency */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                }}
              />
              {/* Current color with opacity */}
              <div 
                className="absolute inset-0"
                style={{ backgroundColor: currentColorWithOpacity }}
              />
            </div>
          </div>

          {/* Color presets */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quick Colors
              </span>
              <Droplet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange(preset);
                    const hsl = hexToHsl(preset);
                    setHue(hsl.h);
                    setSaturation(hsl.s);
                    setLightness(hsl.l);
                  }}
                  className="relative w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset }}
                  aria-label={`Select color ${preset}`}
                >
                  {value === preset && (
                    <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hue slider */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Hue</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                {hue}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => {
                const newHue = parseInt(e.target.value);
                setHue(newHue);
                handleHslChange(newHue, saturation, lightness);
              }}
              className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500,green-500,cyan-500,blue-500,magenta-500 to-red-500 rounded-full appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            />
          </div>

          {/* Saturation/Lightness square */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Saturation & Lightness
              </span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                S:{saturation}% L:{lightness}%
              </span>
            </div>
            <div className="relative h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, 100%, 50%), hsl(${hue}, 0%, 50%))`
                }}
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))'
                }}
              />
              <div 
                className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              <input
                type="range"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const newSaturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
                  const newLightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
                  setSaturation(newSaturation);
                  setLightness(newLightness);
                  handleHslChange(hue, newSaturation, newLightness);
                }}
              />
            </div>
          </div>

          {/* Opacity slider (if enabled) */}
          {onOpacityChange && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">Opacity</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {Math.round(alpha * 100)}%
                </span>
              </div>
              <div className="relative h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Checkerboard background for opacity slider */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${value}00, ${value}ff)`
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-0 h-full w-1 bg-white border border-slate-400 rounded"
                  style={{ left: `${alpha * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>
            </div>
          )}

          {/* Color input fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                Hex Color
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newColor = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                    onChange(newColor);
                    const hsl = hexToHsl(newColor);
                    setHue(hsl.h);
                    setSaturation(hsl.s);
                    setLightness(hsl.l);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
            {onOpacityChange && (
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Opacity %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(alpha * 100)}
                  onChange={(e) => {
                    const percent = parseInt(e.target.value);
                    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
                      handleOpacityChange(percent / 100);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;