"use client";

import React, { useState } from "react";
import styles from "./Chart.module.css";

interface ChartProps {
  chartData: Array<{
    name: string;
    receitas: number;
    despesas: number;
  }>;
  theme: "dark" | "light";
  formatCurrency: (val: number) => string;
}

export default function Chart({ chartData, theme, formatCurrency }: ChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    month: string;
    receitas: number;
    despesas: number;
  } | null>(null);

  const chartHeight = 250;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 10;
  const paddingTop = 25;
  const paddingBottom = 30;
  
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const maxVal = 6000;

  return (
    <div className={`backdrop-blur border rounded-2xl p-6 shadow-md relative transition-all ${
      theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>Receitas vs. Despesas Mensais</h3>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Visão geral do fluxo de caixa histórico e atual.</p>
        </div>

        <div className="flex items-center gap-5 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-rose-500" />
            <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Despesas</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto relative min-h-[260px] flex items-center justify-center">
        <div className="min-w-[650px] w-full max-w-[750px] relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            {Array.from({ length: 7 }).map((_, i) => {
              const val = i * 1000;
              const y = chartHeight - paddingBottom - (val / maxVal) * graphHeight;
              
              return (
                <g key={i}>
                  {i > 0 && (
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - paddingRight} 
                      y2={y} 
                      stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                    />
                  )}
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 4} 
                    fill={theme === "dark" ? "#64748b" : "#475569"} 
                    fontSize="10" 
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {val === 0 ? "0" : val.toLocaleString("pt-BR")}
                  </text>
                </g>
              );
            })}

            <line 
              x1={paddingLeft} 
              y1={chartHeight - paddingBottom} 
              x2={chartWidth - paddingRight} 
              y2={chartHeight - paddingBottom} 
              stroke={theme === "dark" ? "#334155" : "#cbd5e1"} 
              strokeWidth="1.5" 
            />

            {chartData.map((d, index) => {
              const monthWidth = graphWidth / chartData.length;
              const groupCenterX = paddingLeft + index * monthWidth + monthWidth / 2;
              const barWidth = Math.max(16, monthWidth * 0.18);
              const gap = 4;

              const recHeight = (d.receitas / maxVal) * graphHeight;
              const recX = groupCenterX - barWidth - gap / 2;
              const recY = chartHeight - paddingBottom - recHeight;

              const despHeight = (d.despesas / maxVal) * graphHeight;
              const despX = groupCenterX + gap / 2;
              const despY = chartHeight - paddingBottom - despHeight;

              const isHovered = activeTooltip?.month === d.name;

              return (
                <g key={d.name} className="transition-all duration-300">
                  <rect
                    x={recX}
                    y={recY}
                    width={barWidth}
                    height={Math.max(2, recHeight)}
                    rx="4"
                    fill={isHovered ? "#34d399" : "#059669"}
                    className={`${styles.animateBarGrow} cursor-pointer transition-all duration-200 hover:brightness-125`}
                    onMouseEnter={() => {
                      setActiveTooltip({
                        x: recX + barWidth / 2,
                        y: recY - 10,
                        month: d.name,
                        receitas: d.receitas,
                        despesas: d.despesas
                      });
                    }}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  <rect
                    x={despX}
                    y={despY}
                    width={barWidth}
                    height={Math.max(2, despHeight)}
                    rx="4"
                    fill={isHovered ? "#fb7185" : "#dc2626"}
                    className={`${styles.animateBarGrow} cursor-pointer transition-all duration-200 hover:brightness-125`}
                    onMouseEnter={() => {
                      setActiveTooltip({
                        x: despX + barWidth / 2,
                        y: despY - 10,
                        month: d.name,
                        receitas: d.receitas,
                        despesas: d.despesas
                      });
                    }}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  <rect
                    x={paddingLeft + index * monthWidth}
                    y={paddingTop}
                    width={monthWidth}
                    height={graphHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setActiveTooltip({
                        x: groupCenterX,
                        y: Math.min(recY, despY) - 10,
                        month: d.name,
                        receitas: d.receitas,
                        despesas: d.despesas
                      });
                    }}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  <text
                    x={groupCenterX}
                    y={chartHeight - paddingBottom + 18}
                    fill={d.name === "Dezembro" ? (theme === "dark" ? "#67e8f9" : "#0891b2") : (theme === "dark" ? "#64748b" : "#475569")}
                    fontSize="10"
                    fontWeight={d.name === "Dezembro" ? "bold" : "semibold"}
                    textAnchor="middle"
                    className="transition-colors"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {activeTooltip && (
            <div 
              className={`absolute border rounded-xl p-3.5 shadow-2xl z-30 transition-all duration-200 pointer-events-none w-56 text-[11px] font-semibold ${styles.animateFadeIn} ${
                theme === "dark" ? "bg-slate-950/95 border-slate-800 text-slate-300" : "bg-white/95 border-slate-200 text-slate-700"
              }`}
              style={{
                left: `${(activeTooltip.x / chartWidth) * 100}%`,
                top: `${(activeTooltip.y / chartHeight) * 100 - 30}%`,
                transform: "translate(-50%, -100%)"
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className={`font-bold text-xs ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{activeTooltip.month}</span>
                {activeTooltip.month === "Dezembro" && (
                  <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/30 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded">Ativo</span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-emerald-500">
                  <span className="opacity-80">Receitas:</span>
                  <span className="font-extrabold">{formatCurrency(activeTooltip.receitas)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-500">
                  <span className="opacity-80">Despesas:</span>
                  <span className="font-extrabold">{formatCurrency(activeTooltip.despesas)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-300/35 pt-1.5 text-slate-500">
                  <span className="opacity-80">Balanço:</span>
                  <span className={`font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {formatCurrency(activeTooltip.receitas - activeTooltip.despesas)}
                  </span>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 border-r border-b absolute bottom-[-5px] left-1/2 -translate-x-1/2 rotate-45 ${
                theme === "dark" ? "bg-slate-950 border-slate-800/80" : "bg-white border-slate-200"
              }`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
