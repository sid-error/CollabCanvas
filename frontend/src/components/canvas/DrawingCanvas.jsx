import React, { useRef, useState, useEffect } from 'react';

const DrawingCanvas = ({ onExit }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb');
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set high-DPI resolution
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);

  // Update drawing styles when tool/color/size changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = size;
    }
  }, [color, size, tool]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  return (
    <div className="relative h-screen w-full bg-slate-100 overflow-hidden">
      {/* Background Grid - Requirement 4.3.4 */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }}
      />

      {/* Floating Toolbar - Requirement 4.1.4 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-slate-200 z-50">
        <button onClick={onExit} className="hover:bg-slate-100 p-2 rounded-lg transition-colors">🏠</button>
        <div className="h-6 w-px bg-slate-200" />
        
        {/* Brush Tool */}
        <button 
          onClick={() => setTool('brush')}
          className={`p-2 rounded-lg transition-all ${tool === 'brush' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          🖌️
        </button>

        {/* Eraser Tool - Requirement 4.1.5 */}
        <button 
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          🧼
        </button>

        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
        />

        <input 
          type="range" min="1" max="50" 
          value={size} 
          onChange={(e) => setSize(e.target.value)}
          className="w-24 accent-blue-600"
        />
      </div>

      <canvas
        onMouseDown={startDrawing}
        onMouseUp={() => setIsDrawing(false)}
        onMouseMove={draw}
        ref={canvasRef}
        className="relative bg-white shadow-2xl cursor-crosshair mx-auto mt-20 border border-slate-200"
        style={{ width: '90vw', height: '80vh' }}
      />
    </div>
  );
};

export default DrawingCanvas;