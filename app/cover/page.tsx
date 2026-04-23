"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// Standard book cover: 6×9 inches at 100px/inch
const W = 600;
const H = 900;

interface TextLayer {
  id: string;
  role: "title" | "author" | "tagline" | "series";
  text: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  x: number;
  y: number;
  letterSpacing: number;
}

interface CoverState {
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientAngle: number;
  bgImage: string | null;
  bgImageBlur: number;
  bgImageDarken: number;
  accentColor: string;
  showAccentBar: boolean;
  accentBarY: number;
  showAuthorLine: boolean;
  layers: TextLayer[];
}

type Template = {
  name: string;
  genre: string;
  cover: Omit<CoverState, "layers"> & { layers: Omit<TextLayer, "id">[] };
};

const FONTS = [
  "Georgia",
  "Times New Roman",
  "Palatino",
  "Garamond",
  "Arial",
  "Helvetica",
  "Futura",
  "Trebuchet MS",
  "Impact",
  "Courier New",
];

const TEMPLATES: Template[] = [
  {
    name: "Literary",
    genre: "Literary Fiction",
    cover: {
      bgType: "solid",
      bgColor: "#f5f0e8",
      bgGradientStart: "#f5f0e8",
      bgGradientEnd: "#ddd5c0",
      bgGradientAngle: 160,
      bgImage: null,
      bgImageBlur: 0,
      bgImageDarken: 0,
      accentColor: "#8b4513",
      showAccentBar: true,
      accentBarY: 0.72,
      showAuthorLine: true,
      layers: [
        { role: "title", text: "Your Title", font: "Palatino", size: 62, color: "#1a0f00", bold: true, italic: false, align: "center", x: W / 2, y: 260, letterSpacing: 2 },
        { role: "tagline", text: "A Novel", font: "Palatino", size: 18, color: "#8b4513", bold: false, italic: true, align: "center", x: W / 2, y: 340, letterSpacing: 4 },
        { role: "author", text: "Author Name", font: "Palatino", size: 26, color: "#3d2b1f", bold: false, italic: false, align: "center", x: W / 2, y: 800, letterSpacing: 3 },
      ],
    },
  },
  {
    name: "Dark Thriller",
    genre: "Thriller / Mystery",
    cover: {
      bgType: "gradient",
      bgColor: "#0a0a0a",
      bgGradientStart: "#0a0a0a",
      bgGradientEnd: "#1a0505",
      bgGradientAngle: 170,
      bgImage: null,
      bgImageBlur: 0,
      bgImageDarken: 0.5,
      accentColor: "#cc0000",
      showAccentBar: true,
      accentBarY: 0.08,
      showAuthorLine: true,
      layers: [
        { role: "title", text: "YOUR TITLE", font: "Impact", size: 72, color: "#ffffff", bold: false, italic: false, align: "center", x: W / 2, y: 420, letterSpacing: 6 },
        { role: "tagline", text: "No one gets out alive.", font: "Arial", size: 16, color: "#cc0000", bold: false, italic: true, align: "center", x: W / 2, y: 500, letterSpacing: 2 },
        { role: "author", text: "AUTHOR NAME", font: "Arial", size: 22, color: "#cccccc", bold: true, italic: false, align: "center", x: W / 2, y: 840, letterSpacing: 5 },
      ],
    },
  },
  {
    name: "Romance",
    genre: "Romance",
    cover: {
      bgType: "gradient",
      bgColor: "#3d0020",
      bgGradientStart: "#6b003a",
      bgGradientEnd: "#2a0015",
      bgGradientAngle: 150,
      bgImage: null,
      bgImageBlur: 0,
      bgImageDarken: 0,
      accentColor: "#e8a0b4",
      showAccentBar: false,
      accentBarY: 0.75,
      showAuthorLine: true,
      layers: [
        { role: "tagline", text: "A Story of Love", font: "Palatino", size: 15, color: "#e8a0b4", bold: false, italic: true, align: "center", x: W / 2, y: 120, letterSpacing: 3 },
        { role: "title", text: "Your Title", font: "Palatino", size: 68, color: "#fff0f5", bold: true, italic: true, align: "center", x: W / 2, y: 380, letterSpacing: 1 },
        { role: "author", text: "Author Name", font: "Palatino", size: 22, color: "#e8a0b4", bold: false, italic: false, align: "center", x: W / 2, y: 820, letterSpacing: 2 },
      ],
    },
  },
  {
    name: "Fantasy",
    genre: "Fantasy / Sci-Fi",
    cover: {
      bgType: "gradient",
      bgColor: "#0d0d2b",
      bgGradientStart: "#0d0d2b",
      bgGradientEnd: "#1a0d2b",
      bgGradientAngle: 180,
      bgImage: null,
      bgImageBlur: 0,
      bgImageDarken: 0,
      accentColor: "#c0a060",
      showAccentBar: true,
      accentBarY: 0.78,
      showAuthorLine: true,
      layers: [
        { role: "series", text: "Book One of the Chronicles", font: "Palatino", size: 14, color: "#8080c0", bold: false, italic: true, align: "center", x: W / 2, y: 110, letterSpacing: 2 },
        { role: "title", text: "The Title", font: "Palatino", size: 74, color: "#c0a060", bold: true, italic: false, align: "center", x: W / 2, y: 380, letterSpacing: 3 },
        { role: "tagline", text: "Where legends are forged.", font: "Arial", size: 15, color: "#a0a0e0", bold: false, italic: true, align: "center", x: W / 2, y: 470, letterSpacing: 1 },
        { role: "author", text: "Author Name", font: "Palatino", size: 22, color: "#e0e0ff", bold: false, italic: false, align: "center", x: W / 2, y: 840, letterSpacing: 3 },
      ],
    },
  },
  {
    name: "Minimal",
    genre: "Non-Fiction / Memoir",
    cover: {
      bgType: "solid",
      bgColor: "#ffffff",
      bgGradientStart: "#ffffff",
      bgGradientEnd: "#f0f0f0",
      bgGradientAngle: 0,
      bgImage: null,
      bgImageBlur: 0,
      bgImageDarken: 0,
      accentColor: "#000000",
      showAccentBar: true,
      accentBarY: 0.55,
      showAuthorLine: true,
      layers: [
        { role: "title", text: "YOUR TITLE", font: "Helvetica", size: 58, color: "#000000", bold: true, italic: false, align: "left", x: 48, y: 280, letterSpacing: 4 },
        { role: "tagline", text: "A memoir of reinvention", font: "Helvetica", size: 16, color: "#555555", bold: false, italic: false, align: "left", x: 48, y: 360, letterSpacing: 1 },
        { role: "author", text: "Author Name", font: "Helvetica", size: 20, color: "#000000", bold: false, italic: false, align: "left", x: 48, y: 820, letterSpacing: 2 },
      ],
    },
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function templateToState(t: Template): CoverState {
  return {
    ...t.cover,
    layers: t.cover.layers.map((l) => ({ ...l, id: uid() })),
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: "left" | "center" | "right"
) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  const lines: string[] = [];

  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const totalHeight = lines.length * lineHeight;
  let startY = lineY - totalHeight / 2;

  for (const l of lines) {
    let drawX = x;
    if (align === "center") drawX = x;
    else if (align === "left") drawX = x;
    else drawX = x;
    ctx.fillText(l, drawX, startY);
    startY += lineHeight;
  }
  return totalHeight;
}

export default function CoverDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(1);
  const [cover, setCover] = useState<CoverState>(() => templateToState(TEMPLATES[0]));
  const [selectedLayer, setSelectedLayer] = useState<string | null>(cover.layers[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<"templates" | "background" | "text" | "layout">("templates");
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / W);
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Background
    if (cover.bgType === "solid") {
      ctx.fillStyle = cover.bgColor;
      ctx.fillRect(0, 0, W, H);
    } else if (cover.bgType === "gradient") {
      const angle = (cover.bgGradientAngle * Math.PI) / 180;
      const x1 = W / 2 - Math.cos(angle) * W;
      const y1 = H / 2 - Math.sin(angle) * H;
      const x2 = W / 2 + Math.cos(angle) * W;
      const y2 = H / 2 + Math.sin(angle) * H;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, cover.bgGradientStart);
      grad.addColorStop(1, cover.bgGradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (cover.bgType === "image" && cover.bgImage) {
      const img = new Image();
      img.src = cover.bgImage;
      if (img.complete) {
        const scale = Math.max(W / img.width, H / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        const ix = (W - iw) / 2;
        const iy = (H - ih) / 2;

        if (cover.bgImageBlur > 0) {
          ctx.filter = `blur(${cover.bgImageBlur}px)`;
        }
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.filter = "none";

        if (cover.bgImageDarken > 0) {
          ctx.fillStyle = `rgba(0,0,0,${cover.bgImageDarken})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
    }

    // Accent bar
    if (cover.showAccentBar) {
      const barY = cover.accentBarY * H;
      ctx.fillStyle = cover.accentColor;
      ctx.fillRect(0, barY, W, 4);
    }

    // Text layers
    for (const layer of cover.layers) {
      const weight = layer.bold ? "bold" : "normal";
      const style = layer.italic ? "italic" : "normal";
      ctx.font = `${style} ${weight} ${layer.size}px "${layer.font}", serif`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      ctx.textBaseline = "middle";

      if (layer.letterSpacing !== 0) {
        ctx.letterSpacing = `${layer.letterSpacing}px`;
      }

      const maxW = W - 80;
      wrapText(ctx, layer.text, layer.x, layer.y, maxW, layer.size * 1.25, layer.align);
      ctx.letterSpacing = "0px";

      // Selection outline
      if (layer.id === selectedLayer) {
        const metrics = ctx.measureText(layer.text);
        const tw = Math.min(metrics.width, maxW);
        const lx = layer.align === "center" ? layer.x - tw / 2 : layer.align === "right" ? layer.x - tw : layer.x;
        ctx.save();
        ctx.strokeStyle = "#c4711f";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(lx - 6, layer.y - layer.size / 2 - 6, tw + 12, layer.size + 12);
        ctx.restore();
      }
    }
  }, [cover, selectedLayer]);

  useEffect(() => { draw(); }, [draw]);

  // Handle bg image load redraws
  useEffect(() => {
    if (cover.bgType === "image" && cover.bgImage) {
      const img = new Image();
      img.onload = () => draw();
      img.src = cover.bgImage;
    }
  }, [cover.bgImage, cover.bgType, draw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const hitTestLayer = (x: number, y: number): string | null => {
    for (let i = cover.layers.length - 1; i >= 0; i--) {
      const l = cover.layers[i];
      if (Math.abs(x - l.x) < 200 && Math.abs(y - l.y) < l.size) return l.id;
    }
    return null;
  };

  const updateLayer = (id: string, patch: Partial<TextLayer>) =>
    setCover((c) => ({ ...c, layers: c.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));

  const sel = cover.layers.find((l) => l.id === selectedLayer) ?? null;

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "book-cover.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setCover((c) => ({ ...c, bgType: "image", bgImage: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Cover Designer</h1>
          <p className="text-stone-500 text-sm mt-1">
            Design a professional book cover. Click a text element to select and edit it.
          </p>
        </div>
        <button onClick={exportPng} className="btn-primary shrink-0">
          Download PNG
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel */}
        <div className="lg:w-64 shrink-0 space-y-3">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1 text-xs">
            {(["templates", "background", "text", "layout"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  activeTab === tab ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Templates tab */}
          {activeTab === "templates" && (
            <div className="card space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Genre Templates</p>
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    const s = templateToState(t);
                    setCover(s);
                    setSelectedLayer(s.layers[0]?.id ?? null);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-stone-200 hover:border-bindery-400 hover:bg-bindery-50 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.genre}</p>
                </button>
              ))}
            </div>
          )}

          {/* Background tab */}
          {activeTab === "background" && (
            <div className="card space-y-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Background</p>
              <div className="flex gap-2">
                {(["solid", "gradient", "image"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCover((c) => ({ ...c, bgType: t }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                      cover.bgType === t
                        ? "border-bindery-500 bg-bindery-50 text-bindery-700"
                        : "border-stone-200 text-stone-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {cover.bgType === "solid" && (
                <div className="space-y-1">
                  <label className="text-xs text-stone-500">Color</label>
                  <input type="color" value={cover.bgColor}
                    className="w-full h-9 rounded border border-stone-200 cursor-pointer"
                    onChange={(e) => setCover((c) => ({ ...c, bgColor: e.target.value }))} />
                </div>
              )}

              {cover.bgType === "gradient" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-stone-500">From</label>
                      <input type="color" value={cover.bgGradientStart} className="w-full h-8 rounded border border-stone-200 cursor-pointer"
                        onChange={(e) => setCover((c) => ({ ...c, bgGradientStart: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500">To</label>
                      <input type="color" value={cover.bgGradientEnd} className="w-full h-8 rounded border border-stone-200 cursor-pointer"
                        onChange={(e) => setCover((c) => ({ ...c, bgGradientEnd: e.target.value }))} />
                    </div>
                  </div>
                  <label className="text-xs text-stone-500">Angle: {cover.bgGradientAngle}°</label>
                  <input type="range" min={0} max={360} value={cover.bgGradientAngle} className="w-full accent-bindery-600"
                    onChange={(e) => setCover((c) => ({ ...c, bgGradientAngle: +e.target.value }))} />
                </div>
              )}

              {cover.bgType === "image" && (
                <div className="space-y-2">
                  <button onClick={() => bgInputRef.current?.click()}
                    className="w-full btn-secondary text-sm">
                    {cover.bgImage ? "Change Image" : "Upload Image"}
                  </button>
                  <input ref={bgInputRef} type="file" accept="image/*" className="sr-only" onChange={handleBgImage} />
                  {cover.bgImage && (
                    <>
                      <label className="text-xs text-stone-500">Blur: {cover.bgImageBlur}px</label>
                      <input type="range" min={0} max={20} value={cover.bgImageBlur} className="w-full accent-bindery-600"
                        onChange={(e) => setCover((c) => ({ ...c, bgImageBlur: +e.target.value }))} />
                      <label className="text-xs text-stone-500">Darken: {Math.round(cover.bgImageDarken * 100)}%</label>
                      <input type="range" min={0} max={100} value={cover.bgImageDarken * 100} className="w-full accent-bindery-600"
                        onChange={(e) => setCover((c) => ({ ...c, bgImageDarken: +e.target.value / 100 }))} />
                    </>
                  )}
                </div>
              )}

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <label className="text-xs text-stone-500">Accent color</label>
                <input type="color" value={cover.accentColor} className="w-full h-8 rounded border border-stone-200 cursor-pointer"
                  onChange={(e) => setCover((c) => ({ ...c, accentColor: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={cover.showAccentBar}
                    onChange={(e) => setCover((c) => ({ ...c, showAccentBar: e.target.checked }))} />
                  Show accent bar
                </label>
              </div>
            </div>
          )}

          {/* Text tab */}
          {activeTab === "text" && (
            <div className="card space-y-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Text Layers</p>
              <div className="space-y-1">
                {cover.layers.map((l) => (
                  <button key={l.id} onClick={() => setSelectedLayer(l.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLayer === l.id
                        ? "bg-bindery-50 text-bindery-700 font-medium border border-bindery-200"
                        : "text-stone-600 hover:bg-stone-50 border border-transparent"
                    }`}>
                    <span className="capitalize text-xs text-stone-400 block">{l.role}</span>
                    {l.text}
                  </button>
                ))}
              </div>

              {sel && (
                <div className="border-t border-stone-100 pt-3 space-y-3">
                  <div>
                    <label className="text-xs text-stone-500">Text</label>
                    <textarea rows={2} className="w-full mt-1 border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bindery-400"
                      value={sel.text} onChange={(e) => updateLayer(sel.id, { text: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500">Font</label>
                    <select className="w-full mt-1 border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                      value={sel.font} onChange={(e) => updateLayer(sel.id, { font: e.target.value })}>
                      {FONTS.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-stone-500">Size: {sel.size}px</label>
                      <input type="range" min={10} max={120} value={sel.size} className="w-full accent-bindery-600"
                        onChange={(e) => updateLayer(sel.id, { size: +e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500">Spacing: {sel.letterSpacing}</label>
                      <input type="range" min={-2} max={20} value={sel.letterSpacing} className="w-full accent-bindery-600"
                        onChange={(e) => updateLayer(sel.id, { letterSpacing: +e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500">Color</label>
                    <input type="color" value={sel.color} className="w-full h-8 rounded border border-stone-200 cursor-pointer mt-1"
                      onChange={(e) => updateLayer(sel.id, { color: e.target.value })} />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm text-stone-700 cursor-pointer">
                      <input type="checkbox" checked={sel.bold} onChange={(e) => updateLayer(sel.id, { bold: e.target.checked })} />
                      Bold
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-stone-700 cursor-pointer">
                      <input type="checkbox" checked={sel.italic} onChange={(e) => updateLayer(sel.id, { italic: e.target.checked })} />
                      Italic
                    </label>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500">Align</label>
                    <div className="flex gap-1 mt-1">
                      {(["left", "center", "right"] as const).map((a) => (
                        <button key={a} onClick={() => updateLayer(sel.id, { align: a })}
                          className={`flex-1 py-1 rounded text-xs border capitalize transition-colors ${
                            sel.align === a ? "border-bindery-500 bg-bindery-50 text-bindery-700" : "border-stone-200 text-stone-500"
                          }`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Layout tab */}
          {activeTab === "layout" && (
            <div className="card space-y-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Position (drag on canvas or nudge)</p>
              {cover.layers.map((l) => (
                <div key={l.id} className={`p-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                  selectedLayer === l.id ? "border-bindery-300 bg-bindery-50" : "border-stone-200"
                }`} onClick={() => setSelectedLayer(l.id)}>
                  <p className="text-xs text-stone-400 capitalize mb-1">{l.role}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-xs text-stone-500">X</span>
                      <input type="number" min={0} max={W} value={Math.round(l.x)} className="w-full border border-stone-200 rounded px-1.5 py-1 text-xs focus:outline-none"
                        onChange={(e) => updateLayer(l.id, { x: +e.target.value })} />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-stone-500">Y</span>
                      <input type="number" min={0} max={H} value={Math.round(l.y)} className="w-full border border-stone-200 rounded px-1.5 py-1 text-xs focus:outline-none"
                        onChange={(e) => updateLayer(l.id, { y: +e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              {cover.showAccentBar && (
                <div>
                  <label className="text-xs text-stone-500">Accent bar position: {Math.round(cover.accentBarY * 100)}%</label>
                  <input type="range" min={5} max={95} value={cover.accentBarY * 100} className="w-full accent-bindery-600"
                    onChange={(e) => setCover((c) => ({ ...c, accentBarY: +e.target.value / 100 }))} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div ref={wrapRef} className="relative">
            <div
              className="relative border border-stone-200 rounded-xl overflow-hidden shadow-lg mx-auto"
              style={{ paddingTop: `${(H / W) * 100}%`, maxWidth: "480px" }}
            >
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="absolute inset-0 w-full h-full cursor-pointer"
                onMouseDown={(e) => {
                  const pos = getPos(e);
                  const hit = hitTestLayer(pos.x, pos.y);
                  if (hit) {
                    setSelectedLayer(hit);
                    const l = cover.layers.find((x) => x.id === hit)!;
                    setDragging({ id: hit, ox: pos.x - l.x, oy: pos.y - l.y });
                  } else {
                    setSelectedLayer(null);
                  }
                }}
                onMouseMove={(e) => {
                  if (!dragging) return;
                  const pos = getPos(e);
                  updateLayer(dragging.id, { x: pos.x - dragging.ox, y: pos.y - dragging.oy });
                }}
                onMouseUp={() => setDragging(null)}
                onMouseLeave={() => setDragging(null)}
              />
            </div>
          </div>
          <p className="text-xs text-stone-400 text-center mt-3">
            Click to select a text element · Drag to reposition
          </p>
          <p className="text-xs text-stone-300 text-center mt-1">
            6 × 9 in (standard trade paperback)
          </p>
        </div>
      </div>
    </div>
  );
}
