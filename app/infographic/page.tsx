"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const W = 800;
const H = 1000;

type Align = "left" | "center" | "right";
type TextType = "heading" | "body" | "stat" | "label" | "quote";
type ShapeType = "rect" | "circle" | "divider";

interface TextEl {
  kind: "text";
  id: string;
  type: TextType;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: Align;
  font: string;
}

interface ShapeEl {
  kind: "shape";
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

type El = TextEl | ShapeEl;

const DEFAULT_SIZES: Record<TextType, number> = {
  heading: 48,
  body: 18,
  stat: 80,
  label: 13,
  quote: 22,
};

type ElDef = Omit<TextEl, "id"> | Omit<ShapeEl, "id">;
const TEMPLATES: { name: string; desc: string; els: ElDef[] }[] = [
  {
    name: "Book Stats",
    desc: "Chapters, word count, read time",
    els: [
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: H, color: "#fdf8f0", opacity: 1 },
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: 220, color: "#c4711f", opacity: 1 },
      { kind: "shape", type: "divider", x: 40, y: 580, width: 720, height: 3, color: "#ecc47e", opacity: 1 },
      { kind: "text", type: "heading", text: "Book Title", x: W / 2, y: 90, color: "#fff", fontSize: 48, bold: true, italic: false, align: "center", font: "Georgia" },
      { kind: "text", type: "label", text: "by Author Name", x: W / 2, y: 160, color: "#faefd9", fontSize: 20, bold: false, italic: true, align: "center", font: "Georgia" },
      { kind: "text", type: "stat", text: "12", x: 130, y: 360, color: "#c4711f", fontSize: 96, bold: true, italic: false, align: "center", font: "Georgia" },
      { kind: "text", type: "label", text: "CHAPTERS", x: 130, y: 460, color: "#6c3a1a", fontSize: 14, bold: false, italic: false, align: "center", font: "Arial" },
      { kind: "text", type: "stat", text: "87,400", x: 400, y: 360, color: "#c4711f", fontSize: 72, bold: true, italic: false, align: "center", font: "Georgia" },
      { kind: "text", type: "label", text: "WORDS", x: 400, y: 460, color: "#6c3a1a", fontSize: 14, bold: false, italic: false, align: "center", font: "Arial" },
      { kind: "text", type: "stat", text: "6 hrs", x: 660, y: 360, color: "#c4711f", fontSize: 72, bold: true, italic: false, align: "center", font: "Georgia" },
      { kind: "text", type: "label", text: "READ TIME", x: 660, y: 460, color: "#6c3a1a", fontSize: 14, bold: false, italic: false, align: "center", font: "Arial" },
      { kind: "text", type: "body", text: "A compelling story about the journey of a writer discovering their voice.", x: W / 2, y: 650, color: "#3a1c0b", fontSize: 18, bold: false, italic: false, align: "center", font: "Georgia" },
    ],
  },
  {
    name: "Quote Card",
    desc: "Highlight a line from your book",
    els: [
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: H, color: "#1a1a2e", opacity: 1 },
      { kind: "shape", type: "rect", x: 40, y: 140, width: 8, height: 360, color: "#c4711f", opacity: 1 },
      { kind: "shape", type: "divider", x: 40, y: 560, width: 400, height: 2, color: "#c4711f", opacity: 0.4 },
      { kind: "text", type: "quote", text: "“The first draft is just you telling yourself the story.”", x: 80, y: 310, color: "#ffffff", fontSize: 34, bold: false, italic: true, align: "left", font: "Georgia" },
      { kind: "text", type: "label", text: "— Author Name", x: 80, y: 600, color: "#c4711f", fontSize: 20, bold: false, italic: false, align: "left", font: "Georgia" },
      { kind: "text", type: "label", text: "BOOK TITLE", x: 80, y: 900, color: "#555580", fontSize: 13, bold: false, italic: false, align: "left", font: "Arial" },
    ],
  },
  {
    name: "Chapter Map",
    desc: "Visual outline of your story",
    els: [
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: H, color: "#f8f6f2", opacity: 1 },
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: 120, color: "#2d2d2d", opacity: 1 },
      { kind: "text", type: "heading", text: "Story Structure", x: W / 2, y: 60, color: "#ffffff", fontSize: 36, bold: true, italic: false, align: "center", font: "Georgia" },
      { kind: "shape", type: "rect", x: 40, y: 160, width: W - 80, height: 80, color: "#c4711f", opacity: 0.15 },
      { kind: "text", type: "label", text: "ACT I — SETUP", x: 60, y: 200, color: "#c4711f", fontSize: 14, bold: true, italic: false, align: "left", font: "Arial" },
      { kind: "shape", type: "rect", x: 40, y: 270, width: W - 80, height: 80, color: "#c4711f", opacity: 0.08 },
      { kind: "text", type: "label", text: "ACT II — CONFRONTATION", x: 60, y: 310, color: "#6c3a1a", fontSize: 14, bold: true, italic: false, align: "left", font: "Arial" },
      { kind: "shape", type: "rect", x: 40, y: 380, width: W - 80, height: 80, color: "#c4711f", opacity: 0.15 },
      { kind: "text", type: "label", text: "ACT III — RESOLUTION", x: 60, y: 420, color: "#c4711f", fontSize: 14, bold: true, italic: false, align: "left", font: "Arial" },
      { kind: "text", type: "body", text: "Add your chapter titles and story beats here to create a visual map of your manuscript.", x: W / 2, y: 600, color: "#555", fontSize: 16, bold: false, italic: true, align: "center", font: "Georgia" },
    ],
  },
  {
    name: "Blank",
    desc: "Start from scratch",
    els: [
      { kind: "shape", type: "rect", x: 0, y: 0, width: W, height: H, color: "#ffffff", opacity: 1 },
    ],
  },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function makeEls(defs: ElDef[]): El[] {
  return defs.map((d) => ({ ...d, id: uid() } as El));
}

function wrapDraw(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  align: Align
) {
  ctx.textAlign = align;
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  const total = lines.length * lineH;
  let sy = y - total / 2;
  for (const l of lines) { ctx.fillText(l, x, sy + lineH / 2); sy += lineH; }
  return total;
}

export default function InfographicMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [els, setEls] = useState<El[]>(() => makeEls(TEMPLATES[0].els));
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [activePanel, setActivePanel] = useState<"templates" | "add" | "props">("templates");

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

    for (const el of els) {
      if (el.kind === "shape") {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.fillStyle = el.color;
        if (el.type === "circle") {
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
        ctx.restore();
        if (el.id === sel) {
          ctx.save(); ctx.strokeStyle = "#c4711f"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
          ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4); ctx.restore();
        }
      } else {
        const w = el.bold ? "bold" : "normal";
        const s = el.italic ? "italic " : "";
        ctx.save();
        ctx.font = `${s}${w} ${el.fontSize}px "${el.font}", serif`;
        ctx.fillStyle = el.color;
        ctx.textBaseline = "middle";
        const maxW = W - el.x - 40;
        wrapDraw(ctx, el.text, el.x, el.y, maxW, el.fontSize * 1.35, el.align);
        if (el.id === sel) {
          const m = ctx.measureText(el.text);
          const tw = Math.min(m.width, maxW);
          const lx = el.align === "center" ? el.x - tw / 2 : el.x;
          ctx.strokeStyle = "#c4711f"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]);
          ctx.strokeRect(lx - 4, el.y - el.fontSize / 2 - 4, tw + 8, el.fontSize + 8);
        }
        ctx.restore();
      }
    }
  }, [els, sel]);

  useEffect(() => { draw(); }, [draw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  const hitTest = (x: number, y: number) => {
    for (let i = els.length - 1; i >= 0; i--) {
      const el = els[i];
      if (el.kind === "shape") {
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) return el.id;
      } else {
        if (Math.abs(x - el.x) < 200 && Math.abs(y - el.y) < el.fontSize + 4) return el.id;
      }
    }
    return null;
  };

  const addText = (type: TextType) => {
    const el: El = { kind: "text", id: uid(), type, text: type === "stat" ? "0" : type === "label" ? "LABEL" : type === "heading" ? "Heading" : type === "quote" ? "“Quote here”" : "Body text", x: W / 2, y: 500, color: "#1a1a1a", fontSize: DEFAULT_SIZES[type], bold: type === "heading" || type === "stat", italic: type === "quote", align: "center", font: "Georgia" };
    setEls((e) => [...e, el]); setSel(el.id); setActivePanel("props");
  };

  const addShape = (type: ShapeType) => {
    const el: El = { kind: "shape", id: uid(), type, x: 80, y: 460, width: type === "divider" ? 640 : 160, height: type === "divider" ? 3 : 160, color: "#c4711f", opacity: 0.8 };
    setEls((e) => [...e, el]); setSel(el.id); setActivePanel("props");
  };

  const update = (id: string, patch: Partial<El>) =>
    setEls((e) => e.map((el) => el.id === id ? { ...el, ...patch } as El : el));

  const moveZ = (id: string, dir: "up" | "down") => {
    setEls((e) => {
      const i = e.findIndex((x) => x.id === id);
      if (i < 0) return e;
      const next = [...e];
      if (dir === "up" && i < e.length - 1) [next[i], next[i + 1]] = [next[i + 1], next[i]];
      if (dir === "down" && i > 0) [next[i], next[i - 1]] = [next[i - 1], next[i]];
      return next;
    });
  };

  const selEl = els.find((e) => e.id === sel) ?? null;

  const exportPng = () => {
    const link = document.createElement("a");
    link.download = "infographic.png";
    link.href = canvasRef.current!.toDataURL("image/png");
    link.click();
  };

  const exportSvg = () => {
    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`];
    for (const el of els) {
      if (el.kind === "shape") {
        if (el.type === "circle") parts.push(`<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.color}" opacity="${el.opacity}"/>`);
        else parts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.color}" opacity="${el.opacity}"/>`);
      } else {
        const w = el.bold ? "bold" : "normal";
        const s = el.italic ? "italic" : "normal";
        parts.push(`<text x="${el.x}" y="${el.y}" font-family="${el.font}, serif" font-size="${el.fontSize}" font-weight="${w}" font-style="${s}" fill="${el.color}" text-anchor="${el.align === "center" ? "middle" : el.align === "right" ? "end" : "start"}">${el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`);
      }
    }
    parts.push("</svg>");
    const link = document.createElement("a");
    link.download = "infographic.svg";
    link.href = URL.createObjectURL(new Blob([parts.join("\n")], { type: "image/svg+xml" }));
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Infographic Maker</h1>
          <p className="text-stone-500 text-sm mt-1">Create shareable graphics for your book. Click to select, drag to move.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportSvg} className="btn-secondary text-sm">SVG</button>
          <button onClick={exportPng} className="btn-primary text-sm">Download PNG</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel */}
        <div className="lg:w-60 shrink-0 space-y-3">
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1 text-xs">
            {(["templates", "add", "props"] as const).map((tab) => (
              <button key={tab} onClick={() => setActivePanel(tab)}
                className={`flex-1 py-1.5 rounded-lg capitalize font-medium transition-colors ${activePanel === tab ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                {tab === "props" ? "Edit" : tab}
              </button>
            ))}
          </div>

          {activePanel === "templates" && (
            <div className="card space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Templates</p>
              {TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => { setEls(makeEls(t.els)); setSel(null); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-stone-200 hover:border-bindery-400 hover:bg-bindery-50 transition-colors">
                  <p className="text-sm font-medium text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.desc}</p>
                </button>
              ))}
            </div>
          )}

          {activePanel === "add" && (
            <div className="card space-y-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Add Text</p>
              <div className="space-y-1.5">
                {(["heading", "body", "stat", "label", "quote"] as const).map((t) => (
                  <button key={t} onClick={() => addText(t)} className="w-full text-left px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm text-stone-700 capitalize">
                    + {t}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide pt-1">Add Shape</p>
              <div className="space-y-1.5">
                {(["rect", "circle", "divider"] as const).map((t) => (
                  <button key={t} onClick={() => addShape(t)} className="w-full text-left px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm text-stone-700 capitalize">
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "props" && selEl ? (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide capitalize">{selEl.kind === "text" ? selEl.type : selEl.type} Properties</p>
                <button onClick={() => { setEls((e) => e.filter((x) => x.id !== sel)); setSel(null); }}
                  className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>

              {selEl.kind === "text" && (
                <>
                  <textarea rows={3} className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bindery-400"
                    value={selEl.text} onChange={(e) => update(sel!, { text: e.target.value })} />
                  <div>
                    <label className="text-xs text-stone-500">Size: {selEl.fontSize}px</label>
                    <input type="range" min={10} max={120} value={selEl.fontSize} className="w-full accent-bindery-600"
                      onChange={(e) => update(sel!, { fontSize: +e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500">Color</label>
                    <input type="color" value={selEl.color} className="w-full h-8 rounded border border-stone-200 cursor-pointer mt-1"
                      onChange={(e) => update(sel!, { color: e.target.value })} />
                  </div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={selEl.bold} onChange={(e) => update(sel!, { bold: e.target.checked })} /> Bold
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={selEl.italic} onChange={(e) => update(sel!, { italic: e.target.checked })} /> Italic
                    </label>
                  </div>
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button key={a} onClick={() => update(sel!, { align: a })}
                        className={`flex-1 py-1 rounded text-xs border capitalize ${selEl.align === a ? "border-bindery-500 bg-bindery-50 text-bindery-700" : "border-stone-200 text-stone-500"}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selEl.kind === "shape" && (
                <>
                  <div>
                    <label className="text-xs text-stone-500">Color</label>
                    <input type="color" value={selEl.color} className="w-full h-8 rounded border border-stone-200 cursor-pointer mt-1"
                      onChange={(e) => update(sel!, { color: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500">Opacity: {Math.round(selEl.opacity * 100)}%</label>
                    <input type="range" min={5} max={100} value={selEl.opacity * 100} className="w-full accent-bindery-600"
                      onChange={(e) => update(sel!, { opacity: +e.target.value / 100 })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(["width", "height"] as const).map((k) => (
                      <div key={k}>
                        <label className="text-stone-500 capitalize">{k}</label>
                        <input type="number" min={1} value={(selEl as ShapeEl)[k]} className="w-full border border-stone-200 rounded px-1.5 py-1 focus:outline-none mt-0.5"
                          onChange={(e) => update(sel!, { [k]: +e.target.value })} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-1 pt-1">
                <button onClick={() => moveZ(sel!, "down")} className="flex-1 py-1 text-xs border border-stone-200 rounded hover:bg-stone-50">↓ Back</button>
                <button onClick={() => moveZ(sel!, "up")} className="flex-1 py-1 text-xs border border-stone-200 rounded hover:bg-stone-50">↑ Front</button>
              </div>
            </div>
          ) : activePanel === "props" && (
            <div className="card text-center py-8 text-stone-400 text-sm">
              Click an element on the canvas to edit it
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0" ref={wrapRef}>
          <div className="relative border border-stone-200 rounded-xl overflow-hidden shadow-sm"
            style={{ paddingTop: `${(H / W) * 100}%` }}>
            <canvas ref={canvasRef} width={W} height={H}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={(e) => {
                const p = getPos(e); const hit = hitTest(p.x, p.y);
                setSel(hit); if (hit) { const el = els.find((x) => x.id === hit)!; setDrag({ id: hit, ox: p.x - el.x, oy: p.y - el.y }); setActivePanel("props"); }
              }}
              onMouseMove={(e) => { if (!drag) return; const p = getPos(e); update(drag.id, { x: p.x - drag.ox, y: p.y - drag.oy }); }}
              onMouseUp={() => setDrag(null)}
              onMouseLeave={() => setDrag(null)}
            />
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">Click to select · Drag to move · Edit panel on the left</p>
        </div>
      </div>
    </div>
  );
}
