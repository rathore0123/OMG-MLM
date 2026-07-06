import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * d3-org-chart v1.1.3 facts (confirmed from source):
 *  - Class is the default export (no named export)
 *  - d3 must be on window before use
 *  - Field names: nodeId, parentNodeId, width, height, template
 *  - NO nodeContent() callback — HTML goes in data[n].template
 *  - onNodeClick(cb) → cb receives nodeId string
 *  - Setters: svgWidth, svgHeight, initialZoom, backgroundColor,
 *             container, data, depth, duration, onNodeClick
 */

interface OrgNode {
  nodeId: string;
  parentNodeId?: string | null;
  width?: number;
  height?: number;
  template?: string;
  name?: string;
  username?: string;
  active?: boolean;
  directSubordinates?: number;
  totalSubordinates?: number;
  [key: string]: any;
}

interface OrgChartComponentProps {
  data: OrgNode[];
  onNodeClick: (nodeId: string) => void;
}

// ── Inject styles once ───────────────────────────────────────────────────────
const STYLE_ID = "org-chart-pro-styles";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;500;600&display=swap');

    :root {
      --ot-bg: #060d14;
      --ot-card: #0f1e2e;
      --ot-border: #1a3048;
      --ot-gold: #f0b429;
      --ot-gold-dim: #a07010;
      --ot-cyan: #29d4e0;
      --ot-green: #22c97b;
      --ot-red: #e05252;
      --ot-text: #e8f4ff;
      --ot-text-dim: #3d6080;
    }

    .org-chart-pro-wrap {
      overflow: hidden;
      width: 100%;
      min-height: 520px;
      position: relative;
    }

    /* connector lines */
    @keyframes orgDash { to { stroke-dashoffset: -18; } }
    .org-chart-pro-wrap path.link {
      stroke: #1e7cd6 !important;
      stroke-width: 2px !important;
      stroke-dasharray: 6,3 !important;
      fill: none !important;
      animation: orgDash 1.5s linear infinite !important;
    }

    /* expand/collapse button */
    .org-chart-pro-wrap .node-button-circle {
      fill: #0b1520 !important;
      stroke: var(--ot-gold-dim) !important;
    }
    .org-chart-pro-wrap .node-button-text {
      fill: var(--ot-gold) !important;
    }

    /* node card */
    .org-node-card {
      font-family: 'Exo 2', sans-serif;
      background: var(--ot-card);
      border: 3px solid var(--ot-border);
      border-radius: 16px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 14px 10px 10px;
      position: relative;
      cursor: pointer;
      box-shadow: 0 4px 24px #00000088;
      box-sizing: border-box;
      overflow: hidden;
    }
    .org-node-card.root {
      border-color: var(--ot-gold-dim);
      box-shadow: 0 0 0 1px var(--ot-gold-dim), 0 8px 40px #f0b42922;
    }

    /* ── FIX: card border reflects paid/unpaid status ──
       --ot-green / --ot-red were already declared above but never used
       on the card itself (only on the small status dot). Wiring them in
       here, placed after .root so paid/unpaid status is the visually
       dominant signal even on the root node — root keeps its gold
       avatar ring/username color, only the border/glow switches to
       green or red based on payment status. */
    .org-node-card.paid {
      border-color: var(--ot-green);
      box-shadow: 0 0 0 1px var(--ot-green), 0 8px 40px #22c97b22;
    }
    .org-node-card.unpaid {
      border-color: var(--ot-red);
      box-shadow: 0 0 0 1px var(--ot-red), 0 8px 40px #e0525222;
    }

    .org-node-dot {
      position: absolute; top: 9px; right: 9px;
      width: 8px; height: 8px; border-radius: 50%;
    }
    .org-node-dot.active  { background: var(--ot-green); box-shadow: 0 0 6px var(--ot-green); }
    .org-node-dot.inactive { background: var(--ot-red); }

    @keyframes orgSpin { to { transform: rotate(360deg); } }

    .org-avatar-ring {
      width: 62px; height: 62px; border-radius: 50%;
      padding: 3px;
      background: conic-gradient(var(--ot-cyan), #1e7cd6, var(--ot-cyan));
      flex-shrink: 0; margin-bottom: 8px;
      animation: orgSpin 8s linear infinite;
    }
    .org-node-card.root .org-avatar-ring {
      background: conic-gradient(var(--ot-gold), var(--ot-gold-dim), var(--ot-gold));
    }
    .org-avatar-inner {
      width: 100%; height: 100%; border-radius: 50%;
      background: #0b1520;
      display: flex; align-items: center; justify-content: center;
      animation: orgSpin 8s linear infinite reverse;
    }
    .org-diamond {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, var(--ot-cyan) 30%, #0a4a5a);
      clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
      position: relative;
    }
    .org-node-card.root .org-diamond {
      background: linear-gradient(135deg, var(--ot-gold) 30%, #8a5a00);
    }
    .org-diamond::after {
      content: '';
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      width: 12px; height: 12px;
      background: rgba(255,255,255,.22);
      clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
    }

    .org-node-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 14px; font-weight: 700; letter-spacing: 1px;
      color: var(--ot-text); text-align: center; line-height: 1.4;
      max-width: 154px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .org-node-uname {
      font-size: 10px; color: var(--ot-cyan);
      letter-spacing: 1px; margin-top: 2px; text-align: center;
    }
    .org-node-card.root .org-node-uname { color: var(--ot-gold); }

    .org-node-stats {
      display: flex; width: 100%;
      margin-top: 8px;
      border-top: 1px solid var(--ot-border);
      padding-top: 7px;
    }
    .org-stat {
      flex: 1; display: flex; flex-direction: column; align-items: center;
    }
    .org-stat + .org-stat { border-left: 1px solid var(--ot-border); }
    .org-stat-val {
      font-family: 'Rajdhani', sans-serif;
      font-size: 16px; font-weight: 700; color: var(--ot-gold); line-height: 1;
    }
    .org-stat:first-child .org-stat-val { color: var(--ot-cyan); }
    .org-stat-lbl {
      font-size: 8px; color: var(--ot-text-dim);
      letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; text-align: center;
    }
  `;
  document.head.appendChild(style);
}

// ── Build HTML template string for one node ──────────────────────────────────
// v1.1.3 renders this via .html(() => data.template) inside foreignObject
function buildTemplate(n: OrgNode): string {
  const isRoot = !n.parentNodeId || n.parentNodeId === "" || n.parentNodeId === null;
  const active = n.PaidStatus === "paid";
  const name = n.name ?? n.Name ?? "";
  const username = n.username ?? n.Username ?? n.nodeId ?? "";
  const direct = n.directSubordinates ?? 0;
  const total = n.totalSubordinates ?? 0;

  // ── FIX: card border/glow color is driven by paid/unpaid status
  const rootClass = isRoot ? " root" : "";
  const statusClass = active ? "paid" : "unpaid";

  return `
    <div class="org-node-card${rootClass} ${statusClass}">
      <div class="org-node-dot ${active ? "active" : "inactive"}"></div>
      <div class="org-avatar-ring">
        <div class="org-avatar-inner">
          <div class="org-diamond"></div>
        </div>
      </div>
      <div class="org-node-name" title="${name}">${name}</div>
      <div class="org-node-uname">[${username}]</div>
      <div class="org-node-stats">
        <div class="org-stat">
          <div class="org-stat-val">${direct}</div>
          <div class="org-stat-lbl">Direct</div>
        </div>
        <div class="org-stat">
          <div class="org-stat-val">${total}</div>
          <div class="org-stat-lbl">Total</div>
        </div>
      </div>
    </div>`;
}

// ── Component ────────────────────────────────────────────────────────────────
const OrgChartComponent: React.FC<OrgChartComponentProps> = ({ data, onNodeClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInst = useRef<any>(null);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (!data?.length || !chartRef.current) return;

    // v1.1.3 reads d3 from window — must be set before new TreeChart()
    (window as any).d3 = d3;

    const run = async () => {
      const mod = await import("d3-org-chart");
      // v1 ships only a default export (the TreeChart class)
      const TreeChart = (mod as any).default ?? mod;

      if (typeof TreeChart !== "function") {
        console.error("d3-org-chart: default export is not a constructor:", mod);
        return;
      }

      // Destroy previous instance cleanly
      if (chartInst.current) {
        try { chartInst.current.clearChart?.(); } catch (_) { /* ignore */ }
        chartInst.current = null;
      }
      if (chartRef.current) chartRef.current.innerHTML = "";

      // ── Normalise rows for v1.1.3 ─────────────────────────────────────────
      // Required fields: nodeId, parentNodeId, width, height, template
      const NODE_W = 180;
      const NODE_H = 196;

      const rows = data.map((n: any) => {
        const normalised: OrgNode = {
          ...n,
          // v1 uses nodeId + parentNodeId (your SP already returns these)
          nodeId: String(n.nodeId ?? n.id ?? ""),
          parentNodeId: n.parentNodeId != null && n.parentNodeId !== ""
            ? String(n.parentNodeId)
            : n.parentId != null && n.parentId !== ""
              ? String(n.parentId)
              : "",          // root → empty string
          width: n.width ?? NODE_W,
          height: n.height ?? NODE_H,
          // convenience fields used by buildTemplate
          name: n.name ?? n.Name ?? "",
          username: n.username ?? n.Username ?? n.nodeId ?? n.id ?? "",
          active: n.active ?? true,
          directSubordinates: n.directSubordinates ?? 0,
          totalSubordinates: n.totalSubordinates ?? 0,
        };
        // template is what v1 renders inside the foreignObject
        normalised.template = buildTemplate(normalised);
        return normalised;
      });

      // ── v1.1.3 chainable API ──────────────────────────────────────────────
      chartInst.current = new TreeChart()
        .container(chartRef.current!)
        .data(rows)
        .svgWidth(chartRef.current!.offsetWidth || 960)
        .svgHeight(560)
        .initialZoom(0.75)
        .backgroundColor("#060d14")
        .onNodeClick((nodeId: string) => onNodeClick(nodeId))
        .render();
    };

    run().catch(console.error);
  }, [data]);

  return (
    <div className="org-chart-pro-wrap">
      <div ref={chartRef} style={{ width: "100%", minHeight: 520 }} />
    </div>
  );
};

export default OrgChartComponent;