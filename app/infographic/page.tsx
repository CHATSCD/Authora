"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface TextBlock {
  id: string;
  type: "heading" | "body" | "stat" | "label";
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

interface Shape {
  id: string;
  type: "rect" | "circle" | "line" | "divider";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

type Element = ({ kind: "text" } & TextBlock) | ({ kind: "shape" } & Shape);

const CANVAS_W = 800;
const CANVAS_H = 1200;

const TEMPLATES = [
  {
    name: "Book Stats",
    elements: [
      { kind: "shape", id: "bg", type: "rect", x: 0, y: 0, width: 800, height: 1200, color: "#fdf8f0", opacity: 1 },
      { kind: "shape", id: "accent", type: "rect", x: 0, y: 0, width: 800, height: 200, color: "#c4711f", opacity: 1 },
      { kind: "text", id: "t1", type: "heading", text: "Book Title", x: 40, y: 60, color: "#ffffff", fontSize: 40 },
      { kind: "text", id: "t2", type: "label", text: "by Author Name", x: 40, y: 120, color: "#faefd9", fontSize: 20 },
      { kind: "text", id: "t3", type: "stat", text: "12", x: 60, y: 280, color: "#c4711f", fontSize: 80 },
      { kind: "text", id: "t4", type: "label", text: "CHAPTERS", x: 60, y: 360, color: "#6c3a1a", fontSize: 14 },
      { kind: "text", id: "t5", type: "stat", text: "87,400", x: 300, y: 280, color: "#c4711f", fontSize: 56 },
      { kind: "text", id: "t6", type: "label", text: "WORDS", x: 300, y: 360, color: "#6c3a1a", fontSize: 14 },
      { kind: "shape", id: "div1", type: "divider", x: 40, y: 400, width: 720, height: 2, color: "#ecc47e", opacity: 1 },
      { kind: "text", id: "t7", type: "body", text: "A compelling story about the journey of a writer discovering their voice through years of dedication and craft.", x: 40, y: 430, color: "#3a1c0b", fontSize: 18 },
    ] as Element[],
  },
  {
    name: "Quote Card",
    elements: [
      { kind: "shape", id: "bg", type: "rect", x: 0, y: 0, width: 800, height: 1200, color: "#1a1a2e", opacity: 1 },
      { kind: "shape", id: "accent", type: "rect", x: 40, y: 100, width: 8, height: 400, color: "#c4711f", opacity: 1 },
      { kind: "text", id: "q", type: "heading", text: "\"The first draft is just you telling yourself the story.\"", x: 80, y: 120, color: "#ffffff", fontSize: 36 },
      { kind: "text", id: "author", type: "label", text: "— Terry Pratchett", x: 80, y: 520, color: "#c4711f", fontSize: 22 },
    ] as Element[],
  },
  {
    name: "Blank",
    elements: [
      { kind: "shape", id: "bg", type: "rect", x: 0, y: 0, width: 800, height: 1200, color: "#ffffff", opacity: 1 },
    ] as Element[],
  },
];

const FONT_SIZES: Record<TextBlock["type"], number> = {
  heading: 40,
  body: 18,
  stat: 72,
  label: 14,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function InfographicMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<Element[]>(TEMPLATES[0].elements);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (wrapRef.current) {
        setCanvasScale(wrapRef.current.clientWidth / CANVAS_W);
      }
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (const el of elements) {
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

        if (el.id === selected) {
          ctx.save();
          ctx.strokeStyle = "#c4711f";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4);
          ctx.restore();
        }
      } else {
        const fontSize = el.fontSize ?? FONT_SIZES[el.type];
        ctx.save();
        ctx.fillStyle = el.color;
        ctx.font = `${el.type === "heading" || el.type === "stat" ? "bold" : "normal"} ${fontSize}px Georgia, serif`;
        ctx.textBaseline = "top";

        const maxWidth = CANVAS_W - el.x - 40;
        const words = el.text.split(" ");
        let line = "";
        let lineY = el.y;
        const lineH = fontSize * 1.4;

        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, el.x, lineY);
            line = word;
            lineY += lineH;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, el.x, lineY);

        if (el.id === selected) {
          const metrics = ctx.measureText(el.text);
          ctx.strokeStyle = "#c4711f";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(el.x - 4, el.y - 4, Math.min(metrics.width + 8, maxWidth + 8), lineH + 8);
        }
        ctx.restore();
      }
    }
  }, [elements, selected]);

  useEffect(() => { draw(); }, [draw]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / canvasScale,
      y: (e.clientY - rect.top) / canvasScale,
    };
  };

  const hitTest = (x: number, y: number): string | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.kind === "shape") {
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height)
          return el.id;
      } else {
        if (x >= el.x - 4 && x <= el.x + 300 && y >= el.y - 4 && y <= el.y + el.fontSize * 1.6)
          return el.id;
      }
    }
    return null;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    const hit = hitTest(pos.x, pos.y);
    setSelected(hit);
    if (hit) {
      const el = elements.find((x) => x.id === hit)!;
      setDragging({ id: hit, ox: pos.x - el.x, oy: pos.y - el.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const pos = getCanvasPos(e);
    setElements((els) =>
      els.map((el) =>
        el.id === dragging.id
          ? { ...el, x: pos.x - dragging.ox, y: pos.y - dragging.oy }
          : el
      )
    );
  };

  const addTextBlock = (type: TextBlock["type"]) => {
    const newEl: Element = {
      kind: "text",
      id: uid(),
      type,
      text: type === "heading" ? "New Heading" : type === "stat" ? "0" : type === "label" ? "LABEL" : "Body text here",
      x: 60,
      y: 500,
      color: "#1a1a1a",
      fontSize: FONT_SIZES[type],
    };
    setElements((els) => [...els, newEl]);
    setSelected(newEl.id);
  };

  const addShape = (type: Shape["type"]) => {
    const newEl: Element = {
      kind: "shape",
      id: uid(),
      type,
      x: 100,
      y: 500,
      width: type === "divider" ? 700 : 200,
      height: type === "divider" ? 3 : 200,
      color: "#c4711f",
      opacity: 0.8,
    };
    setElements((els) => [...els, newEl]);
    setSelected(newEl.id);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setElements((els) => els.filter((e) => e.id !== selected));
    setSelected(null);
  };

  const selectedEl = elements.find((e) => e.id === selected) ?? null;

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "infographic.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportSvg = () => {
    const svgParts: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}">`,
    ];
    for (const el of elements) {
      if (el.kind === "shape") {
        if (el.type === "circle") {
          svgParts.push(
            `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.color}" opacity="${el.opacity}"/>`
          );
        } else {
          svgParts.push(
            `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.color}" opacity="${el.opacity}"/>`
          );
        }
      } else {
        const weight = el.type === "heading" || el.type === "stat" ? "bold" : "normal";
        svgParts.push(
          `<text x="${el.x}" y="${el.y + el.fontSize}" font-family="Georgia, serif" font-size="${el.fontSize}" font-weight="${weight}" fill="${el.color}">${el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`
        );
      }
    }
    svgParts.push("</svg>");
    const blob = new Blob([svgParts.join("\n")], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "infographic.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Infographic Maker</h1>
          <p className="text-stone-500 text-sm mt-1">Design shareable book graphics. Click to select, drag to move.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportSvg} className="btn-secondary text-sm">Export SVG</button>
          <button onClick={exportPng} className="btn-primary text-sm">Export PNG</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Toolbar */}
        <div className="lg:w-56 space-y-4 shrink-0">
          {/* Templates */}
          <div className="card space-y-3">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Templates</h3>
            <div className="space-y-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { setElements(t.elements); setSelected(null); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 border border-stone-200"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add Elements */}
          <div className="card space-y-3">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Add Text</h3>
            <div className="space-y-1.5">
              {(["heading", "body", "stat", "label"] as const).map((t) => (
                <button key={t} onClick={() => addTextBlock(t)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 border border-stone-200 capitalize">
                  + {t}
                </button>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide pt-2">Add Shape</h3>
            <div className="space-y-1.5">
              {(["rect", "circle", "divider"] as const).map((t) => (
                <button key={t} onClick={() => addShape(t)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 border border-stone-200 capitalize">
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {/* Properties */}
          {selectedEl && (
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Properties</h3>
              <div className="space-y-2">
                {selectedEl.kind === "text" && (
                  <>
                    <label className="block text-xs text-stone-500">Text</label>
                    <textarea
                      rows={3}
                      className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bindery-400"
                      value={selectedEl.text}
                      onChange={(e) =>
                        setElements((els) =>
                          els.map((el) =>
                            el.id === selected && el.kind === "text"
                              ? { ...el, text: e.target.value }
                              : el
                          )
                        )
                      }
                    />
                    <label className="block text-xs text-stone-500">Font size</label>
                    <input type="range" min={10} max={120} value={selectedEl.fontSize}
                      className="w-full accent-bindery-600"
                      onChange={(e) =>
                        setElements((els) =>
                          els.map((el) =>
                            el.id === selected && el.kind === "text"
                              ? { ...el, fontSize: +e.target.value }
                              : el
                          )
                        )
                      }
                    />
                  </>
                )}
                <label className="block text-xs text-stone-500">Color</label>
                <input type="color" value={selectedEl.color}
                  className="w-full h-8 rounded border border-stone-200 cursor-pointer"
                  onChange={(e) =>
                    setElements((els) =>
                      els.map((el) =>
                        el.id === selected ? { ...el, color: e.target.value } : el
                      )
                    )
                  }
                />
                <button onClick={deleteSelected}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div ref={wrapRef} className="flex-1 min-w-0">
          <div
            className="relative border border-stone-200 rounded-xl overflow-hidden shadow-sm"
            style={{ paddingTop: `${(CANVAS_H / CANVAS_W) * 100}%` }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{ imageRendering: "crisp-edges" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
              onDoubleClick={(e) => {
                const pos = getCanvasPos(e);
                const hit = hitTest(pos.x, pos.y);
                if (hit) setEditingText(hit);
              }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">
            Click to select · Drag to move · Double-click text to edit
          </p>
        </div>
      </div>
    </div>
  );
}
