// Optics, refraction and binocular vision drawings. Ray geometry is worked
// out from the lens equations rather than eyeballed.

import type { JSX } from 'react'
import { Arrowheads, BUTTER, BUTTER_INK, type DiagramDef, INK, LILAC, LILAC_SOFT, MUTED, ROSE, ROSE_SOFT, SAGE, SAGE_SOFT, SKY, SKY_SOFT, T } from './kit'
import { Arrow, Callout, EyeFront, EyeSide, Lines, Panel, PathArrow, TBox } from './kit2'
import { FIG } from './palette'

const AXIS = { stroke: MUTED, strokeWidth: 1, strokeDasharray: '6 5' } as const

/** Vertical arrow for objects and images. */
function ObjArrow({ x, y0, y1, colour = INK, dash }: { x: number; y0: number; y1: number; colour?: string; dash?: boolean }) {
  return <line x1={x} y1={y0} x2={x} y2={y1} stroke={colour} strokeWidth={3} strokeDasharray={dash ? '5 4' : undefined} markerEnd={`url(#${colour === ROSE ? 'ah-rose' : colour === LILAC ? 'ah-lilac' : 'ah'})`} />
}

/** Thin lens symbol: double-headed (plus) or inverted heads (minus). */
function ThinLens({ x, y, h, minus = false, colour = SKY }: { x: number; y: number; h: number; minus?: boolean; colour?: string }) {
  const t = minus ? 1 : -1
  return (
    <g stroke={colour} strokeWidth={2.4} fill="none" strokeLinecap="round">
      <line x1={x} y1={y - h} x2={x} y2={y + h} />
      <path d={`M${x - 8} ${y - h - 8 * t} L${x} ${y - h} L${x + 8} ${y - h - 8 * t}`} />
      <path d={`M${x - 8} ${y + h + 8 * t} L${x} ${y + h} L${x + 8} ${y + h + 8 * t}`} />
    </g>
  )
}

// ── Lens optics ───────────────────────────────────────────────────────

const thinLensVergence: DiagramDef = {
  viewBox: [700, 330],
  caption: 'With f′ = 100 and l = −200 (units of the drawing), 1/l′ = 1/f′ + 1/l gives l′ = +200: a real, inverted image the same size.',
  render: (L) => {
    // Lens at x 330, f′ = 100 px, object at l = −200 → image at l′ = +200.
    const y = 170
    const lx = 330
    return (
      <g>
        <Arrowheads />
        <line x1={30} y1={y} x2={680} y2={y} {...AXIS} />
        <ThinLens x={lx} y={y} h={110} />
        <ObjArrow x={130} y0={y} y1={110} />
        <ObjArrow x={530} y0={y} y1={230} colour={ROSE} />
        {/* parallel ray → through F′ */}
        <path d={`M130 110 H${lx} L530 230`} fill="none" stroke={LILAC} strokeWidth={1.8} />
        {/* through the optical centre, undeviated */}
        <path d={`M130 110 L530 230`} fill="none" stroke={SAGE} strokeWidth={1.8} />
        {/* through F → leaves parallel */}
        <path d={`M130 110 L${lx} 230 H530`} fill="none" stroke={SKY} strokeWidth={1.8} />
        {[
          [230, 'F'],
          [430, 'F′'],
        ].map(([x, l]) => (
          <g key={l}>
            <circle cx={x} cy={y} r={4.5} fill={INK} />
            <T x={Number(x)} y={y + 20} size={14} show={L}>
              {l}
            </T>
          </g>
        ))}
        <T x={130} y={96} size={13} show={L}>
          Object
        </T>
        <T x={530} y={250} size={13} fill={ROSE} show={L}>
          Image (real, inverted)
        </T>
        <T x={lx} y={46} size={13} show={L}>
          Optical centre
        </T>
        <line x1={130} y1={292} x2={326} y2={292} stroke={INK} strokeWidth={1.4} markerEnd="url(#ah)" markerStart="url(#ah)" />
        <T x={228} y={308} size={12.5} show={L}>
          l (negative)
        </T>
        <line x1={334} y1={292} x2={530} y2={292} stroke={INK} strokeWidth={1.4} markerEnd="url(#ah)" markerStart="url(#ah)" />
        <T x={432} y={308} size={12.5} show={L}>
          l′ (positive)
        </T>
        <Arrow x1={560} y1={30} x2={660} y2={30} colour={MUTED} />
        <T x={610} y={16} size={11.5} fill={MUTED} weight={500}>
          light travels left → right
        </T>
      </g>
    )
  },
}

const thickLensCardinal: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Equivalent focal length is measured from P′; the back vertex focal length (what the focimeter reads) is measured from the back surface.',
  render: (L) => {
    const y = 160
    const A1 = 290
    const A2 = 360
    const P = 313
    const Pp = 337
    const f = 170
    return (
      <g>
        <Arrowheads />
        <line x1={20} y1={y} x2={690} y2={y} {...AXIS} />
        <path d={`M${A1 + 20} 50 Q${A1 - 24} ${y} ${A1 + 20} 270 L${A2 - 20} 270 Q${A2 + 24} ${y} ${A2 - 20} 50 Z`} fill={SKY_SOFT} stroke={SKY} strokeWidth={2} />
        <line x1={P} y1={60} x2={P} y2={260} stroke={LILAC} strokeWidth={1.6} strokeDasharray="5 4" />
        <line x1={Pp} y1={60} x2={Pp} y2={260} stroke={LILAC} strokeWidth={1.6} strokeDasharray="5 4" />
        <T x={P - 8} y={44} size={13} fill={LILAC} show={L} anchor="end">
          P
        </T>
        <T x={Pp + 8} y={44} size={13} fill={LILAC} show={L} anchor="start">
          P′
        </T>
        {[
          [P - f, 'F'],
          [Pp + f, 'F′'],
        ].map(([x, l]) => (
          <g key={l}>
            <circle cx={x} cy={y} r={5} fill={INK} />
            <T x={Number(x)} y={y - 18} size={14} show={L}>
              {l}
            </T>
          </g>
        ))}
        <circle cx={A1} cy={y} r={4} fill={ROSE} />
        <circle cx={A2} cy={y} r={4} fill={ROSE} />
        <Callout x={A1} y={y} tx={180} ty={240} text="Front vertex A₁" show={L} anchor="end" />
        <Callout x={A2} y={y} tx={420} ty={244} text="Back vertex A₂" show={L} />
        <line x1={Pp} y1={204} x2={Pp + f} y2={204} stroke={LILAC} strokeWidth={1.6} markerEnd="url(#ah-lilac)" markerStart="url(#ah-lilac)" />
        <T x={Pp + f / 2 + 40} y={194} size={12.5} fill={LILAC} show={L}>
          Equivalent focal length f′
        </T>
        <line x1={A2} y1={118} x2={Pp + f} y2={118} stroke={ROSE} strokeWidth={1.6} markerEnd="url(#ah-rose)" markerStart="url(#ah-rose)" />
        <T x={(A2 + Pp + f) / 2 + 20} y={104} size={12.5} fill={ROSE} show={L}>
          Back vertex focal length fv′
        </T>
        <line x1={A1} y1={290} x2={A2} y2={290} stroke={INK} strokeWidth={1.4} markerEnd="url(#ah)" markerStart="url(#ah)" />
        <T x={(A1 + A2) / 2} y={306} size={12.5} show={L}>
          Thickness t
        </T>
      </g>
    )
  },
}

const snellPrism: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Going into a denser medium, light bends towards the normal (n₁ sin θ₁ = n₂ sin θ₂). A prism bends light towards its base, so the object appears shifted towards the apex.',
  render: (L) => (
    <g>
      <Arrowheads />
      {/* Snell */}
      <rect x={20} y={160} width={290} height={140} fill={SKY_SOFT} />
      <line x1={20} y1={160} x2={310} y2={160} stroke={SKY} strokeWidth={2} />
      <line x1={165} y1={30} x2={165} y2={300} {...AXIS} />
      <PathArrow d="M75 50 L165 160" colour={INK} width={2.2} />
      <PathArrow d="M165 160 L215 290" colour={INK} width={2.2} />
      <path d="M165 110 A50 50 0 0 0 133 121" fill="none" stroke={LILAC} strokeWidth={1.6} />
      <path d="M165 210 A50 50 0 0 0 183 207" fill="none" stroke={ROSE} strokeWidth={1.6} />
      <T x={130} y={100} size={12.5} fill={LILAC} show={L} anchor="end">
        θ₁ incidence
      </T>
      <T x={190} y={228} size={12.5} fill={ROSE} show={L} anchor="start">
        θ₂ refraction
      </T>
      <T x={172} y={40} size={12.5} show={L} anchor="start">
        Normal
      </T>
      <T x={40} y={146} size={13} anchor="start">
        Air n₁
      </T>
      <T x={40} y={178} size={13} anchor="start">
        Glass n₂
      </T>
      {/* Prism */}
      <path d="M470 60 L400 260 L540 260 Z" fill={LILAC_SOFT} stroke={LILAC} strokeWidth={2} />
      <T x={470} y={46} size={13} show={L}>
        Apex
      </T>
      <T x={470} y={280} size={13} show={L}>
        Base
      </T>
      <path d="M340 150 L440 160 L510 186 L640 228" fill="none" stroke={INK} strokeWidth={2.2} markerEnd="url(#ah)" />
      <line x1={640} y1={228} x2={420} y2={154} stroke={ROSE} strokeDasharray="5 4" />
      <line x1={340} y1={150} x2={420} y2={154} stroke={MUTED} strokeDasharray="3 3" />
      <circle cx={340} cy={150} r={5} fill={INK} />
      <circle cx={350} cy={130} r={5} fill={ROSE} />
      <T x={352} y={114} size={12} fill={ROSE} show={L}>
        Image displaced towards apex
      </T>
      <EyeFront cx={665} cy={232} w={42} iris={9} pupil={4} />
      <T x={600} y={206} size={12.5} show={L}>
        Deviation d
      </T>
    </g>
  ),
}

const mirrorPurkinje: DiagramDef = {
  viewBox: [720, 340],
  caption: 'F lies halfway to C (f = r/2). The four Purkinje images come from the four refracting surfaces; only IV, from the concave back of the lens, is inverted.',
  render: (L) => {
    // Concave mirror: centre of curvature C, radius R, vertex V; F = V − R/2.
    const C = { x: 110, y: 170 }
    const R = 190
    const V = C.x + R
    const F = V - R / 2
    const mx = (y: number) => C.x + Math.sqrt(R * R - (y - C.y) ** 2)
    return (
      <g>
        <Arrowheads />
        <path d={`M${mx(60)} 60 A${R} ${R} 0 0 1 ${mx(280)} 280`} fill="none" stroke={SKY} strokeWidth={4} />
        <line x1={20} y1={C.y} x2={V + 10} y2={C.y} {...AXIS} />
        {[110, 140, 200, 230].map((y) => (
          <path key={y} d={`M24 ${y} H${mx(y)} L${F} ${C.y}`} fill="none" stroke={ROSE} strokeWidth={1.6} />
        ))}
        <circle cx={F} cy={C.y} r={5} fill={INK} />
        <circle cx={C.x} cy={C.y} r={5} fill={INK} />
        <T x={F} y={C.y + 20} size={13} show={L}>
          F
        </T>
        <T x={C.x} y={C.y + 20} size={13} show={L}>
          C
        </T>
        <line x1={C.x} y1={306} x2={V} y2={306} stroke={INK} strokeWidth={1.3} markerEnd="url(#ah)" markerStart="url(#ah)" />
        <T x={(C.x + V) / 2} y={324} size={12.5} show={L}>
          Radius r (f = r/2)
        </T>
        {/* Eye with the four Purkinje images */}
        <g transform="translate(400 40)">
          <path d="M70 10 Q0 130 70 250" fill="none" stroke={INK} strokeWidth={2} />
          <path d="M86 20 Q24 130 86 240" fill="none" stroke={INK} strokeWidth={1.4} />
          <ellipse cx={200} cy={130} rx={56} ry={90} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.6} />
          {(
            [
              [44, 112, 24, false],
              [60, 116, 18, false],
              [170, 98, 48, false],
              [236, 122, 14, true],
            ] as const
          ).map(([x, y, h, inv], i) => (
            <line key={i} x1={x} y1={inv ? y : y + h} x2={x} y2={inv ? y + h : y} stroke={ROSE} strokeWidth={3} markerEnd="url(#ah-rose)" />
          ))}
          <Callout x={44} y={110} tx={-60} ty={-16} text="Purkinje I (anterior cornea)" show={L} anchor="start" max={16} />
          <Callout x={60} y={136} tx={-60} ty={286} text="Purkinje II (posterior cornea)" show={L} anchor="start" max={18} />
          <Callout x={170} y={96} tx={150} ty={-16} text="Purkinje III (anterior lens: larger, upright)" show={L} anchor="start" max={24} />
          <Callout x={236} y={138} tx={140} ty={286} text="Purkinje IV (posterior lens: small, inverted)" show={L} anchor="start" max={24} />
        </g>
      </g>
    )
  },
}

const ametropiaFarPoint: DiagramDef = {
  viewBox: [720, 330],
  caption: 'The far point is where the eye is focused when relaxed. A correcting lens puts its focal point at the far point.',
  render: (L) => {
    const eye = (ox: number, focusDx: number, title: string, lens?: 'minus' | 'plus') => {
      const cy = 150
      const front = ox + 10
      const retina = ox + 150
      const focus = retina + focusDx
      return (
        <g key={title}>
          <path d={`M${ox + 40} ${cy - 70} Q${front - 6} ${cy} ${ox + 40} ${cy + 70}`} fill="none" stroke={INK} strokeWidth={2} />
          <path d={`M${ox + 40} ${cy - 70} A80 80 0 0 1 ${ox + 40} ${cy + 70}`} transform={`translate(${70} 0)`} fill="none" stroke={ROSE} strokeWidth={2.4} />
          {[-40, 0, 40].map((dy) => (
            <path key={dy} d={`M${ox - 40} ${cy + dy} H${front + 4} L${focus} ${cy}${focusDx < 0 ? ` L${retina - 4} ${cy - dy * ((retina - focus) / (focus - front))}` : ''}`} fill="none" stroke={SKY} strokeWidth={1.6} />
          ))}
          <circle cx={focus} cy={cy} r={4.5} fill={ROSE} />
          <T x={ox + 80} y={30} size={14}>
            {title}
          </T>
          {lens && <ThinLens x={ox - 22} y={cy - 92} h={16} minus={lens === 'minus'} colour={LILAC} />}
        </g>
      )
    }
    return (
      <g>
        <Arrowheads />
        {eye(40, 0, 'Emmetropia')}
        {eye(280, -40, 'Myopia', 'minus')}
        {eye(520, 40, 'Hyperopia', 'plus')}
        <T x={420} y={250} size={12.5} fill={ROSE} show={L}>
          Focus in front of retina
        </T>
        <T x={660} y={250} size={12.5} fill={ROSE} show={L}>
          Focus behind retina
        </T>
        <circle cx={250} cy={150} r={4} fill={LILAC} />
        <Callout x={250} y={150} tx={248} ty={290} text="Far point (myope): real, in front of the eye" show={L} anchor="middle" max={24} />
        <Callout x={700} y={150} tx={612} ty={296} text="Far point (hyperope): virtual, behind the eye" show={L} anchor="middle" max={24} />
        <circle cx={700} cy={150} r={4} fill={LILAC} />
        <T x={268} y={58} size={12} fill={LILAC} show={L} anchor="start">
          Correcting lens: minus
        </T>
        <T x={508} y={58} size={12} fill={LILAC} show={L} anchor="start">
          Correcting lens: plus
        </T>
      </g>
    )
  },
}

const sturmConoid: DiagramDef = {
  viewBox: [720, 360],
  caption: 'Here the vertical meridian is stronger, so it focuses first and forms a horizontal line. The power cross is for −1.00 / −2.00 × 180: −1.00 along 180, −3.00 along 90.',
  render: (L) => (
    <g>
      <Arrowheads />
      <line x1={20} y1={120} x2={700} y2={120} {...AXIS} />
      <ellipse cx={120} cy={120} rx={14} ry={80} fill={SKY_SOFT} stroke={SKY} strokeWidth={2} />
      {/* vertical-meridian rays converge first */}
      <path d="M40 40 L120 40 L360 120 L560 186" fill="none" stroke={LILAC} strokeWidth={1.4} />
      <path d="M40 200 L120 200 L360 120 L560 54" fill="none" stroke={LILAC} strokeWidth={1.4} />
      {/* horizontal line at first focus */}
      <line x1={340} y1={120} x2={380} y2={120} stroke={ROSE} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={450} cy={120} rx={14} ry={14} fill="none" stroke={BUTTER_INK} strokeWidth={3} />
      <line x1={560} y1={98} x2={560} y2={142} stroke={ROSE} strokeWidth={5} strokeLinecap="round" />
      <T x={360} y={96} size={12.5} fill={ROSE} show={L}>
        Horizontal focal line
      </T>
      <T x={450} y={154} size={12.5} fill={BUTTER_INK} show={L}>
        Circle of least confusion
      </T>
      <T x={560} y={78} size={12.5} fill={ROSE} show={L}>
        Vertical focal line
      </T>
      <line x1={360} y1={214} x2={560} y2={214} stroke={INK} strokeWidth={1.4} markerEnd="url(#ah)" markerStart="url(#ah)" />
      <T x={460} y={232} size={12.5} show={L}>
        Interval of Sturm
      </T>
      {/* power cross */}
      <g transform="translate(140 290)">
        <line x1={-90} y1={0} x2={90} y2={0} stroke={INK} strokeWidth={2} />
        <line x1={0} y1={-56} x2={0} y2={56} stroke={INK} strokeWidth={2} />
        <T x={96} y={0} size={13} anchor="start">
          −1.00 @ 180
        </T>
        <T x={0} y={-66} size={13}>
          −3.00 @ 90
        </T>
      </g>
      <T x={330} y={268} size={12.5} show={L} anchor="start">
        Power cross: axis meridian (180) carries the sphere,
      </T>
      <T x={330} y={288} size={12.5} show={L} anchor="start">
        the power meridian (90) carries sphere + cyl.
      </T>
    </g>
  ),
}

const prismBase: DiagramDef = {
  viewBox: [700, 300],
  caption: 'Prism moves the image towards its apex. Base-in relieves exophoria (the eyes needn’t converge as much); base-out relieves esophoria.',
  render: (L) => {
    const pair = (ox: number, baseIn: boolean, title: string) => {
      const eyesY = 240
      const prism = (x: number, left: boolean) => {
        // base towards the nose for base-in
        const baseOnRight = baseIn ? left : !left
        return baseOnRight ? <path d={`M${x - 26} 150 L${x + 26} 130 L${x + 26} 170 Z`} fill={LILAC_SOFT} stroke={LILAC} /> : <path d={`M${x + 26} 150 L${x - 26} 130 L${x - 26} 170 Z`} fill={LILAC_SOFT} stroke={LILAC} />
      }
      const out = baseIn ? -40 : 40
      return (
        <g key={title}>
          <T x={ox + 150} y={22} size={14}>
            {title}
          </T>
          <circle cx={ox + 150} cy={60} r={6} fill={INK} />
          <circle cx={ox + 150 - out} cy={60} r={6} fill={ROSE} opacity={0.8} />
          <circle cx={ox + 150 + out} cy={60} r={6} fill={ROSE} opacity={0.8} />
          {prism(ox + 90, true)}
          {prism(ox + 210, false)}
          <line x1={ox + 90} y1={eyesY - 18} x2={ox + 150 + out} y2={66} stroke={ROSE} strokeDasharray="4 4" />
          <line x1={ox + 210} y1={eyesY - 18} x2={ox + 150 - out} y2={66} stroke={ROSE} strokeDasharray="4 4" />
          <EyeFront cx={ox + 90} cy={eyesY} w={56} iris={11} pupil={5} />
          <EyeFront cx={ox + 210} cy={eyesY} w={56} iris={11} pupil={5} />
        </g>
      )
    }
    return (
      <g>
        {pair(20, true, 'Base in (for exo)')}
        {pair(370, false, 'Base out (for eso)')}
        <T x={350} y={290} size={12.5} fill={ROSE} show={L}>
          Image moves towards the apex
        </T>
      </g>
    )
  },
}

const jcc: DiagramDef = {
  viewBox: [700, 320],
  caption: 'A ±0.25 or ±0.50 cross cylinder. Axis check: handle along the trial cyl axis. Power check: one of the JCC axes along the trial cyl axis.',
  render: (L) => {
    const lens = (cx: number, cy: number, r: number, rot: number) => (
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <line x1={cx + r * 0.7} y1={cy + r * 0.7} x2={cx + r * 1.7} y2={cy + r * 1.7} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill={FIG.white} stroke={INK} strokeWidth={2} />
        {[-0.6, 0.6].map((k) => (
          <circle key={`r${k}`} cx={cx + k * r} cy={cy} r={r * 0.09} fill={ROSE} />
        ))}
        {[-0.6, 0.6].map((k) => (
          <circle key={`w${k}`} cx={cx} cy={cy + k * r} r={r * 0.09} fill={FIG.white} stroke={INK} strokeWidth={1.4} />
        ))}
      </g>
    )
    return (
      <g>
        {lens(170, 140, 80, 0)}
        <Callout x={230} y={200} tx={30} ty={300} text="Handle at 45° to both meridians" show={L} max={40} />
        <Callout x={122} y={140} tx={20} ty={40} text="Minus axis (red dots)" show={L} />
        <Callout x={170} y={92} tx={250} ty={40} text="Plus axis (white dots)" show={L} />
        <Panel x={420} y={20} w={270} h={130} title="Axis check">
          <line x1={440} y1={110} x2={670} y2={110} stroke={SAGE} strokeWidth={2} strokeDasharray="6 4" />
          <T x={555} y={128} size={11.5} fill={SAGE} weight={500}>
            trial cyl axis
          </T>
          <line x1={500} y1={110} x2={610} y2={110} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <Lines x={555} y={74} text="Handle on the cyl axis; flip and compare" max={30} size={12} />
        </Panel>
        <Panel x={420} y={170} w={270} h={130} title="Power check">
          <line x1={440} y1={260} x2={670} y2={260} stroke={SAGE} strokeWidth={2} strokeDasharray="6 4" />
          <circle cx={520} cy={260} r={8} fill={ROSE} />
          <circle cx={590} cy={260} r={8} fill={ROSE} />
          <Lines x={555} y={224} text="Red (or white) dots on the cyl axis; flip and compare" max={30} size={12} />
        </Panel>
      </g>
    )
  },
}

const focimeter: DiagramDef = {
  viewBox: [700, 360],
  caption: 'Spectacles go back surface down, with the lens table touching the bottom of the rims so the axis reads true.',
  render: (L) => (
    <g>
      {/* body */}
      <rect x={250} y={60} width={160} height={250} rx={18} fill={FIG.grey100} stroke={INK} strokeWidth={1.8} />
      <rect x={300} y={20} width={60} height={50} rx={10} fill={SKY_SOFT} stroke={INK} strokeWidth={1.6} />
      <rect x={160} y={176} width={110} height={20} rx={4} fill={FIG.grey200} stroke={INK} />
      <rect x={300} y={190} width={60} height={18} rx={4} fill={LILAC_SOFT} stroke={INK} />
      <circle cx={430} cy={180} r={26} fill={FIG.white} stroke={INK} strokeWidth={1.8} />
      <circle cx={430} cy={250} r={18} fill={FIG.white} stroke={INK} strokeWidth={1.8} />
      <rect x={326} y={140} width={8} height={40} fill={INK} />
      {/* spectacles */}
      <path d="M150 168 Q200 150 250 168" fill="none" stroke={ROSE} strokeWidth={3} />
      <ellipse cx={330} cy={176} rx={40} ry={10} fill="none" stroke={ROSE} strokeWidth={2.4} />
      <Callout x={330} y={30} tx={60} ty={30} text="Eyepiece" show={L} anchor="start" />
      <Callout x={330} y={186} tx={60} ty={120} text="Lens stop (lens rests here, back surface down)" show={L} anchor="start" max={24} />
      <Callout x={200} y={186} tx={60} ty={240} text="Lens table (touching the bottom rims)" show={L} anchor="start" max={22} />
      <Callout x={330} y={150} tx={500} ty={90} text="Marking device" show={L} />
      <Callout x={456} y={180} tx={500} ty={160} text="Power wheel" show={L} />
      <Callout x={448} y={250} tx={500} ty={240} text="Axis wheel" show={L} />
      <Callout x={330} y={60} tx={500} ty={40} text="Prism scale (on the graticule)" show={L} />
    </g>
  ),
}

const rulePushUp: DiagramDef = {
  viewBox: [700, 260],
  caption: 'Move the target in slowly until the first sustained blur. Amplitude (D) = 1 / near point (m): 10 cm → 10 D.',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeSide cx={110} cy={130} r={56} facing="right" />
      <rect x={60} y={196} width={610} height={18} rx={4} fill={BUTTER} stroke={BUTTER_INK} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={160 + i * 40} y1={196} x2={160 + i * 40} y2={204} stroke={BUTTER_INK} />
      ))}
      <rect x={300} y={110} width={14} height={86} fill={LILAC_SOFT} stroke={LILAC} />
      <T x={307} y={96} size={12.5} show={L}>
        Sliding target
      </T>
      <Arrow x1={420} y1={150} x2={330} y2={150} colour={ROSE} id="ah-rose" width={2.4} />
      <line x1={170} y1={238} x2={300} y2={238} stroke={INK} strokeWidth={1.4} markerEnd="url(#ah)" markerStart="url(#ah)" />
      <T x={235} y={254} size={12.5} show={L}>
        Near point of accommodation
      </T>
      <T x={520} y={232} size={12.5} show={L}>
        RAF rule (rests on the cheeks)
      </T>
      <TBox x={460} y={40} w={220} h={50} text="Amplitude = 1 / near point (m)" fill={SKY_SOFT} />
    </g>
  ),
}

const npc: DiagramDef = {
  viewBox: [700, 300],
  caption: 'Bring the target in until one eye drifts out (break), then back until both eyes refixate (recovery). Record both, in cm.',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeFront cx={80} cy={90} w={70} iris={14} pupil={6} gaze={8} />
      <EyeFront cx={80} cy={190} w={70} iris={14} pupil={6} gaze={-12} />
      <path d="M115 90 L330 140 M115 190 L330 140" stroke={SKY} strokeWidth={1.4} strokeDasharray="5 4" />
      <rect x={60} y={248} width={610} height={16} rx={4} fill={BUTTER} stroke={BUTTER_INK} />
      <circle cx={330} cy={140} r={9} fill={LILAC} />
      <Arrow x1={470} y1={140} x2={344} y2={140} colour={ROSE} id="ah-rose" width={2.4} />
      <T x={330} y={116} size={12.5} show={L}>
        Target
      </T>
      <Callout x={80} y={190} tx={170} ty={232} text="Break: one eye drifts out" show={L} />
      <Arrow x1={360} y1={176} x2={480} y2={176} colour={SAGE} id="ah-sage" />
      <T x={520} y={176} size={12.5} fill={SAGE} anchor="start" show={L}>
        Recovery point
      </T>
      <T x={560} y={238} size={12.5} show={L}>
        RAF rule
      </T>
    </g>
  ),
}

const aniseikonia: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Unequal powers give unequal image sizes. Looking down through plus lenses induces base-up prism, more through the stronger lens (Prentice’s rule).',
  render: (L) => (
    <g>
      <Arrowheads />
      <ObjArrow x={350} y0={70} y1={30} />
      <T x={350} y={18} size={12.5}>
        Object
      </T>
      {(
        [
          [210, 'R +1.00', 34, 'Weaker lens: smaller image'],
          [490, 'L +4.00', 52, 'Stronger lens: larger image'],
        ] as const
      ).map(([x, pw, img, label]) => (
        <g key={pw}>
          <ThinLens x={x} y={140} h={34} colour={SKY} />
          <T x={x} y={92} size={13} fill={SKY}>
            {pw}
          </T>
          <EyeFront cx={x} cy={200} w={70} iris={14} pupil={6} />
          <rect x={x - img / 2} y={250} width={img} height={img * 0.6} rx={4} fill={LILAC_SOFT} stroke={LILAC} />
          <T x={x} y={302} size={12.5} show={L}>
            {label}
          </T>
        </g>
      ))}
      <T x={350} y={262} size={13} fill={ROSE} show={L}>
        Aniseikonia
      </T>
      <Arrow x1={240} y1={156} x2={240} y2={140} colour={ROSE} id="ah-rose" />
      <Arrow x1={520} y1={166} x2={520} y2={128} colour={ROSE} id="ah-rose" width={2.6} />
      <T x={620} y={150} size={12} fill={ROSE} show={L}>
        Differential vertical
      </T>
      <T x={620} y={166} size={12} fill={ROSE} show={L}>
        prism in downgaze
      </T>
    </g>
  ),
}

const magnificationTypes: DiagramDef = {
  viewBox: [720, 260],
  caption: 'Every method makes the retinal image bigger; they differ in how (and what they cost in field, distance or portability).',
  render: (L) => {
    const panels: [string, (x: number) => JSX.Element][] = [
      ['Relative size', (x) => <text x={x + 120} y={130} fontSize={44} fontWeight={700} fill={INK}>A</text>],
      ['Relative distance', (x) => <text x={x + 70} y={124} fontSize={22} fontWeight={700} fill={INK}>A</text>],
      [
        'Angular (telescope)',
        (x) => (
          <g>
            <rect x={x + 70} y={100} width={40} height={20} fill={SKY_SOFT} stroke={SKY} />
            <rect x={x + 110} y={96} width={20} height={28} fill={SKY_SOFT} stroke={SKY} />
            <text x={x + 140} y={118} fontSize={14} fontWeight={700} fill={INK}>
              A
            </text>
          </g>
        ),
      ],
      [
        'Electronic',
        (x) => (
          <g>
            <rect x={x + 76} y={78} width={74} height={56} rx={6} fill={FIG.grey100} stroke={INK} />
            <text x={x + 113} y={122} textAnchor="middle" fontSize={34} fontWeight={700} fill={INK}>
              A
            </text>
          </g>
        ),
      ],
    ]
    return (
      <g>
        {panels.map(([title, draw], i) => {
          const x = 10 + i * 178
          const big = i > 0
          return (
            <Panel key={title} x={x} y={10} w={168} h={240} title={title}>
              <EyeFront cx={x + 34} cy={110} w={40} iris={9} pupil={4} />
              {draw(x)}
              <line x1={x + 20} y1={200} x2={x + 20 + (big ? 110 : 110)} y2={200} stroke={LILAC} strokeWidth={big ? 10 : 10} strokeLinecap="round" />
              <T x={x + 84} y={226} size={11.5} fill={LILAC} show={L}>
                Retinal image size ↑
              </T>
            </Panel>
          )
        })}
      </g>
    )
  },
}

const volkOptics: DiagramDef = {
  viewBox: [720, 280],
  caption: 'The condensing lens forms a real, inverted aerial image in front of it; the slit lamp microscope focuses on that image, not on the eye.',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeSide cx={110} cy={140} r={70} facing="right" />
      <ellipse cx={260} cy={140} rx={14} ry={64} fill={SKY_SOFT} stroke={SKY} strokeWidth={2} />
      <path d="M150 140 L180 140" stroke={MUTED} />
      {[-40, 40].map((dy) => (
        <path key={dy} d={`M160 ${140 + dy * 0.4} L260 ${140 + dy} L380 ${140 - dy * 0.6} L480 ${140 - dy * 1.1}`} fill="none" stroke={ROSE} strokeWidth={1.6} />
      ))}
      <ObjArrow x={380} y0={120} y1={162} colour={LILAC} />
      <rect x={520} y={90} width={150} height={100} rx={14} fill={FIG.grey100} stroke={INK} strokeWidth={1.6} />
      <rect x={480} y={120} width={40} height={40} fill={FIG.grey200} stroke={INK} />
      <T x={595} y={140} size={13} show={L}>
        Slit lamp
      </T>
      <T x={260} y={56} size={12.5} show={L}>
        Condensing lens (60/78/90 D)
      </T>
      <T x={380} y={196} size={12.5} fill={LILAC} show={L}>
        Aerial image (real, inverted)
      </T>
      <Callout x={52} y={140} tx={110} ty={250} text="Fundus" show={L} anchor="middle" />
    </g>
  ),
}

const directOphApproach: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Right eye to right eye, coming in about 15° from the temporal side so the patient can keep looking past you at the distance target.',
  render: (L) => (
    <g>
      <Arrowheads />
      {/* patient (bottom) */}
      <ellipse cx={330} cy={250} rx={70} ry={52} fill={SKY_SOFT} stroke={SKY} strokeWidth={1.6} />
      <circle cx={300} cy={214} r={9} fill={INK} />
      <circle cx={360} cy={214} r={9} fill={INK} />
      <T x={330} y={300} size={12.5} show={L}>
        Patient
      </T>
      {/* line of sight */}
      <line x1={300} y1={204} x2={300} y2={20} stroke={SAGE} strokeWidth={1.6} strokeDasharray="6 5" markerEnd="url(#ah-sage)" />
      <T x={308} y={30} size={12.5} fill={SAGE} anchor="start" show={L}>
        Distant fixation target
      </T>
      <T x={308} y={120} size={12} fill={SAGE} anchor="start" show={L}>
        Patient’s line of sight
      </T>
      {/* examiner, 15° temporal (the patient's right = viewer's left) */}
      <circle cx={196} cy={112} r={44} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.6} />
      <line x1={226} y1={140} x2={286} y2={182} stroke={LILAC} strokeWidth={2.4} />
      <circle cx={288} cy={184} r={7} fill={LILAC} />
      <T x={196} y={112} size={12} fill={LILAC} show={L}>
        Examiner
      </T>
      <Callout x={288} y={184} tx={150} ty={214} text="Examiner’s right eye" show={L} anchor="end" />
      <path d="M300 150 A54 54 0 0 0 286 152" fill="none" stroke={ROSE} strokeWidth={1.6} />
      <line x1={300} y1={204} x2={268} y2={86} stroke={ROSE} strokeWidth={1} strokeDasharray="3 3" />
      <T x={262} y={74} size={12.5} fill={ROSE} anchor="end" show={L}>
        15° temporal approach
      </T>
    </g>
  ),
}

const myopiaControl: DiagramDef = {
  viewBox: [720, 300],
  caption: 'Peripheral hyperopic defocus is thought to drive eye growth; designs that put peripheral images in front of the retina aim to slow it.',
  render: (L) => {
    const eye = (ox: number, peripheral: number, title: string, note: string) => (
      <g key={title}>
        <T x={ox + 150} y={22} size={14}>
          {title}
        </T>
        <ThinLens x={ox + 20} y={150} h={70} minus colour={LILAC} />
        <path d={`M${ox + 60} 90 Q${ox + 40} 150 ${ox + 60} 210`} fill="none" stroke={INK} strokeWidth={2} />
        <path d={`M${ox + 200} 60 A110 110 0 0 1 ${ox + 200} 240`} fill="none" stroke={ROSE} strokeWidth={2.4} />
        <path d={`M${ox} 150 H${ox + 247}`} fill="none" stroke={SKY} strokeWidth={1.4} />
        <circle cx={ox + 247} cy={150} r={5} fill={SKY} />
        <path d={`M${ox} 110 H${ox + 60} L${ox + 212 + peripheral} 74`} fill="none" stroke={BUTTER_INK} strokeWidth={1.4} />
        <circle cx={ox + 212 + peripheral} cy={74} r={5} fill={BUTTER_INK} />
        <Lines x={ox + 150} y={270} text={note} max={36} size={12.5} weight={600} fill={BUTTER_INK} show={L} />
      </g>
    )
    return (
      <g>
        {eye(10, 40, 'Single vision lens', 'Peripheral hyperopic defocus (behind the retina)')}
        {eye(370, -40, 'Myopia-control lens', 'Peripheral myopic defocus (in front of the retina)')}
        <T x={180} y={164} size={12} fill={SKY} show={L}>
          Central focus on the retina
        </T>
        <line x1={70} y1={250} x2={320} y2={250} stroke={MUTED} strokeWidth={1.2} markerEnd="url(#ah)" markerStart="url(#ah)" />
        <T x={195} y={238} size={11.5} fill={MUTED} show={L}>
          Axial length
        </T>
      </g>
    )
  },
}

// ── Binocular vision ──────────────────────────────────────────────────

const horopterDisparity: DiagramDef = {
  viewBox: [700, 360],
  caption: 'Points on the horopter fall on corresponding points. Nearer objects give crossed disparity, further ones uncrossed; inside Panum’s area they still fuse.',
  render: (L) => {
    const LE = { x: 270, y: 300 }
    const RE = { x: 430, y: 300 }
    const F = { x: 350, y: 120 }
    // Vieth–Müller circle through both eyes and F.
    const cy = (F.y ** 2 - LE.y ** 2 + (F.x - 350) ** 2 - (LE.x - 350) ** 2) / (2 * (F.y - LE.y))
    const r = Math.abs(F.y - cy)
    return (
      <g>
        <Arrowheads />
        <path d={`M${350 - r * 0.95} ${cy - r * 0.31} A${r} ${r} 0 0 1 ${350 + r * 0.95} ${cy - r * 0.31}`} fill="none" stroke={LILAC_SOFT} strokeWidth={34} />
        <path d={`M${350 - r * 0.95} ${cy - r * 0.31} A${r} ${r} 0 0 1 ${350 + r * 0.95} ${cy - r * 0.31}`} fill="none" stroke={LILAC} strokeWidth={2} />
        <circle cx={LE.x} cy={LE.y} r={18} fill={FIG.white} stroke={INK} strokeWidth={1.8} />
        <circle cx={RE.x} cy={RE.y} r={18} fill={FIG.white} stroke={INK} strokeWidth={1.8} />
        {[LE, RE].map((e, i) => (
          <line key={`f${i}`} x1={e.x} y1={e.y} x2={F.x} y2={F.y} stroke={INK} strokeWidth={1.4} />
        ))}
        <circle cx={F.x} cy={F.y} r={6} fill={INK} />
        <circle cx={350} cy={200} r={6} fill={ROSE} />
        {[LE, RE].map((e, i) => (
          <line key={`n${i}`} x1={e.x} y1={e.y} x2={350} y2={200} stroke={ROSE} strokeWidth={1.2} strokeDasharray="4 4" />
        ))}
        <circle cx={350} cy={60} r={6} fill={SKY} />
        {[LE, RE].map((e, i) => (
          <line key={`u${i}`} x1={e.x} y1={e.y} x2={350} y2={60} stroke={SKY} strokeWidth={1.2} strokeDasharray="4 4" />
        ))}
        <T x={364} y={116} size={12.5} anchor="start" show={L}>
          Fixation point F
        </T>
        <T x={364} y={204} size={12.5} fill={ROSE} anchor="start" show={L}>
          Nearer: crossed disparity
        </T>
        <T x={364} y={56} size={12.5} fill={SKY} anchor="start" show={L}>
          Further: uncrossed disparity
        </T>
        <T x={350 + r * 0.92} y={cy - r * 0.31 - 26} size={12.5} fill={LILAC} show={L}>
          Horopter
        </T>
        <T x={140} y={150} size={12.5} fill={LILAC} show={L}>
          Panum’s fusional area
        </T>
        <T x={350} y={334} size={12} fill={MUTED} show={L}>
          Corresponding points: same direction in each eye
        </T>
      </g>
    )
  },
}

function eyePair(cx: number, cy: number, leftGaze: number, rightGaze: number, cover?: 'L' | 'R') {
  return (
    <g>
      <EyeFront cx={cx - 46} cy={cy} w={72} iris={14} pupil={6} gaze={rightGaze} />
      <EyeFront cx={cx + 46} cy={cy} w={72} iris={14} pupil={6} gaze={leftGaze} />
      {cover === 'R' && <rect x={cx - 86} y={cy - 26} width={82} height={52} rx={8} fill={FIG.grey500} opacity={0.75} />}
      {cover === 'L' && <rect x={cx + 6} y={cy - 26} width={82} height={52} rx={8} fill={FIG.grey500} opacity={0.75} />}
    </g>
  )
}

const phoriaTropia: DiagramDef = {
  viewBox: [700, 300],
  caption: 'Drawn as you face the patient. A phoria only shows when fusion is broken; a tropia is there with both eyes open.',
  render: (L) => (
    <g>
      <Arrowheads />
      <T x={20} y={40} size={14} anchor="start">
        Phoria
      </T>
      {eyePair(200, 90, 0, 0)}
      <T x={200} y={140} size={12} show={L}>
        Straight with both eyes open
      </T>
      {eyePair(500, 90, 0, -10, 'R')}
      <T x={500} y={140} size={12} show={L}>
        Covered eye drifts out (exophoria)
      </T>
      <T x={20} y={190} size={14} anchor="start">
        Tropia
      </T>
      {eyePair(350, 240, 12, 0)}
      <T x={350} y={290} size={12} fill={ROSE} show={L}>
        Left eye turned out with both eyes open (exotropia)
      </T>
    </g>
  ),
}

const coverTest: DiagramDef = {
  viewBox: [700, 380],
  caption: 'Cover–uncover first (any tropia?), then alternate cover (total deviation). Drawn as you face the patient.',
  render: (L) => {
    const steps: [string, JSX.Element][] = [
      ['1. Both eyes fixating', eyePair(170, 80, 0, 0)],
      ['2. Cover right eye: left eye stays still (no left tropia)', eyePair(520, 80, 0, -10, 'R')],
      ['3. Uncover: right eye moves in (exophoria recovering)', eyePair(170, 250, 0, -10)],
      ['4. Alternate cover: each eye moves in as it’s uncovered', eyePair(520, 250, 0, 0, 'L')],
    ]
    return (
      <g>
        <Arrowheads />
        {steps.map(([title, eyes], i) => {
          const x = i % 2 ? 520 : 170
          const y = i < 2 ? 80 : 250
          return (
            <g key={title}>
              {eyes}
              <Lines x={x} y={y + 52} text={title} max={34} size={12.5} weight={600} show={L || i >= 0} />
            </g>
          )
        })}
        <Arrow x1={110} y1={214} x2={136} y2={214} colour={ROSE} id="ah-rose" width={2.4} />
      </g>
    )
  },
}

const eomHPattern: DiagramDef = {
  viewBox: [700, 340],
  caption: 'Positions as the patient looks (their right is your left). In each gaze, the muscles named are the main movers for that direction.',
  render: (L) => {
    const pts: [number, number, string, string][] = [
      [170, 60, 'Up and right', 'RSR · LIO'],
      [170, 170, 'Right', 'RLR · LMR'],
      [170, 280, 'Down and right', 'RIR · LSO'],
      [530, 60, 'Up and left', 'LSR · RIO'],
      [530, 170, 'Left', 'LLR · RMR'],
      [530, 280, 'Down and left', 'LIR · RSO'],
    ]
    return (
      <g>
        <path d="M170 60 V280 M530 60 V280 M170 170 H530" stroke={LILAC} strokeWidth={4} strokeLinecap="round" />
        <circle cx={350} cy={170} r={10} fill={INK} />
        <T x={350} y={196} size={12.5} show={L}>
          Primary position
        </T>
        {pts.map(([x, y, dir, m]) => (
          <g key={dir}>
            <circle cx={x} cy={y} r={8} fill={LILAC} />
            <T x={x + (x < 350 ? -16 : 16)} y={y - 10} size={12} fill={MUTED} anchor={x < 350 ? 'end' : 'start'} weight={500}>
              {dir}
            </T>
            <T x={x + (x < 350 ? -16 : 16)} y={y + 10} size={14} anchor={x < 350 ? 'end' : 'start'} show={L}>
              {m}
            </T>
          </g>
        ))}
        <T x={350} y={330} size={11.5} fill={MUTED} weight={500} show={L}>
          LR lateral rectus · MR medial rectus · SR/IR superior/inferior rectus · SO/IO superior/inferior oblique
        </T>
      </g>
    )
  },
}

const amblyopiaTypes: DiagramDef = {
  viewBox: [720, 230],
  caption: 'Each type stops one or both eyes getting a clear, matching image while vision is developing.',
  render: () => {
    const panels: [string, JSX.Element][] = [
      ['Strabismic', <g key="s">{eyePair(0, 0, 14, 0)}</g>],
      [
        'Anisometropic',
        <g key="a">
          {eyePair(0, 0, 0, 0)}
          <circle cx={46} cy={0} r={24} fill={FIG.white} opacity={0.6} />
        </g>,
      ],
      [
        'Ametropic',
        <g key="m">
          {eyePair(0, 0, 0, 0)}
          <rect x={-90} y={-26} width={180} height={52} fill={FIG.white} opacity={0.55} />
        </g>,
      ],
      [
        'Deprivation',
        <g key="d">
          {eyePair(0, 0, 0, 0)}
          <circle cx={46} cy={0} r={13} fill={FIG.grey200} />
        </g>,
      ],
    ]
    const notes = ['One eye turned', 'One blurred image', 'Both images blurred', 'Cataract blocking one eye']
    return (
      <g>
        {panels.map(([title, eyes], i) => {
          const x = 10 + i * 178
          return (
            <Panel key={title} x={x} y={10} w={168} h={210} title={title}>
              <g transform={`translate(${x + 84} 110) scale(0.82)`}>{eyes}</g>
              <T x={x + 84} y={190} size={12} fill={MUTED} weight={500}>
                {notes[i]}
              </T>
            </Panel>
          )
        })}
      </g>
    )
  },
}

// ── Vision science ────────────────────────────────────────────────────

const receptiveFields: DiagramDef = {
  viewBox: [700, 330],
  caption: 'Lateral inhibition: at the grid’s crossings a cell’s surround gets more light than along the bars, so the crossings look darker.',
  render: (L) => {
    const field = (cx: number, on: boolean, title: string) => (
      <g key={title}>
        <circle cx={cx} cy={110} r={70} fill={on ? FIG.grey500 : FIG.grey100} stroke={INK} strokeWidth={1.4} />
        <circle cx={cx} cy={110} r={28} fill={on ? FIG.white : FIG.grey900c} stroke={INK} strokeWidth={1.4} />
        <T x={cx} y={110} size={22} fill={on ? INK : FIG.white}>
          {on ? '+' : '−'}
        </T>
        {[0, 1, 2, 3].map((k) => (
          <T key={k} x={cx + Math.cos((k * Math.PI) / 2 + 0.6) * 50} y={110 + Math.sin((k * Math.PI) / 2 + 0.6) * 50} size={18} fill={on ? FIG.white : INK}>
            {on ? '−' : '+'}
          </T>
        ))}
        <T x={cx} y={200} size={13.5} show={L}>
          {title}
        </T>
      </g>
    )
    return (
      <g>
        {field(110, true, 'ON-centre field')}
        {field(300, false, 'OFF-centre field')}
        <Callout x={110} y={110} tx={20} ty={250} text="Centre" show={L} />
        <Callout x={160} y={60} tx={180} ty={250} text="Surround" show={L} />
        <g transform="translate(440 30)">
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={(i % 4) * 58} y={Math.floor(i / 4) * 58} width={46} height={46} fill={INK} />
          ))}
          {[1, 2, 3].flatMap((a) => [1, 2, 3].map((b) => <circle key={`${a}${b}`} cx={a * 58 - 6} cy={b * 58 - 6} r={5} fill={FIG.grey500} opacity={0.55} />))}
        </g>
        <T x={555} y={276} size={13.5} show={L}>
          Hermann grid
        </T>
        <T x={555} y={296} size={12} fill={MUTED} show={L}>
          Grey spots at the intersections
        </T>
      </g>
    )
  },
}

const hillOfVision: DiagramDef = {
  viewBox: [720, 330],
  caption: 'Sensitivity peaks at fixation and falls towards the edge. Right eye shown: the blind spot sits about 15° temporal, just below the horizontal.',
  render: (L) => (
    <g>
      {/* island */}
      <path d="M30 250 C90 240 120 70 170 60 C196 64 204 92 210 112 L215 196 L220 120 C232 168 290 230 330 250 Z" fill={LILAC_SOFT} stroke={LILAC} strokeWidth={2} />
      <ellipse cx={180} cy={252} rx={152} ry={22} fill="none" stroke={LILAC} strokeDasharray="4 4" />
      <Callout x={170} y={60} tx={60} ty={30} text="Fixation (peak sensitivity)" show={L} anchor="start" />
      <Callout x={215} y={180} tx={290} ty={150} text="Blind spot (about 15° temporal)" show={L} max={18} />
      {/* flat field plot, right eye */}
      <g transform="translate(520 160)">
        <path d="M0 -60 Q75 -55 95 0 Q80 70 0 75 Q-55 70 -60 0 Q-55 -55 0 -60 Z" transform="scale(1.4)" fill={SKY_SOFT} stroke={SKY} strokeWidth={1.4} />
        <line x1={-100} y1={0} x2={150} y2={0} stroke={MUTED} strokeWidth={1} />
        <line x1={0} y1={-100} x2={0} y2={115} stroke={MUTED} strokeWidth={1} />
        <ellipse cx={21} cy={3} rx={6} ry={8} fill={INK} />
        <circle cx={0} cy={0} r={4} fill={ROSE} />
        <T x={0} y={-92} size={12} show={L}>
          Superior 60°
        </T>
        <T x={0} y={128} size={12} show={L}>
          Inferior 75°
        </T>
        <T x={-92} y={-12} size={12} show={L} anchor="middle">
          Nasal 60°
        </T>
        <T x={136} y={-12} size={12} show={L} anchor="middle">
          Temporal 95°
        </T>
        <T x={46} y={26} size={11} show={L} anchor="start">
          Blind spot
        </T>
      </g>
    </g>
  ),
}

const fieldLossTypes: DiagramDef = {
  viewBox: [720, 290],
  caption: 'Simulations only. Central loss hits detail (reading, faces); peripheral loss hits mobility (kerbs, steps, people coming from the side).',
  render: (L) => {
    const scene = (x: number) => (
      <g>
        <rect x={x} y={20} width={220} height={170} rx={10} fill={SKY_SOFT} />
        <path d={`M${x + 80} 190 L${x + 105} 110 L${x + 115} 110 L${x + 140} 190 Z`} fill={FIG.grey200} />
        <rect x={x + 18} y={70} width={44} height={70} fill={BUTTER} stroke={BUTTER_INK} />
        <rect x={x + 160} y={60} width={44} height={80} fill={ROSE_SOFT} stroke={ROSE} />
        <circle cx={x + 66} cy={150} r={8} fill={LILAC} />
        <rect x={x + 60} y={158} width={12} height={22} rx={4} fill={LILAC} />
        <rect x={x + 92} y={60} width={36} height={22} rx={3} fill={FIG.white} stroke={INK} />
        <text x={x + 110} y={75} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>
          BUS
        </text>
      </g>
    )
    return (
      <g>
        <defs>
          <radialGradient id="scotoma">
            <stop offset="0%" stopColor={FIG.grey900c} stopOpacity={0.92} />
            <stop offset="70%" stopColor={FIG.grey900c} stopOpacity={0.6} />
            <stop offset="100%" stopColor={FIG.grey900c} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="tunnel">
            <stop offset="0%" stopColor={FIG.grey900c} stopOpacity={0} />
            <stop offset="30%" stopColor={FIG.grey900c} stopOpacity={0} />
            <stop offset="45%" stopColor={FIG.grey900c} stopOpacity={0.95} />
          </radialGradient>
        </defs>
        {scene(10)}
        {scene(250)}
        <ellipse cx={360} cy={95} rx={55} ry={48} fill="url(#scotoma)" />
        {scene(490)}
        <rect x={490} y={20} width={220} height={170} rx={10} fill="url(#tunnel)" />
        <Lines x={120} y={230} text="Normal vision" max={30} size={13} weight={700} show={L} />
        <Lines x={360} y={236} text="Central loss (e.g. AMD): reading, faces" max={26} size={12.5} weight={600} show={L} />
        <Lines x={600} y={236} text="Peripheral loss (e.g. RP, glaucoma): mobility, trips" max={26} size={12.5} weight={600} show={L} />
        <T x={360} y={160} size={11.5} fill={FIG.white} show={L}>
          Scotoma
        </T>
        <T x={600} y={36} size={11.5} fill={FIG.white} show={L}>
          Only the centre is preserved
        </T>
      </g>
    )
  },
}

const topographyMap: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Warm colours are steeper. A symmetrical vertical bow tie is regular with-the-rule astigmatism; inferior steepening suggests keratoconus.',
  render: (L) => {
    const map = (cx: number, kc: boolean) => (
      <g>
        <defs>
          <radialGradient id={`hot${cx}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ROSE} />
            <stop offset="60%" stopColor={FIG.amber300} />
            <stop offset="100%" stopColor={FIG.amber300} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={140} r={110} fill={SKY_SOFT} />
        <circle cx={cx} cy={140} r={110} fill="none" stroke={SKY} strokeWidth={2} />
        <circle cx={cx} cy={140} r={70} fill={SAGE_SOFT} opacity={0.8} />
        {kc ? (
          <ellipse cx={cx + 10} cy={190} rx={46} ry={40} fill={`url(#hot${cx})`} />
        ) : (
          <g>
            <ellipse cx={cx} cy={95} rx={26} ry={44} fill={`url(#hot${cx})`} />
            <ellipse cx={cx} cy={185} rx={26} ry={44} fill={`url(#hot${cx})`} />
          </g>
        )}
      </g>
    )
    return (
      <g>
        {map(150, false)}
        {map(430, true)}
        <Lines x={150} y={278} text="Symmetrical bow tie (regular astigmatism)" max={26} size={12.5} weight={600} show={L} />
        <Lines x={430} y={278} text="Inferior steepening (keratoconus)" max={26} size={12.5} weight={600} show={L} />
        <defs>
          <linearGradient id="scale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ROSE} />
            <stop offset="35%" stopColor={FIG.amber300} />
            <stop offset="60%" stopColor={SAGE_SOFT} />
            <stop offset="100%" stopColor={SKY} />
          </linearGradient>
        </defs>
        <rect x={610} y={40} width={22} height={200} rx={4} fill="url(#scale)" />
        <T x={621} y={28} size={12} fill={ROSE} show={L}>
          Steep
        </T>
        <T x={621} y={256} size={12} fill={SKY} show={L}>
          Flat
        </T>
      </g>
    )
  },
}

export const OPTICS_DIAGRAMS: Record<string, DiagramDef> = {
  'thin-lens-vergence': thinLensVergence,
  'thick-lens-cardinal': thickLensCardinal,
  'snell-prism': snellPrism,
  'mirror-purkinje': mirrorPurkinje,
  'ametropia-far-point': ametropiaFarPoint,
  'sturm-conoid': sturmConoid,
  'prism-base': prismBase,
  jcc,
  focimeter,
  'rule-push-up': rulePushUp,
  npc,
  aniseikonia,
  'magnification-types': magnificationTypes,
  'volk-optics': volkOptics,
  'direct-oph-approach': directOphApproach,
  'myopia-control': myopiaControl,
  'horopter-disparity': horopterDisparity,
  'phoria-tropia': phoriaTropia,
  'cover-test': coverTest,
  'eom-h-pattern': eomHPattern,
  'amblyopia-types': amblyopiaTypes,
  'receptive-fields': receptiveFields,
  'hill-of-vision': hillOfVision,
  'field-loss-types': fieldLossTypes,
  'topography-map': topographyMap,
}

