import React, { useState } from 'react';
import { 
  Edit2, Brush, Highlighter, SprayCan, 
  Minus, Plus, Zap, ZapOff, Grid3x3,
  Circle, Square, Type
} from 'lucide-react';
import type { BrushType, StrokeStyle } from '../../types/canvas';

interface BrushSettingsProps {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  brushType: BrushType;
  onBrushTypeChange: (type: BrushType) => void;
  pressureSensitive: boolean;
  onPressureSensitiveChange: (enabled: boolean) => void;
  strokeStyle: StrokeStyle;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  className?: string;
}

const BrushSettings: React.FC<BrushSettingsProps> = ({
  strokeWidth,
  onStrokeWidthChange,
  brushType,
  onBrushTypeChange,
  pressureSensitive,
  onPressureSensitiveChange,
  strokeStyle,
  onStrokeStyleChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const brushTypes: Array<{
    type: BrushType;
    label: string;
    icon: React.ReactNode;
    description: string;
    minWidth: number;
    maxWidth: number;
  }> = [
    {
      type: 'pencil',
      label: 'Pencil',
      icon: <Edit2 className="w-4 h-4" />,
      description: 'Sharp, precise lines',
      minWidth: 1,
      maxWidth: 10
    },
    {
      type: 'brush',
      label: 'Brush',
      icon: <Brush className="w-4 h-4" />,
      description: 'Soft, textured strokes',
      minWidth: 3,
      maxWidth: 30
    },
    {
      type: 'marker',
      label: 'Marker',
      icon: <Highlighter className="w-4 h-4" />,
      description: 'Solid, opaque lines',
      minWidth: 5,
      maxWidth: 20
    },
    {
      type: 'airbrush',
      label: 'Airbrush',
      icon: <SprayCan className="w-4 h-4" />,
      description: 'Soft, gradient strokes',
      minWidth: 10,
      maxWidth: 50
    },
    {
      type: 'highlighter',
      label: 'Highlighter',
      icon: <Highlighter className="w-4 h-4" />,
      description: 'Semi-transparent overlay',
      minWidth: 10,
      maxWidth: 40
    }
  ];

  const strokeStyles: Array<{
    type: StrokeStyle['type'];
    label: string;
    icon: React.ReactNode;
    pattern: number[];
  }> = [
    {
      type: 'solid',
      label: 'Solid',
      icon: <Minus className="w-4 h-4" />,
      pattern: []
    },
    {
      type: 'dashed',
      label: 'Dashed',
      icon: <Grid3x3 className="w-4 h-4" />,
      pattern: [5, 5]
    },
    {
      type: 'dotted',
      label: 'Dotted',
      icon: <Circle className="w-4 h-4" />,
      pattern: [1, 3]
    }
  ];

  const lineCaps: Array<{
    value: 'butt' | 'round' | 'square';
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      value: 'butt',
      label: 'Butt',
      icon: <Square className="w-3 h-3" />
    },
    {
      value: 'round',
      label: 'Round',
      icon: <Circle className="w-3 h-3" />
    },
    {
      value: 'square',
      label: 'Square',
      icon: <Square className="w-3 h-3" />
    }
  ];

  const currentBrush = brushTypes.find(b => b.type === brushType);

  return (
    <div className={`relative ${className}`}>
      {/* Brush preview button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Open brush settings"
      >
        <div className="relative">
          {/* Brush preview */}
          <div className="w-8 h-8 flex items-center justify-center">
            <div 
              className="rounded-full"
              style={{
                width: `${strokeWidth}px`,
                height: `${strokeWidth}px`,
                backgroundColor: '#3b82f6',
                opacity: brushType === 'highlighter' ? 0.5 : 1
              }}
            />
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentBrush?.label}
          </div>
          <div className="text-xs text-slate-500">
            {strokeWidth}px
          </div>
        </div>
      </button>

      {/* Brush settings dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50">
          {/* Brush type selection */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Brush Type
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {brushTypes.map((brush) => (
                <button
                  key={brush.type}
                  type="button"
                  onClick={() => {
                    onBrushTypeChange(brush.type);
                    // Adjust stroke width to fit new brush type
                    if (strokeWidth < brush.minWidth) {
                      onStrokeWidthChange(brush.minWidth);
                    } else if (strokeWidth > brush.maxWidth) {
                      onStrokeWidthChange(brush.maxWidth);
                    }
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    brushType === brush.type
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  aria-label={`Select ${brush.label} brush`}
                  title={brush.description}
                >
                  <div className="mb-1 p-1.5 rounded bg-white dark:bg-slate-800">
                    {brush.icon}
                  </div>
                  <span className="text-xs font-medium">{brush.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stroke width control */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Stroke Width
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                  {strokeWidth}px
                </span>
                {currentBrush && (
                  <span className="text-xs text-slate-500">
                    ({currentBrush.minWidth}-{currentBrush.maxWidth}px)
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Width slider */}
              <input
                type="range"
                min={currentBrush?.minWidth || 1}
                max={currentBrush?.maxWidth || 50}
                value={strokeWidth}
                onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
              
              {/* Quick width presets */}
              <div className="flex justify-between">
                {[1, 3, 5, 10, 20].map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => onStrokeWidthChange(width)}
                    className={`px-2 py-1 text-xs rounded ${
                      strokeWidth === width
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {width}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stroke style */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Stroke Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {strokeStyles.map((style) => (
                <button
                  key={style.type}
                  type="button"
                  onClick={() => onStrokeStyleChange({
                    type: style.type,
                    dashArray: style.pattern,
                    lineCap: strokeStyle.lineCap || 'round',
                    lineJoin: strokeStyle.lineJoin || 'round'
                  })}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    strokeStyle.type === style.type
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="mb-1 p-1.5">
                    {style.icon}
                  </div>
                  <span className="text-xs font-medium">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line cap/join settings */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Line Cap
                </h4>
                <div className="flex gap-1">
                  {lineCaps.map((cap) => (
                    <button
                      key={cap.value}
                      type="button"
                      onClick={() => onStrokeStyleChange({
                        ...strokeStyle,
                        lineCap: cap.value
                      })}
                      className={`p-1.5 rounded ${
                        strokeStyle.lineCap === cap.value
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                      }`}
                      title={cap.label}
                    >
                      {cap.icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Pressure Sensitivity
                </h4>
                <button
                  type="button"
                  onClick={() => onPressureSensitiveChange(!pressureSensitive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pressureSensitive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pressureSensitive ? <Zap size={14} /> : <ZapOff size={14} />}
                  {pressureSensitive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Brush preview */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Preview
              </h4>
              <div className="text-xs text-slate-500">
                {currentBrush?.description}
              </div>
            </div>
            <div className="h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="relative w-full h-full">
                {/* Preview stroke */}
                <svg width="100%" height="100%" className="overflow-visible">
                  <path
                    d="M10,30 Q50,10 90,30 T170,30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth}
                    strokeLinecap={strokeStyle.lineCap || 'round'}
                    strokeLinejoin={strokeStyle.lineJoin || 'round'}
                    strokeDasharray={strokeStyle.dashArray?.join(',')}
                    opacity={brushType === 'highlighter' ? 0.5 : 1}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Apply Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default BrushSettings;