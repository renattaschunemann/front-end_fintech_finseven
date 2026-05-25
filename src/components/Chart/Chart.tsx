"use client";

import React, { useState } from "react";
import "./Chart.css";
import { ChartProps } from "@/interfaces";

export default function Chart({ chartData, theme, formatCurrency }: ChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    month: string;
    receitas: number;
    despesas: number;
    investimentos: number;
  } | null>(null);

  const chartHeight = 250;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 10;
  const paddingTop = 25;
  const paddingBottom = 30;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const rawMax = Math.max(...chartData.map(d => Math.max(d.receitas, d.despesas, d.investimentos || 0)), 6000);
  let step = 1000;
  if (rawMax > 12000) {
    step = 3000;
  } else if (rawMax > 6000) {
    step = 2000;
  }
  const maxVal = Math.ceil(rawMax / step) * step;

  return (
    <div className={`backdrop-blur border rounded-2xl p-6 shadow-md relative transition-all ${theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
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
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-cyan-500" />
            <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Investimentos</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto relative min-h-[260px] flex items-center justify-center">
        <div className="min-w-[650px] w-full max-w-[750px] relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            {Array.from({ length: Math.round(maxVal / step) + 1 }).map((_, i) => {
              const val = i * step;
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
              const barWidth = Math.max(12, monthWidth * 0.16);
              const gap = 3;

              const recHeight = (d.receitas / maxVal) * graphHeight;
              const recX = groupCenterX - 1.5 * barWidth - gap;
              const recY = chartHeight - paddingBottom - recHeight;

              const despHeight = (d.despesas / maxVal) * graphHeight;
              const despX = groupCenterX - 0.5 * barWidth;
              const despY = chartHeight - paddingBottom - despHeight;

              const invHeight = ((d.investimentos || 0) / maxVal) * graphHeight;
              const invX = groupCenterX + 0.5 * barWidth + gap;
              const invY = chartHeight - paddingBottom - invHeight;

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
                    className="animateBarGrow cursor-pointer transition-all duration-200 hover:brightness-125"
                  />

                  <rect
                    x={despX}
                    y={despY}
                    width={barWidth}
                    height={Math.max(2, despHeight)}
                    rx="4"
                    fill={isHovered ? "#fb7185" : "#dc2626"}
                    className="animateBarGrow cursor-pointer transition-all duration-200 hover:brightness-125"
                  />

                  <rect
                    x={invX}
                    y={invY}
                    width={barWidth}
                    height={Math.max(2, invHeight)}
                    rx="4"
                    fill={isHovered ? "#22d3ee" : "#0891b2"}
                    className="animateBarGrow cursor-pointer transition-all duration-200 hover:brightness-125"
                  />

                  <rect
                    x={paddingLeft + index * monthWidth}
                    y={paddingTop}
                    width={monthWidth}
                    height={graphHeight}
                    fill="black"
                    fillOpacity="0"
                    pointerEvents="all"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setActiveTooltip({
                        x: groupCenterX,
                        y: Math.max(100, Math.min(recY, despY, invY) - 10),
                        month: d.name,
                        receitas: d.receitas,
                        despesas: d.despesas,
                        investimentos: d.investimentos || 0
                      });
                    }}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  <text
                    x={groupCenterX}
                    y={chartHeight - paddingBottom + 18}
                    fill={index === chartData.length - 1 ? (theme === "dark" ? "#67e8f9" : "#0891b2") : (theme === "dark" ? "#64748b" : "#475569")}
                    fontSize="10"
                    fontWeight={index === chartData.length - 1 ? "bold" : "semibold"}
                    textAnchor="middle"
                    className="transition-colors"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
            {activeTooltip && (() => {
              const tooltipWidth = 170;
              const halfWidth = tooltipWidth / 2;
              const minSafeX = halfWidth + 5; 
              const maxSafeX = chartWidth - halfWidth - 5; 

              let tooltipX = activeTooltip.x;
              let arrowX = 0;

              if (tooltipX < minSafeX) {
                tooltipX = minSafeX;
                arrowX = activeTooltip.x - minSafeX;
              } else if (tooltipX > maxSafeX) {
                tooltipX = maxSafeX;
                arrowX = activeTooltip.x - maxSafeX;
              }

              return (
                <g
                  transform={`translate(${tooltipX}, ${activeTooltip.y})`}
                  className="transition-all duration-200 pointer-events-none"
                  pointerEvents="none"
                >
                  
                  <rect
                    x="-85"
                    y="-132"
                    width="170"
                    height="116"
                    rx="12"
                    fill={theme === "dark" ? "#070b13" : "#ffffff"}
                    stroke={theme === "dark" ? "#1e293b" : "#cbd5e1"}
                    strokeWidth="1.5"
                    opacity="0.96"
                    pointerEvents="none"
                  />

                  
                  <path
                    d={`M ${arrowX - 6} -15 L ${arrowX} -9 L ${arrowX + 6} -15 Z`}
                    fill={theme === "dark" ? "#070b13" : "#ffffff"}
                    stroke={theme === "dark" ? "#1e293b" : "#cbd5e1"}
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />

                  
                  <path
                    d={`M ${arrowX - 5} -16.5 L ${arrowX} -10 L ${arrowX + 5} -16.5 Z`}
                    fill={theme === "dark" ? "#070b13" : "#ffffff"}
                    pointerEvents="none"
                  />

                  
                  <text
                    x="-73"
                    y="-112"
                    fill={theme === "dark" ? "#f1f5f9" : "#0f172a"}
                    fontSize="11"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {activeTooltip.month}
                  </text>

                  
                  {activeTooltip.month === chartData[chartData.length - 1]?.name && (
                    <g transform="translate(38, -122)" pointerEvents="none">
                      <rect
                        x="0"
                        y="0"
                        width="35"
                        height="13"
                        rx="3"
                        fill={theme === "dark" ? "rgba(6,182,212,0.15)" : "rgba(8,145,178,0.08)"}
                        stroke={theme === "dark" ? "rgba(6,182,212,0.3)" : "rgba(8,145,178,0.15)"}
                        strokeWidth="1"
                        pointerEvents="none"
                      />
                      <text
                        x="17.5"
                        y="9"
                        fill="#06b6d4"
                        fontSize="7.5"
                        fontWeight="extrabold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        ATIVO
                      </text>
                    </g>
                  )}

                  
                  <line
                    x1="-73"
                    y1="-102"
                    x2="73"
                    y2="-102"
                    stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                    strokeWidth="1"
                    pointerEvents="none"
                  />

                  
                  <text
                    x="-73"
                    y="-85"
                    fill="#10b981"
                    fontSize="9.5"
                    fontWeight="semibold"
                    pointerEvents="none"
                  >
                    Receitas:
                  </text>
                  <text
                    x="73"
                    y="-85"
                    fill="#10b981"
                    fontSize="10"
                    fontWeight="extrabold"
                    textAnchor="end"
                    pointerEvents="none"
                  >
                    {formatCurrency(activeTooltip.receitas)}
                  </text>

                  
                  <text
                    x="-73"
                    y="-68"
                    fill="#f43f5e"
                    fontSize="9.5"
                    fontWeight="semibold"
                    pointerEvents="none"
                  >
                    Despesas:
                  </text>
                  <text
                    x="73"
                    y="-68"
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="extrabold"
                    textAnchor="end"
                    pointerEvents="none"
                  >
                    {formatCurrency(activeTooltip.despesas)}
                  </text>

                  
                  <text
                    x="-73"
                    y="-51"
                    fill="#06b6d4"
                    fontSize="9.5"
                    fontWeight="semibold"
                    pointerEvents="none"
                  >
                    Investimentos:
                  </text>
                  <text
                    x="73"
                    y="-51"
                    fill="#06b6d4"
                    fontSize="10"
                    fontWeight="extrabold"
                    textAnchor="end"
                    pointerEvents="none"
                  >
                    {formatCurrency(activeTooltip.investimentos)}
                  </text>

                  
                  <line
                    x1="-73"
                    y1="-41"
                    x2="73"
                    y2="-41"
                    stroke={theme === "dark" ? "rgba(30,41,59,0.5)" : "rgba(241,245,249,0.8)"}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    pointerEvents="none"
                  />

                  
                  <text
                    x="-73"
                    y="-26"
                    fill={theme === "dark" ? "#94a3b8" : "#475569"}
                    fontSize="9.5"
                    fontWeight="semibold"
                    pointerEvents="none"
                  >
                    Saldo do Mês:
                  </text>
                  <text
                    x="73"
                    y="-26"
                    fill={theme === "dark" ? "#ffffff" : "#0f172a"}
                    fontSize="10.5"
                    fontWeight="black"
                    textAnchor="end"
                    pointerEvents="none"
                  >
                    {formatCurrency(activeTooltip.receitas - activeTooltip.despesas - activeTooltip.investimentos)}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
