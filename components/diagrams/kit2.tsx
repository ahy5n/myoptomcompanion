// More building blocks for the inline SVG diagrams: wrapped text, boxes,
// arrows, flowcharts, graphs and simple eye outlines. Same palette and
// conventions as kit.tsx (fixed colours on a white panel).

import type { ReactNode } from 'react'
import { INK, LILAC, LILAC_SOFT, MUTED, ROSE, SAGE, SKY } from './kit'
import { FIG } from './palette'

/** Splits text into lines of about `max` characters (on spaces). */
export function wrap(text: string, max: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      if (line && (line + ' ' + word).length > max) {
        out.push(line)
        line = word
      } else line = line ? `${line} ${word}` : word
    }
    out.push(line)
  }
  return out
}

/** Multi-line centred (or left/right) text. */
export function Lines({
  x,
  y,
  text,
  max = 22,
  size = 13,
  weight = 500,
  fill = INK,
  anchor = 'middle',
  lh = 1.25,
  show = true,
}: {
  x: number
  y: number
  text: string
  max?: number
  size?: number
  weight?: number
  fill?: string
  anchor?: 'start' | 'middle' | 'end'
  lh?: number
  show?: boolean
}) {
  if (!show) return null
  const ls = wrap(text, max)
  const top = y - ((ls.length - 1) * size * lh) / 2
  return (
    // A white halo keeps dark text readable over lines; white text sits on a fill and needs none.
    <text x={x} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill} stroke={fill === FIG.white ? 'none' : FIG.white} strokeWidth={3} strokeLinejoin="round" paintOrder="stroke">
      {ls.map((l, i) => (
        <tspan key={i} x={x} y={top + i * size * lh} dominantBaseline="middle">
          {l}
        </tspan>
      ))}
    </text>
  )
}

/** A rounded box with wrapped, centred text. */
export function TBox({
  x,
  y,
  w,
  h,
  text,
  fill = LILAC_SOFT,
  stroke,
  ink = INK,
  size = 13,
  weight = 600,
  r = 10,
  max,
}: {
  x: number
  y: number
  w: number
  h: number
  text: string
  fill?: string
  stroke?: string
  ink?: string
  size?: number
  weight?: number
  r?: number
  max?: number
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />
      <Lines x={x + w / 2} y={y + h / 2} text={text} max={max ?? Math.max(8, Math.floor(w / (size * 0.56)))} size={size} weight={weight} fill={ink} />
    </g>
  )
}

/** Straight arrow; uses the arrowhead markers from <Arrowheads />. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  colour = INK,
  id = 'ah',
  width = 1.8,
  dash,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  colour?: string
  id?: string
  width?: number
  dash?: string
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} strokeDasharray={dash} markerEnd={`url(#${id})`} />
}

/** Arrow along any path. */
export function PathArrow({ d, colour = INK, id = 'ah', width = 1.8, dash }: { d: string; colour?: string; id?: string; width?: number; dash?: string }) {
  return <path d={d} fill="none" stroke={colour} strokeWidth={width} strokeDasharray={dash} markerEnd={`url(#${id})`} />
}

/** Leader line from a feature to a label. */
export function Lead({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTED} strokeWidth={1} opacity={0.75} />
}

/** Label with a leader line, hidden on the blank (exercise) version. */
export function Callout({
  x,
  y,
  tx,
  ty,
  text,
  show = true,
  anchor = 'start',
  max = 26,
  size = 12.5,
}: {
  x: number
  y: number
  tx: number
  ty: number
  text: string
  show?: boolean
  anchor?: 'start' | 'middle' | 'end'
  max?: number
  size?: number
}) {
  if (!show) return null
  return (
    <g>
      <Lead x1={x} y1={y} x2={tx} y2={ty} />
      <circle cx={x} cy={y} r={2.2} fill={MUTED} />
      <Lines x={tx + (anchor === 'start' ? 4 : anchor === 'end' ? -4 : 0)} y={ty} text={text} max={max} size={size} anchor={anchor} weight={600} />
    </g>
  )
}

const TONES = [
  [LILAC_SOFT, LILAC],
  [FIG.grey50b, SKY],
  [FIG.grey50, SAGE],
  [FIG.orange100, ROSE],
] as const

/**
 * Steps left to right in rows, each row continuing below the last.
 * Good for long linear processes.
 */
export function FlowRows({
  steps,
  perRow,
  width,
  top = 16,
  boxH = 58,
  gapY = 36,
  size = 13,
}: {
  steps: string[]
  perRow: number
  width: number
  top?: number
  boxH?: number
  gapY?: number
  size?: number
}) {
  const gapX = 28
  const boxW = (width - 20 - gapX * (perRow - 1)) / perRow
  const pos = steps.map((_, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    return { x: 10 + col * (boxW + gapX), y: top + row * (boxH + gapY), row, col }
  })
  return (
    <g>
      {pos.map((p, i) => {
        if (i === 0) return null
        const q = pos[i - 1]
        if (q.row === p.row) return <Arrow key={`a${i}`} x1={q.x + boxW + 2} y1={q.y + boxH / 2} x2={p.x - 4} y2={p.y + boxH / 2} />
        // Down to the next row and back to its start.
        const midY = q.y + boxH + gapY / 2
        return <PathArrow key={`a${i}`} d={`M${q.x + boxW / 2} ${q.y + boxH} V${midY} H${p.x + boxW / 2} V${p.y - 4}`} />
      })}
      {steps.map((s, i) => {
        const [fill] = TONES[pos[i].row % TONES.length]
        return <TBox key={s} x={pos[i].x} y={pos[i].y} w={boxW} h={boxH} text={s} fill={fill} size={size} />
      })}
    </g>
  )
}

export const flowHeight = (n: number, perRow: number, boxH = 58, gapY = 36, top = 16) => top * 2 + Math.ceil(n / perRow) * boxH + (Math.ceil(n / perRow) - 1) * gapY

/** Axes for a graph, returning helpers to place points. */
export function makeAxes({
  x,
  y,
  w,
  h,
  xMin,
  xMax,
  yMin,
  yMax,
  xLog = false,
  yLog = false,
}: {
  x: number
  y: number
  w: number
  h: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xLog?: boolean
  yLog?: boolean
}) {
  const fx = (v: number) => (xLog ? (Math.log10(v) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) : (v - xMin) / (xMax - xMin))
  const fy = (v: number) => (yLog ? (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) : (v - yMin) / (yMax - yMin))
  const px = (v: number) => x + fx(v) * w
  const py = (v: number) => y + h - fy(v) * h
  const path = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${px(a).toFixed(1)} ${py(b).toFixed(1)}`).join(' ')
  const fnPath = (fn: (v: number) => number, from = xMin, to = xMax, n = 80) => {
    const pts: [number, number][] = []
    for (let i = 0; i <= n; i++) {
      const v = xLog ? 10 ** (Math.log10(from) + ((Math.log10(to) - Math.log10(from)) * i) / n) : from + ((to - from) * i) / n
      pts.push([v, fn(v)])
    }
    return path(pts)
  }
  return { px, py, path, fnPath }
}

export function Axes({
  x,
  y,
  w,
  h,
  xLabel,
  yLabel,
  xTicks = [],
  yTicks = [],
  px,
  py,
}: {
  x: number
  y: number
  w: number
  h: number
  xLabel: string
  yLabel: string
  xTicks?: (number | [number, string])[]
  yTicks?: (number | [number, string])[]
  px: (v: number) => number
  py: (v: number) => number
}) {
  return (
    <g>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={INK} strokeWidth={1.5} markerEnd="url(#ah)" />
      <line x1={x} y1={y + h} x2={x} y2={y} stroke={INK} strokeWidth={1.5} markerEnd="url(#ah)" />
      {xTicks.map((t) => {
        const [v, l] = Array.isArray(t) ? t : [t, String(t)]
        return (
          <g key={`x${v}`}>
            <line x1={px(v)} y1={y + h} x2={px(v)} y2={y + h + 5} stroke={INK} />
            <text x={px(v)} y={y + h + 17} textAnchor="middle" fontSize={11.5} fill={MUTED}>
              {l}
            </text>
          </g>
        )
      })}
      {yTicks.map((t) => {
        const [v, l] = Array.isArray(t) ? t : [t, String(t)]
        return (
          <g key={`y${v}`}>
            <line x1={x - 5} y1={py(v)} x2={x} y2={py(v)} stroke={INK} />
            <text x={x - 8} y={py(v)} textAnchor="end" dominantBaseline="middle" fontSize={11.5} fill={MUTED}>
              {l}
            </text>
          </g>
        )
      })}
      <text x={x + w / 2} y={y + h + 36} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>
        {xLabel}
      </text>
      <text x={x - 44} y={y + h / 2} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK} transform={`rotate(-90 ${x - 44} ${y + h / 2})`}>
        {yLabel}
      </text>
    </g>
  )
}

/** Side view of an eye (light from the left): cornea, lens, retina, optic nerve. */
export function EyeSide({ cx, cy, r = 70, lens = true, nerve = true, fill = FIG.white, facing = 'left' }: { cx: number; cy: number; r?: number; lens?: boolean; nerve?: boolean; fill?: string; facing?: 'left' | 'right' }) {
  const corneaX = cx - r
  return (
    // Drawn facing left; mirrored when the eye looks right.
    <g transform={facing === 'right' ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>
      {nerve && <rect x={cx + r - 6} y={cy - r * 0.1 + r * 0.12} width={r * 0.55} height={r * 0.2} rx={4} fill={FIG.amber100} stroke={INK} strokeWidth={1.2} />}
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={1.8} />
      {/* cornea bulge */}
      <path d={`M${corneaX + r * 0.18} ${cy - r * 0.55} Q${corneaX - r * 0.22} ${cy} ${corneaX + r * 0.18} ${cy + r * 0.55}`} fill={fill} stroke={INK} strokeWidth={1.8} />
      {lens && <ellipse cx={corneaX + r * 0.42} cy={cy} rx={r * 0.12} ry={r * 0.32} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.4} />}
      {/* retina */}
      <path d={`M${cx + r * 0.55} ${cy - r * 0.83} A${r * 0.98} ${r * 0.98} 0 0 1 ${cx + r * 0.55} ${cy + r * 0.83}`} fill="none" stroke={ROSE} strokeWidth={2.4} />
    </g>
  )
}

/** Front view of an eye: almond lids, iris and pupil (pupil offset for gaze). */
export function EyeFront({ cx, cy, w = 90, gaze = 0, pupil = 9, iris = 20, iFill = FIG.blue100 }: { cx: number; cy: number; w?: number; gaze?: number; pupil?: number; iris?: number; iFill?: string }) {
  const h = w * 0.46
  return (
    <g>
      <path d={`M${cx - w / 2} ${cy} Q${cx} ${cy - h} ${cx + w / 2} ${cy} Q${cx} ${cy + h} ${cx - w / 2} ${cy} Z`} fill={FIG.white} stroke={INK} strokeWidth={1.6} />
      <circle cx={cx + gaze} cy={cy} r={iris} fill={iFill} stroke={SKY} strokeWidth={1.2} />
      <circle cx={cx + gaze} cy={cy} r={pupil} fill={INK} />
    </g>
  )
}

export function Panel({ x, y, w, h, title, children }: { x: number; y: number; w: number; h: number; title?: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={FIG.white} stroke={FIG.grey100c} strokeWidth={1.5} />
      {title && <Lines x={x + w / 2} y={y + 20} text={title} size={13.5} weight={700} max={Math.floor(w / 7.5)} />}
      {children}
    </g>
  )
}
