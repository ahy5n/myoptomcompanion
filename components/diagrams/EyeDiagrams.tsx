// Anatomy and clinical-sign drawings: schematic, labelled, and kept to what
// the lesson text describes.

import type { JSX } from 'react'
import { Arrowheads, BUTTER, BUTTER_INK, type DiagramDef, INK, LILAC, LILAC_SOFT, MUTED, ROSE, ROSE_SOFT, SAGE, SAGE_SOFT, SKY, SKY_SOFT, T } from './kit'
import { Arrow, Callout, EyeFront, EyeSide, Lines, Panel, PathArrow, TBox } from './kit2'
import { FIG } from './palette'

const SCLERA = FIG.white
const IRIS = FIG.blue100
const VESSEL = FIG.red600c

/**
 * Anterior segment in cross-section, front to the left, centred on (cx, cy).
 * `bombe` bows the iris forward to close the angle.
 */
function AnteriorSegment({ cx, cy, s = 1, bombe = false }: { cx: number; cy: number; s?: number; bombe?: boolean }) {
  const X = (v: number) => cx + v * s
  const Y = (v: number) => cy + v * s
  const irisTop = bombe ? `M${X(6)} ${Y(-128)} Q${X(-34)} ${Y(-90)} ${X(4)} ${Y(-34)} L${X(14)} ${Y(-34)} Q${X(-18)} ${Y(-90)} ${X(18)} ${Y(-128)} Z` : `M${X(6)} ${Y(-128)} L${X(4)} ${Y(-34)} L${X(16)} ${Y(-34)} L${X(18)} ${Y(-128)} Z`
  const irisBot = bombe ? `M${X(6)} ${Y(128)} Q${X(-34)} ${Y(90)} ${X(4)} ${Y(34)} L${X(14)} ${Y(34)} Q${X(-18)} ${Y(90)} ${X(18)} ${Y(128)} Z` : `M${X(6)} ${Y(128)} L${X(4)} ${Y(34)} L${X(16)} ${Y(34)} L${X(18)} ${Y(128)} Z`
  return (
    <g>
      {/* sclera continuing back from the limbus */}
      <path d={`M${X(0)} ${Y(-150)} Q${X(80)} ${Y(-190)} ${X(200)} ${Y(-180)} L${X(200)} ${Y(-160)} Q${X(80)} ${Y(-168)} ${X(14)} ${Y(-136)} Z`} fill={SCLERA} stroke={INK} strokeWidth={1.4} />
      <path d={`M${X(0)} ${Y(150)} Q${X(80)} ${Y(190)} ${X(200)} ${Y(180)} L${X(200)} ${Y(160)} Q${X(80)} ${Y(168)} ${X(14)} ${Y(136)} Z`} fill={SCLERA} stroke={INK} strokeWidth={1.4} />
      {/* cornea */}
      <path d={`M${X(0)} ${Y(-150)} Q${X(-150)} ${Y(0)} ${X(0)} ${Y(150)} L${X(10)} ${Y(140)} Q${X(-130)} ${Y(0)} ${X(10)} ${Y(-140)} Z`} fill={SKY_SOFT} stroke={INK} strokeWidth={1.4} />
      {/* ciliary body */}
      <path d={`M${X(18)} ${Y(-136)} L${X(80)} ${Y(-160)} L${X(66)} ${Y(-112)} Z`} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1.2} />
      <path d={`M${X(18)} ${Y(136)} L${X(80)} ${Y(160)} L${X(66)} ${Y(112)} Z`} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1.2} />
      {/* iris */}
      <path d={irisTop} fill={IRIS} stroke={SKY} strokeWidth={1.2} />
      <path d={irisBot} fill={IRIS} stroke={SKY} strokeWidth={1.2} />
      {/* lens and zonules */}
      <ellipse cx={X(60)} cy={Y(0)} rx={34 * s} ry={96 * s} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.4} />
      <line x1={X(66)} y1={Y(-112)} x2={X(56)} y2={Y(-92)} stroke={MUTED} strokeWidth={1} />
      <line x1={X(66)} y1={Y(112)} x2={X(56)} y2={Y(92)} stroke={MUTED} strokeWidth={1} />
      {/* trabecular meshwork and Schlemm's canal at the angle */}
      <path d={`M${X(2)} ${Y(-140)} l${4 * s} ${8 * s}`} stroke={SAGE} strokeWidth={4 * s} strokeLinecap="round" />
      <ellipse cx={X(-2)} cy={Y(-150)} rx={4 * s} ry={3 * s} fill={SAGE} />
      <path d={`M${X(2)} ${Y(140)} l${4 * s} ${-8 * s}`} stroke={SAGE} strokeWidth={4 * s} strokeLinecap="round" />
      <ellipse cx={X(-2)} cy={Y(150)} rx={4 * s} ry={3 * s} fill={SAGE} />
    </g>
  )
}

// ── Anatomy ───────────────────────────────────────────────────────────

const aqueousFlow: DiagramDef = {
  viewBox: [700, 420],
  caption: 'Most aqueous leaves through the trabecular meshwork into Schlemm’s canal (conventional route); a smaller share passes through the ciliary muscle (uveoscleral).',
  render: (L) => (
    <g>
      <Arrowheads />
      <AnteriorSegment cx={300} cy={210} />
      <PathArrow d="M356 100 C336 124 328 156 322 196" colour={SKY} id="ah-sky" width={2.2} />
      <PathArrow d="M308 206 C262 196 246 130 294 80" colour={SKY} id="ah-sky" width={2.2} />
      <PathArrow d="M318 82 C338 70 358 62 392 52" colour={SAGE} id="ah-sage" width={1.8} dash="4 3" />
      <Callout x={350} y={70} tx={430} ty={60} text="Ciliary body (pars plicata) makes aqueous" show={L} max={22} />
      <Callout x={336} y={140} tx={470} ty={110} text="Posterior chamber" show={L} />
      <Callout x={310} y={190} tx={470} ty={210} text="Pupil" show={L} />
      <Callout x={250} y={210} tx={20} ty={260} text="Anterior chamber" show={L} anchor="start" />
      <Callout x={304} y={74} tx={170} ty={30} text="Trabecular meshwork" show={L} anchor="end" />
      <Callout x={298} y={60} tx={170} ty={60} text="Schlemm’s canal" show={L} anchor="end" />
      <Callout x={380} y={60} tx={470} ty={16} text="Uveoscleral outflow" show={L} />
    </g>
  ),
}

const anteriorEyeLayers: DiagramDef = {
  viewBox: [700, 420],
  caption: 'Front to back: lids and tear film, conjunctiva and cornea meeting at the limbus, the anterior chamber, iris and lens.',
  render: (L) => (
    <g>
      <AnteriorSegment cx={330} cy={210} />
      {/* eyelids */}
      <path d="M180 40 Q130 70 150 120 L190 120 Q196 80 232 56 Z" fill={BUTTER} stroke={BUTTER_INK} strokeWidth={1.2} />
      <path d="M180 380 Q130 350 150 300 L190 300 Q196 340 232 364 Z" fill={BUTTER} stroke={BUTTER_INK} strokeWidth={1.2} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={160 + i * 8} y1={70 + i * 4} x2={170 + i * 8} y2={112} stroke={BUTTER_INK} strokeWidth={2} />
      ))}
      <path d="M232 56 Q300 40 330 60" fill="none" stroke={ROSE} strokeWidth={2} />
      <Callout x={170} y={90} tx={40} ty={60} text="Eyelid and meibomian glands" show={L} max={16} />
      <Callout x={300} y={46} tx={430} ty={24} text="Conjunctiva" show={L} />
      <Callout x={330} y={60} tx={470} ty={60} text="Limbus" show={L} />
      <Callout x={210} y={210} tx={40} ty={210} text="Cornea" show={L} />
      <Callout x={290} y={260} tx={40} ty={330} text="Anterior chamber" show={L} />
      <Callout x={340} y={300} tx={470} ty={330} text="Iris" show={L} />
      <Callout x={390} y={210} tx={470} ty={210} text="Lens" show={L} />
    </g>
  ),
}

const corneaLayers: DiagramDef = {
  viewBox: [700, 380],
  caption: 'The stroma is about 90% of corneal thickness. The endothelium pumps fluid out of the stroma to keep it clear; it can’t regenerate.',
  render: (L) => {
    const x = 60
    const w = 420
    return (
      <g>
        <Arrowheads />
        <rect x={x} y={20} width={w} height={12} fill={SKY_SOFT} />
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 14 }, (_, c) => (
            <rect key={`${r}-${c}`} x={x + c * 30 + (r % 2) * 15} y={34 + r * 10} width={28} height={9} rx={3} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={0.6} />
          )),
        )}
        <rect x={x} y={86} width={w} height={8} fill={BUTTER} />
        <rect x={x} y={96} width={w} height={170} fill={FIG.grey50c} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={x} y1={104 + i * 14} x2={x + w} y2={104 + i * 14} stroke={FIG.grey200} strokeWidth={1.2} />
        ))}
        <rect x={x} y={266} width={w} height={5} fill={SAGE} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${x + 4 + i * 35} 280 l8 -7 h18 l8 7 l-8 7 h-18 Z`} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1} />
        ))}
        <rect x={x} y={292} width={w} height={60} fill={SKY_SOFT} opacity={0.5} />
        {[120, 260, 400].map((ax) => (
          <Arrow key={ax} x1={ax} y1={240} x2={ax} y2={318} colour={ROSE} id="ah-rose" width={2} />
        ))}
        {(
          [
            [26, 'Tear film'],
            [58, 'Epithelium'],
            [90, 'Bowman’s layer'],
            [180, 'Stroma'],
            [268, 'Descemet’s membrane'],
            [281, 'Endothelium (single layer of hexagonal cells)'],
            [330, 'Aqueous humour'],
          ] as const
        ).map(([y, l], i) => (
          <g key={l}>
            <line x1={x + w + 6} y1={y} x2={x + w + 24} y2={y + (i === 4 ? -6 : i === 5 ? 6 : 0)} stroke={MUTED} />
            <Lines x={x + w + 30} y={y + (i === 4 ? -6 : i === 5 ? 8 : 0)} text={l} max={26} size={12.5} weight={600} anchor="start" show={L} />
          </g>
        ))}
        <T x={230} y={340} size={12} fill={ROSE} show={L}>
          Endothelial pump: fluid out of the stroma
        </T>
      </g>
    )
  },
}

const lensStructure: DiagramDef = {
  viewBox: [700, 380],
  caption: 'New fibres are laid down at the equator throughout life, so the oldest fibres sit in the nucleus.',
  render: (L) => (
    <g>
      <ellipse cx={330} cy={190} rx={110} ry={150} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={3} />
      {[90, 70, 50].map((rx, i) => (
        <ellipse key={rx} cx={330} cy={190} rx={rx} ry={rx * 1.36} fill="none" stroke={LILAC} strokeWidth={1} opacity={0.6 + i * 0.1} />
      ))}
      <ellipse cx={330} cy={190} rx={40} ry={56} fill={BUTTER} stroke={BUTTER_INK} />
      {/* epithelium on the front surface only */}
      <path d="M262 72 Q218 190 262 308" fill="none" stroke={SAGE} strokeWidth={5} />
      {/* zonules to ciliary body */}
      {[-1, 1].map((d) => (
        <g key={d}>
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={318 + k * 8} y1={190 + d * 148} x2={310 + k * 18} y2={190 + d * 186} stroke={MUTED} />
          ))}
          <path d={`M290 ${190 + d * 184} L380 ${190 + d * 176} L360 ${190 + d * 156} Z`} fill={ROSE_SOFT} stroke={ROSE} />
        </g>
      ))}
      <Callout x={436} y={160} tx={500} ty={110} text="Capsule (all round)" show={L} />
      <Callout x={242} y={190} tx={20} ty={270} text="Anterior epithelium (front only)" show={L} anchor="start" max={16} />
      <Callout x={390} y={240} tx={500} ty={250} text="Cortex" show={L} />
      <Callout x={330} y={190} tx={500} ty={190} text="Nucleus" show={L} />
      <Callout x={330} y={40} tx={180} ty={50} text="Equator" show={L} anchor="end" />
      <Callout x={340} y={352} tx={500} ty={320} text="Zonules" show={L} />
      <Callout x={360} y={22} tx={500} ty={30} text="Ciliary body" show={L} />
    </g>
  ),
}

const retinaLayers: DiagramDef = {
  viewBox: [700, 440],
  caption: 'Light passes through the inner layers to reach the photoreceptors at the back; signals then travel forwards to the ganglion cells.',
  render: (L) => {
    const layers: [string, number, string][] = [
      ['Internal limiting membrane', 6, LILAC],
      ['Nerve fibre layer', 26, FIG.grey50c],
      ['Ganglion cell layer', 32, SKY_SOFT],
      ['Inner plexiform layer', 24, FIG.grey50],
      ['Inner nuclear layer (bipolar cells)', 34, SAGE_SOFT],
      ['Outer plexiform layer', 20, FIG.grey50],
      ['Outer nuclear layer', 34, BUTTER],
      ['External limiting membrane', 6, MUTED],
      ['Rods and cones', 62, LILAC_SOFT],
      ['Retinal pigment epithelium', 22, FIG.orange600],
    ]
    let y = 50
    const rows = layers.map(([name, h, fill]) => {
      const r = { name, y, h, fill }
      y += h
      return r
    })
    return (
      <g>
        <Arrowheads />
        <Arrow x1={240} y1={4} x2={240} y2={44} colour={BUTTER_INK} width={2.4} />
        <T x={252} y={22} size={12} fill={BUTTER_INK} anchor="start">
          Light (from the vitreous)
        </T>
        {rows.map((r) => (
          <rect key={r.name} x={60} y={r.y} width={360} height={r.h} fill={r.fill} />
        ))}
        {/* cells */}
        {[110, 230, 350].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={rows[2].y + 16} r={10} fill={SKY} />
            <path d={`M${cx} ${rows[2].y + 6} V${rows[1].y + 14} H${cx + 50}`} fill="none" stroke={SKY} strokeWidth={2} />
            <ellipse cx={cx} cy={rows[4].y + 17} rx={7} ry={10} fill={SAGE} />
            <line x1={cx} y1={rows[2].y + 26} x2={cx} y2={rows[4].y + 7} stroke={SAGE} strokeWidth={1.6} />
            <line x1={cx} y1={rows[4].y + 27} x2={cx} y2={rows[6].y + 8} stroke={SAGE} strokeWidth={1.6} />
            <circle cx={cx - 14} cy={rows[6].y + 17} r={6} fill={BUTTER_INK} />
            <circle cx={cx + 14} cy={rows[6].y + 17} r={6} fill={BUTTER_INK} />
            {/* rod and cone */}
            <rect x={cx - 18} y={rows[8].y + 4} width={8} height={54} rx={3} fill={LILAC} />
            <path d={`M${cx + 6} ${rows[8].y + 4} h12 l-6 54 Z`} fill={ROSE} />
          </g>
        ))}
        {rows.map((r, i) => (
          <g key={`l${r.name}`}>
            <line x1={424} y1={r.y + r.h / 2} x2={440} y2={r.y + r.h / 2} stroke={MUTED} />
            <text x={446} y={r.y + r.h / 2} dominantBaseline="middle" fontSize={12} fontWeight={i % 2 ? 500 : 650} fill={INK} opacity={L ? 1 : 0}>
              {r.name}
            </text>
          </g>
        ))}
      </g>
    )
  },
}

const lacrimalDrainage: DiagramDef = {
  viewBox: [700, 400],
  caption: 'Right eye, as you face the patient: tears are made upper-outer and drain at the inner corner into the nose.',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeFront cx={300} cy={170} w={300} iris={50} pupil={22} />
      {/* gland upper outer = viewer's left for the patient's right eye */}
      <ellipse cx={170} cy={70} rx={56} ry={26} fill={SKY_SOFT} stroke={SKY} strokeWidth={1.6} transform="rotate(-18 170 70)" />
      <PathArrow d="M200 100 C260 160 360 150 430 160" colour={SKY} id="ah-sky" width={2} dash="5 4" />
      <circle cx={438} cy={150} r={5} fill={ROSE} />
      <circle cx={438} cy={190} r={5} fill={ROSE} />
      <path d="M438 150 C470 150 480 160 490 168 M438 190 C470 190 480 180 490 172" fill="none" stroke={ROSE} strokeWidth={4} />
      <rect x={484} y={150} width={30} height={60} rx={14} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1.6} />
      <path d="M499 210 C499 260 506 300 512 340" fill="none" stroke={ROSE} strokeWidth={8} strokeLinecap="round" />
      <PathArrow d="M520 220 C524 270 528 310 534 350" colour={ROSE} id="ah-rose" width={1.6} />
      <Callout x={150} y={60} tx={40} ty={30} text="Lacrimal gland" show={L} anchor="start" />
      <Callout x={438} y={150} tx={420} ty={60} text="Upper and lower puncta" show={L} anchor="middle" />
      <Callout x={470} y={160} tx={600} ty={110} text="Canaliculi" show={L} />
      <Callout x={500} y={180} tx={600} ty={180} text="Lacrimal sac" show={L} />
      <Callout x={505} y={270} tx={590} ty={260} text="Nasolacrimal duct" show={L} max={12} />
      <Callout x={512} y={340} tx={600} ty={350} text="Inferior meatus (nose)" show={L} />
    </g>
  ),
}

const visualPathway: DiagramDef = {
  viewBox: [720, 470],
  caption: 'Lesions shown on the right side of the pathway. Fields are drawn as each eye sees them (left eye’s field on the left); black = lost.',
  render: (L) => {
    const field = (x: number, y: number, kind: string) => {
      const r = 15
      const pair = [x - 19, x + 19]
      const lost = (side: 'l' | 'r', eye: 0 | 1): JSX.Element | null => {
        const cx = pair[eye]
        const half = (s: 'l' | 'r', top?: 'up' | 'down') => {
          const sweep = s === 'l' ? 0 : 1
          if (!top) return `M${cx} ${y - r} A${r} ${r} 0 0 ${sweep} ${cx} ${y + r} Z`
          const ty = top === 'up' ? y - r : y + r
          const ex = s === 'l' ? cx - r : cx + r
          const sw = (s === 'l') === (top === 'up') ? 0 : 1
          return `M${cx} ${y} L${cx} ${ty} A${r} ${r} 0 0 ${sw} ${ex} ${y} Z`
        }
        if (kind === 'nerve') return eye === 1 ? <circle cx={cx} cy={y} r={r} fill={INK} /> : null
        if (kind === 'chiasm') return <path d={half(eye === 0 ? 'l' : 'r')} fill={INK} />
        if (kind === 'tract' || kind === 'occipital') return <path d={half('l')} fill={INK} />
        if (kind === 'meyer') return <path d={half('l', 'up')} fill={INK} />
        if (kind === 'parietal') return <path d={half('l', 'down')} fill={INK} />
        void side
        return null
      }
      return (
        <g>
          {pair.map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy={y} r={r} fill={FIG.white} stroke={INK} strokeWidth={1.2} />
              {lost('l', i as 0 | 1)}
              {kind === 'occipital' && <circle cx={cx} cy={y} r={4} fill={FIG.white} />}
            </g>
          ))}
        </g>
      )
    }
    // Pathway drawn from above: eyes at the top, cortex at the bottom.
    const lesions: [number, number, string, string][] = [
      [450, 108, 'nerve', '1 Optic nerve: blind right eye'],
      [360, 168, 'chiasm', '2 Chiasm: bitemporal hemianopia'],
      [404, 226, 'tract', '3 Optic tract: left homonymous hemianopia'],
      [470, 300, 'meyer', '4 Meyer’s loop: left superior quadrantanopia'],
      [414, 330, 'parietal', '5 Parietal radiations: left inferior quadrantanopia'],
      [392, 420, 'occipital', '6 Occipital cortex: left hemianopia, macular sparing'],
    ]
    return (
      <g>
        <circle cx={270} cy={50} r={34} fill={FIG.white} stroke={INK} strokeWidth={1.6} />
        <circle cx={450} cy={50} r={34} fill={FIG.white} stroke={INK} strokeWidth={1.6} />
        <T x={270} y={50} size={12} weight={600}>
          Left eye
        </T>
        <T x={450} y={50} size={12} weight={600}>
          Right eye
        </T>
        {/* temporal (uncrossed) and nasal (crossing) fibres */}
        <path d="M250 82 L330 168 L320 230 L300 280 Q260 330 300 420" fill="none" stroke={SKY} strokeWidth={3} />
        <path d="M470 82 L390 168 L400 230 L420 280 Q460 330 420 420" fill="none" stroke={ROSE} strokeWidth={3} />
        <path d="M290 82 L390 168" fill="none" stroke={SKY} strokeWidth={3} strokeDasharray="6 3" />
        <path d="M430 82 L330 168" fill="none" stroke={ROSE} strokeWidth={3} strokeDasharray="6 3" />
        <path d="M420 280 Q500 300 470 330" fill="none" stroke={ROSE} strokeWidth={3} />
        <ellipse cx={330} cy={250} rx={14} ry={10} fill={BUTTER} stroke={BUTTER_INK} />
        <ellipse cx={390} cy={250} rx={14} ry={10} fill={BUTTER} stroke={BUTTER_INK} />
        <rect x={270} y={410} width={180} height={30} rx={10} fill={LILAC_SOFT} stroke={LILAC} />
        {lesions.map(([x, y, kind, label]) => (
          <g key={kind}>
            <circle cx={x} cy={y} r={10} fill={ROSE} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill={FIG.white}>
              {label[0]}
            </text>
          </g>
        ))}
        {lesions.map(([, , kind, label], i) => (
          <g key={`f${kind}`} transform={`translate(0 ${i * 70})`}>
            {field(560, 40, kind)}
            <Lines x={600} y={40} text={label.slice(2)} max={18} size={11} weight={600} anchor="start" show={L} />
          </g>
        ))}
        <Callout x={330} y={168} tx={150} ty={150} text="Optic chiasm (nasal fibres cross)" show={L} anchor="end" max={18} />
        <Callout x={318} y={210} tx={150} ty={210} text="Optic tract" show={L} anchor="end" />
        <Callout x={330} y={250} tx={150} ty={262} text="Lateral geniculate nucleus" show={L} anchor="end" max={16} />
        <Callout x={292} y={320} tx={150} ty={330} text="Optic radiations (Meyer’s loop curves into the temporal lobe)" show={L} anchor="end" max={20} />
        <Callout x={300} y={425} tx={150} ty={420} text="Primary visual cortex (V1)" show={L} anchor="end" max={16} />
        <Callout x={262} y={100} tx={150} ty={90} text="Optic nerve" show={L} anchor="end" />
      </g>
    )
  },
}

const ocularBloodSupply: DiagramDef = {
  viewBox: [720, 380],
  caption: 'Simplified. The retina’s inner layers rely on the central retinal artery; the outer retina and optic nerve head rely on the choroid (posterior ciliary arteries).',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeSide cx={250} cy={180} r={110} lens={false} />
      <path d="M150 260 Q250 310 340 250" fill="none" stroke={ROSE_SOFT} strokeWidth={14} opacity={0.7} />
      {/* ICA → ophthalmic */}
      <path d="M680 340 C640 300 620 260 580 230" fill="none" stroke={VESSEL} strokeWidth={9} strokeLinecap="round" />
      <path d="M580 230 C520 200 460 196 400 196" fill="none" stroke={VESSEL} strokeWidth={6} />
      {/* CRA into the nerve */}
      <path d="M430 196 C420 186 400 182 330 182" fill="none" stroke={VESSEL} strokeWidth={3} />
      {/* short PCAs around the nerve */}
      {[-14, 14].map((d) => (
        <path key={d} d={`M420 ${196 + d * 0.3} C390 ${196 + d * 3} 370 ${196 + d * 3} 350 ${190 + d * 3.5}`} fill="none" stroke={VESSEL} strokeWidth={2} />
      ))}
      {/* long PCAs forward to the ciliary body */}
      <path d="M440 196 C400 120 300 72 170 100" fill="none" stroke={VESSEL} strokeWidth={2.2} />
      {/* muscular → anterior ciliary */}
      <path d="M520 202 C460 270 300 300 170 262" fill="none" stroke={VESSEL} strokeWidth={2.2} strokeDasharray="7 3" />
      {/* vortex vein and CRV */}
      <path d="M280 72 C300 40 320 30 350 24" fill="none" stroke={SKY} strokeWidth={3} />
      <path d="M330 176 C400 170 460 172 520 166" fill="none" stroke={SKY} strokeWidth={2.4} />
      <Callout x={660} y={322} tx={600} ty={364} text="Internal carotid artery" show={L} anchor="end" />
      <Callout x={520} y={204} tx={540} ty={280} text="Ophthalmic artery" show={L} />
      <Callout x={380} y={182} tx={420} ty={130} text="Central retinal artery (enters the optic nerve)" show={L} max={24} />
      <Callout x={360} y={210} tx={420} ty={258} text="Short posterior ciliary arteries" show={L} max={20} />
      <Callout x={300} y={84} tx={430} ty={70} text="Long posterior ciliary arteries" show={L} max={20} />
      <Callout x={200} y={278} tx={40} ty={340} text="Anterior ciliary arteries (from muscular branches)" show={L} max={26} />
      <Callout x={330} y={28} tx={420} ty={20} text="Vortex veins (drain the choroid)" show={L} />
      <Callout x={500} y={167} tx={600} ty={96} text="Central retinal vein" show={L} max={12} />
    </g>
  ),
}

const opticSection: DiagramDef = {
  viewBox: [720, 360],
  caption: 'A narrow, focused beam at 45–60° cuts an optical slice through the cornea, showing depth: tear film and epithelium at the front, stroma, then endothelium.',
  render: (L) => (
    <g>
      <Arrowheads />
      {/* top view */}
      <circle cx={150} cy={90} r={40} fill={FIG.white} stroke={INK} strokeWidth={1.6} />
      <T x={150} y={90} size={11.5} weight={600}>
        Eye
      </T>
      <path d="M150 130 V222" stroke={MUTED} strokeDasharray="5 4" />
      <rect x={130} y={226} width={40} height={84} rx={10} fill={FIG.grey100} stroke={INK} />
      <g transform="rotate(-50 150 130)">
        <rect x={130} y={214} width={40} height={84} rx={10} fill={BUTTER} stroke={BUTTER_INK} />
      </g>
      <PathArrow d="M256 214 L166 136" colour={BUTTER_INK} width={3} />
      <T x={150} y={330} size={12.5} show={L}>
        Microscope
      </T>
      <Lines x={262} y={268} text="Illumination arm (45–60°)" max={16} size={12.5} weight={600} anchor="start" show={L} />
      {/* inset: the optic section itself */}
      <rect x={360} y={20} width={190} height={320} rx={14} fill={FIG.grey900c} />
      <path d="M420 50 Q390 180 420 310" fill="none" stroke={FIG.white} strokeWidth={4} />
      <path d="M432 50 Q404 180 432 310 L448 310 Q420 180 448 50 Z" fill={FIG.grey200} opacity={0.75} />
      <path d="M448 50 Q420 180 448 310" fill="none" stroke={FIG.white} strokeWidth={2} opacity={0.9} />
      <path d="M520 60 Q490 180 520 300" fill="none" stroke={IRIS} strokeWidth={10} opacity={0.8} />
      <Callout x={412} y={110} tx={570} ty={50} text="Tear film / epithelium (bright front edge)" show={L} max={18} />
      <Callout x={430} y={180} tx={570} ty={120} text="Stroma (grey, granular)" show={L} max={18} />
      <Callout x={442} y={250} tx={570} ty={190} text="Endothelium (back edge)" show={L} max={18} />
      <Callout x={480} y={200} tx={570} ty={250} text="Anterior chamber (dark)" show={L} max={18} />
      <Callout x={512} y={290} tx={570} ty={310} text="Iris" show={L} />
      <T x={455} y={330} size={12} fill={FIG.white} weight={700}>
        Optic section
      </T>
    </g>
  ),
}

// ── Lids and contact lenses ───────────────────────────────────────────

const lidEversion: DiagramDef = {
  viewBox: [720, 260],
  caption: 'Ask the patient to keep looking down throughout; roll the lid over the bud, then hold it against the brow.',
  render: () => {
    const lid = (x: number, step: number) => (
      <g>
        <circle cx={x + 120} cy={150} r={50} fill={FIG.white} stroke={INK} strokeWidth={1.4} />
        {step === 1 && (
          <g>
            <path d={`M${x + 70} 110 Q${x + 120} 80 ${x + 150} 150`} fill="none" stroke={BUTTER_INK} strokeWidth={10} strokeLinecap="round" />
            <line x1={x + 92} y1={84} x2={x + 150} y2={84} stroke={SAGE} strokeWidth={6} strokeLinecap="round" />
            <circle cx={x + 152} cy={84} r={6} fill={SAGE_SOFT} stroke={SAGE} />
          </g>
        )}
        {step === 2 && (
          <g>
            <path d={`M${x + 70} 110 Q${x + 100} 60 ${x + 140} 80`} fill="none" stroke={BUTTER_INK} strokeWidth={10} strokeLinecap="round" />
            <line x1={x + 92} y1={96} x2={x + 150} y2={96} stroke={SAGE} strokeWidth={6} strokeLinecap="round" />
          </g>
        )}
        {step === 3 && (
          <g>
            <path d={`M${x + 70} 110 Q${x + 90} 50 ${x + 120} 60`} fill="none" stroke={BUTTER_INK} strokeWidth={10} strokeLinecap="round" />
            <path d={`M${x + 104} 66 Q${x + 120} 80 ${x + 136} 70`} fill="none" stroke={ROSE} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
        <path d={`M${x + 120} 190 l0 22`} stroke={MUTED} markerEnd="url(#ah)" />
      </g>
    )
    const steps = ['1. Patient looks down; hold the lashes; bud at the upper border of the tarsal plate', '2. Fold the lid up over the bud', '3. Hold the everted lid against the brow: tarsal conjunctiva on view']
    return (
      <g>
        <Arrowheads />
        {steps.map((s, i) => (
          <Panel key={s} x={10 + i * 236} y={10} w={226} h={240}>
            {lid(10 + i * 236 - 10, i + 1)}
            <Lines x={10 + i * 236 + 113} y={36} text={s} max={30} size={11.5} weight={600} />
          </Panel>
        ))}
      </g>
    )
  },
}

const lidMargin: DiagramDef = {
  viewBox: [720, 300],
  caption: 'Anterior blepharitis lives at the lashes; MGD lives at the gland orifices behind the grey line.',
  render: (L) => (
    <g>
      <rect x={30} y={110} width={660} height={90} rx={30} fill={ROSE_SOFT} />
      <rect x={30} y={200} width={660} height={70} fill={BUTTER} opacity={0.5} />
      {/* lashes at the front edge */}
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i}>
          <path d={`M${60 + i * 40} 196 Q${66 + i * 40} 240 ${80 + i * 40} 278`} fill="none" stroke={INK} strokeWidth={2.2} />
          {i % 3 === 0 && <ellipse cx={62 + i * 40} cy={204} rx={7} ry={4} fill={FIG.amber50} stroke={BUTTER_INK} />}
        </g>
      ))}
      <line x1={40} y1={168} x2={680} y2={168} stroke={FIG.grey500} strokeWidth={2} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={70 + i * 44} cy={140} r={5} fill={i % 3 === 1 ? FIG.amber300 : FIG.white} stroke={BUTTER_INK} strokeWidth={1.2} />
      ))}
      <path d="M378 140 q8 -22 22 -26" fill="none" stroke={FIG.amber300} strokeWidth={7} strokeLinecap="round" />
      {[100, 300, 520].map((x) => (
        <path key={x} d={`M${x} 182 q20 -8 40 0 q20 8 40 -2`} fill="none" stroke={VESSEL} strokeWidth={1.4} />
      ))}
      <Callout x={62} y={204} tx={40} ty={292} text="Lashes with collarettes" show={L} anchor="start" />
      <Callout x={300} y={168} tx={300} ty={90} text="Grey line" show={L} anchor="middle" />
      <Callout x={114} y={140} tx={40} ty={40} text="Capped meibomian gland orifices" show={L} anchor="start" />
      <Callout x={398} y={116} tx={460} ty={40} text="Thick secretion on expression" show={L} />
      <Callout x={540} y={182} tx={600} ty={292} text="Telangiectasia" show={L} anchor="end" />
    </g>
  ),
}

const softFit: DiagramDef = {
  viewBox: [720, 270],
  caption: 'A good fit centres, covers the cornea with even overlap, and moves about 0.2–0.4 mm on blink.',
  render: (L) => {
    const eye = (x: number, kind: 'good' | 'tight' | 'loose', title: string) => {
      const cx = x + 110
      const lensCx = kind === 'loose' ? cx + 12 : cx
      const lensCy = kind === 'loose' ? 128 + 12 : 128
      return (
        <Panel x={x} y={10} w={220} h={250} title={title}>
          <path d={`M${x + 20} 128 Q${cx} 40 ${x + 200} 128 Q${cx} 216 ${x + 20} 128 Z`} fill={FIG.white} stroke={INK} strokeWidth={1.4} />
          <circle cx={cx} cy={128} r={46} fill={IRIS} stroke={SKY} />
          <circle cx={cx} cy={128} r={16} fill={INK} />
          <circle cx={lensCx} cy={lensCy} r={58} fill="none" stroke={kind === 'tight' ? ROSE : SAGE} strokeWidth={2.4} strokeDasharray={kind === 'loose' ? '6 4' : undefined} />
          {kind === 'tight' && [0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2
            return <line key={k} x1={cx + Math.cos(a) * 50} y1={128 + Math.sin(a) * 50} x2={cx + Math.cos(a) * 68} y2={128 + Math.sin(a) * 68} stroke={VESSEL} strokeWidth={1.6} />
          })}
          <Lines x={x + 110} y={226} text={kind === 'good' ? 'Centred, even overlap past the limbus' : kind === 'tight' ? 'Edge indents the conjunctiva; little or no movement' : 'Decentred; edge rides onto the cornea on upgaze'} max={28} size={11.5} weight={600} show={L} />
        </Panel>
      )
    }
    return (
      <g>
        {eye(10, 'good', 'Good fit')}
        {eye(250, 'tight', 'Tight')}
        {eye(490, 'loose', 'Loose')}
      </g>
    )
  },
}

const insideOutLens: DiagramDef = {
  viewBox: [720, 250],
  caption: 'A correct lens is a neat bowl; inside out, the edge flares like a saucer rim.',
  render: (L) => (
    <g>
      {(
        [
          [20, 'Correct: bowl shape', 'M60 120 Q140 200 220 120', SAGE],
          [250, 'Inside out: edges flare', 'M290 110 Q300 124 316 128 Q370 190 424 128 Q440 124 450 110', ROSE],
        ] as const
      ).map(([x, title, d, c]) => (
        <Panel key={title} x={x} y={10} w={220} h={230} title={title}>
          <path d={d} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" transform={`translate(${x === 20 ? 0 : -40} 10)`} />
          <ellipse cx={x + 110} cy={190} rx={22} ry={30} fill={BUTTER} stroke={BUTTER_INK} />
        </Panel>
      ))}
      <Panel x={480} y={10} w={230} h={230} title="Taco test">
        <path d="M530 160 Q595 70 660 160" fill="none" stroke={SAGE} strokeWidth={4} />
        <path d="M545 150 Q595 112 645 150" fill="none" stroke={SAGE} strokeWidth={2} opacity={0.6} />
        <circle cx={524} cy={168} r={14} fill={BUTTER} stroke={BUTTER_INK} />
        <circle cx={666} cy={168} r={14} fill={BUTTER} stroke={BUTTER_INK} />
        <Lines x={595} y={210} text="Pinch gently: edges curl in when it’s the right way out" max={30} size={11.5} weight={600} show={L} />
      </Panel>
    </g>
  ),
}

const infiltrateComparison: DiagramDef = {
  viewBox: [720, 290],
  caption: 'Size, position, staining and AC reaction separate a sight-threatening ulcer from sterile infiltrates. If in doubt, treat as MK and refer same day.',
  render: (L) => {
    const cornea = (x: number, title: string, body: JSX.Element, note: string, red = false) => (
      <Panel x={x} y={10} w={226} h={270} title={title}>
        <circle cx={x + 113} cy={130} r={86} fill={red ? ROSE_SOFT : FIG.white} stroke={INK} strokeWidth={1.4} />
        <circle cx={x + 113} cy={130} r={64} fill={FIG.white} stroke={FIG.grey100c} />
        {body}
        <Lines x={x + 113} y={246} text={note} max={30} size={11.5} weight={600} show={L} />
      </Panel>
    )
    return (
      <g>
        {cornea(
          10,
          'MK (microbial keratitis)',
          <g>
            <ellipse cx={136} cy={120} rx={24} ry={20} fill={FIG.grey200} />
            <ellipse cx={136} cy={120} rx={14} ry={11} fill={SAGE} opacity={0.65} />
            <path d="M78 186 Q123 206 168 186 L168 192 Q123 210 78 192 Z" fill={FIG.amber50} stroke={BUTTER_INK} />
          </g>,
          'Large, central or paracentral; epithelial defect stains; AC reaction (hypopyon)',
        )}
        {cornea(
          246,
          'CLPU',
          <g>
            <circle cx={410} cy={70} r={9} fill={FIG.grey200} />
            <circle cx={410} cy={70} r={4} fill={SAGE} opacity={0.65} />
          </g>,
          'Small, round, peripheral; small stained defect',
        )}
        {cornea(
          482,
          'CLARE',
          <g>
            {[
              [540, 80],
              [560, 66],
              [652, 100],
              [662, 150],
              [544, 180],
              [640, 196],
            ].map(([cx, cy]) => (
              <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={4.5} fill={FIG.grey200} />
            ))}
          </g>,
          'Diffuse small peripheral infiltrates; red eye; no defect',
          true,
        )}
      </g>
    )
  },
}

const gradingStrip: DiagramDef = {
  viewBox: [720, 230],
  caption: 'Grade against a printed scale (e.g. Efron or CCLRU) and use half grades. A change of one grade or more matters; grades 3–4 need action.',
  render: () => {
    const words = ['normal', 'trace', 'mild', 'moderate', 'severe']
    return (
      <g>
        {words.map((w, g) => {
          const x = 14 + g * 140
          return (
            <g key={w}>
              <rect x={x} y={20} width={128} height={110} rx={12} fill={g === 0 ? FIG.white : FIG.orange100} stroke={FIG.grey100c} />
              <rect x={x} y={20} width={128} height={110} rx={12} fill={ROSE} opacity={g * 0.06} />
              {Array.from({ length: 3 + g * 4 }, (_, k) => (
                <path key={k} d={`M${x + 8 + ((k * 37) % 76)} ${30 + ((k * 23) % 90)} q16 ${6 + (k % 3) * 4} 32 ${-2 - (k % 4) * 3}`} fill="none" stroke={VESSEL} strokeWidth={0.8 + g * 0.35} opacity={0.5 + g * 0.1} />
              ))}
              <T x={x + 64} y={152} size={16}>
                {g}
              </T>
              <T x={x + 64} y={172} size={12.5} weight={500}>
                {w}
              </T>
            </g>
          )
        })}
        <path d="M434 190 V204 H682 V190" fill="none" stroke={ROSE} strokeWidth={2} />
        <T x={558} y={220} size={13} fill={ROSE}>
          Action
        </T>
      </g>
    )
  },
}

// ── Fundus and posterior eye ──────────────────────────────────────────

function Fundus({ cx, cy, r, children }: { cx: number; cy: number; r: number; children?: React.ReactNode }) {
  const dx = cx + r * 0.42
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={FIG.orange100} stroke={FIG.orange600} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={r} fill={ROSE} opacity={0.08} />
      {/* disc to the right (right eye) and vessels arcing out */}
      <circle cx={dx} cy={cy} r={r * 0.13} fill={FIG.amber50} stroke={BUTTER_INK} />
      {[-1, 1].map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={`M${dx} ${cy + d * 4} Q${cx} ${cy + d * r * 0.62} ${cx - r * 0.85} ${cy + d * r * 0.4}`} stroke={VESSEL} strokeWidth={2.4} />
          <path d={`M${dx} ${cy + d * 8} Q${cx + 6} ${cy + d * r * 0.72} ${cx - r * 0.8} ${cy + d * r * 0.55}`} stroke={FIG.red700} strokeWidth={1.6} opacity={0.75} />
        </g>
      ))}
      <circle cx={cx - r * 0.1} cy={cy} r={r * 0.1} fill={FIG.orange600} opacity={0.35} />
      {children}
    </g>
  )
}

const glaucomatousDisc: DiagramDef = {
  viewBox: [720, 300],
  caption: 'Damage to the inferior rim shows up as a superior field defect. Look for the notch and the splinter haemorrhage at the disc edge.',
  render: (L) => (
    <g>
      <Panel x={10} y={10} w={230} h={280} title="Healthy">
        <ellipse cx={125} cy={140} rx={66} ry={74} fill={ROSE_SOFT} stroke={BUTTER_INK} />
        <ellipse cx={125} cy={140} rx={22} ry={24} fill={FIG.amber50} />
        <T x={125} y={78} size={11} weight={600} show={L}>
          S
        </T>
        <T x={125} y={204} size={11} weight={600} show={L}>
          I
        </T>
        <T x={66} y={140} size={11} weight={600} show={L}>
          T
        </T>
        <T x={184} y={140} size={11} weight={600} show={L}>
          N
        </T>
        <Lines x={125} y={250} text="Small cup; thick rim following ISNT: Inferior ≥ Superior ≥ Nasal ≥ Temporal" max={30} size={11} weight={600} show={L} />
      </Panel>
      <Panel x={250} y={10} w={230} h={280} title="Glaucomatous">
        <ellipse cx={365} cy={140} rx={66} ry={74} fill={ROSE_SOFT} stroke={BUTTER_INK} />
        <path d="M365 82 C400 84 404 120 400 150 C398 182 382 206 366 210 C352 204 330 182 330 150 C328 112 338 84 365 82 Z" fill={FIG.amber50} />
        <path d="M352 210 l6 -10" stroke={VESSEL} strokeWidth={3} strokeLinecap="round" />
        <Callout x={366} y={208} tx={260} ty={240} text="Inferior notch" show={L} />
        <Callout x={354} y={208} tx={410} ty={250} text="Disc haemorrhage" show={L} max={10} />
        <Callout x={372} y={120} tx={400} ty={54} text="Enlarged, vertical cup" show={L} max={11} />
      </Panel>
      <Panel x={490} y={10} w={220} h={280} title="Field (that eye)">
        <circle cx={600} cy={150} r={80} fill={FIG.white} stroke={INK} />
        <line x1={520} y1={150} x2={680} y2={150} stroke={MUTED} />
        <line x1={600} y1={70} x2={600} y2={230} stroke={MUTED} />
        <path d="M605 92 C640 96 668 120 672 146 L654 146 C650 126 630 108 605 106 Z" fill={INK} />
        <path d="M605 92 C580 94 560 108 556 126 L572 128 C576 114 588 106 605 106 Z" fill={INK} />
        <Lines x={600} y={256} text="Superior arcuate defect" max={26} size={11.5} weight={600} show={L} />
      </Panel>
    </g>
  ),
}

const medicalRetinaSigns: DiagramDef = {
  viewBox: [720, 300],
  caption: 'Schematic, not to scale: a guide to what to look for in each condition.',
  render: (L) => (
    <g>
      <Panel x={10} y={10} w={230} h={280} title="AMD">
        <Fundus cx={125} cy={140} r={90}>
          {[
            [100, 128],
            [110, 152],
            [124, 120],
            [94, 146],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill={FIG.amber300} />
          ))}
          <ellipse cx={120} cy={142} rx={16} ry={12} fill={FIG.grey500} opacity={0.8} />
          <ellipse cx={120} cy={142} rx={24} ry={18} fill="none" stroke={VESSEL} strokeWidth={4} opacity={0.7} />
        </Fundus>
        <Callout x={94} y={146} tx={30} ty={256} text="Drusen" show={L} anchor="start" />
        <Callout x={126} y={150} tx={130} ty={268} text="CNV membrane + haem (wet)" show={L} anchor="start" max={16} />
      </Panel>
      <Panel x={250} y={10} w={230} h={280} title="Diabetic retinopathy">
        <Fundus cx={365} cy={140} r={90}>
          {[
            [320, 110],
            [340, 170],
            [300, 150],
            [380, 96],
          ].map(([x, y]) => (
            <circle key={`m${x}${y}`} cx={x} cy={y} r={2.6} fill={VESSEL} />
          ))}
          {[
            [310, 128],
            [350, 112],
          ].map(([x, y]) => (
            <circle key={`d${x}${y}`} cx={x} cy={y} r={5.5} fill={VESSEL} />
          ))}
          {[
            [344, 136],
            [350, 148],
            [338, 152],
          ].map(([x, y]) => (
            <circle key={`e${x}${y}`} cx={x} cy={y} r={3} fill={FIG.amber300} />
          ))}
          <ellipse cx={318} cy={186} rx={10} ry={6} fill={FIG.white} opacity={0.9} />
          <path d="M398 132 q6 -10 12 0 q6 10 12 0 M398 146 q6 10 12 0" fill="none" stroke={VESSEL} strokeWidth={1.2} />
        </Fundus>
        <Callout x={320} y={110} tx={258} ty={248} text="Microaneurysms, dot-blot haems" show={L} anchor="start" max={16} />
        <Callout x={344} y={140} tx={384} ty={248} text="Hard exudates" show={L} anchor="start" max={12} />
        <Callout x={318} y={186} tx={258} ty={276} text="Cotton wool spot" show={L} anchor="start" />
        <Callout x={410} y={136} tx={384} ty={276} text="New vessels on disc" show={L} anchor="start" max={12} />
      </Panel>
      <Panel x={490} y={10} w={220} h={280} title="Branch retinal vein occlusion">
        <Fundus cx={600} cy={140} r={88}>
          <circle cx={610} cy={102} r={5} fill="none" stroke={INK} strokeWidth={1.4} />
          {[
            [580, 92],
            [566, 82],
            [552, 96],
            [572, 70],
            [548, 76],
          ].map(([x, y]) => (
            <path key={`f${x}${y}`} d={`M${x} ${y} l-10 -5 l2 4 z`} fill={VESSEL} stroke={VESSEL} strokeWidth={3} strokeLinejoin="round" />
          ))}
        </Fundus>
        <Callout x={610} y={102} tx={702} ty={280} text="A–V crossing" show={L} anchor="end" />
        <Callout x={560} y={84} tx={500} ty={250} text="Flame haemorrhages in a wedge" show={L} anchor="start" max={22} />
      </Panel>
    </g>
  ),
}

const avNipping: DiagramDef = {
  viewBox: [720, 230],
  caption: 'Hypertensive and arteriosclerotic changes at arteriovenous crossings and in the artery’s light reflex.',
  render: () => {
    const panel = (x: number, title: string, kind: number) => (
      <Panel key={title} x={x} y={10} w={168} h={210} title={title}>
        <rect x={x + 8} y={40} width={152} height={150} rx={10} fill={FIG.orange100} />
        {/* vein (horizontal) */}
        {kind === 1 ? (
          <path d={`M${x + 12} 120 H${x + 62} L${x + 76} 122 M${x + 92} 122 L${x + 106} 120 H${x + 156}`} stroke={FIG.red700} strokeWidth={12} strokeLinecap="round" fill="none" />
        ) : (
          <line x1={x + 12} y1={120} x2={x + 156} y2={120} stroke={FIG.red700} strokeWidth={12} strokeLinecap="round" opacity={0.85} />
        )}
        {/* artery (diagonal) */}
        <line x1={x + 50} y1={50} x2={x + 118} y2={186} stroke={kind === 3 ? FIG.grey100 : VESSEL} strokeWidth={8} strokeLinecap="round" />
        {kind === 2 && <line x1={x + 50} y1={50} x2={x + 118} y2={186} stroke={FIG.amber300} strokeWidth={4} strokeLinecap="round" />}
        {kind !== 2 && kind !== 3 && <line x1={x + 50} y1={50} x2={x + 118} y2={186} stroke={FIG.white} strokeWidth={1.4} opacity={0.8} />}
      </Panel>
    )
    return (
      <g>
        {panel(10, 'Normal crossing', 0)}
        {panel(186, 'AV nipping', 1)}
        {panel(362, 'Copper wiring', 2)}
        {panel(538, 'Silver wiring', 3)}
      </g>
    )
  },
}

// ── Pharmacology ──────────────────────────────────────────────────────

const dropPathways: DiagramDef = {
  viewBox: [720, 400],
  caption: 'Most of a drop is lost to overflow and nasolacrimal drainage (and systemic absorption). Closing the eyes and pressing the inner corner keeps more on the eye.',
  render: (L) => (
    <g>
      <Arrowheads />
      <EyeFront cx={230} cy={150} w={300} iris={50} pupil={22} />
      <path d="M240 20 q-10 18 0 26 q10 -8 0 -26 Z" fill={SKY} />
      <PathArrow d="M240 50 L240 98" colour={SKY} id="ah-sky" />
      <PathArrow d="M120 180 C110 230 100 270 92 330" colour={SKY} id="ah-sky" />
      <PathArrow d="M370 160 C410 170 420 220 424 300" colour={ROSE} id="ah-rose" />
      <circle cx={376} cy={160} r={5} fill={ROSE} />
      <ellipse cx={392} cy={160} rx={22} ry={14} fill={BUTTER} stroke={BUTTER_INK} />
      {/* corneal layers inset */}
      <g transform="translate(450 40)">
        <rect x={0} y={0} width={140} height={26} fill={LILAC_SOFT} />
        <rect x={0} y={26} width={140} height={70} fill={FIG.grey50c} />
        <rect x={0} y={96} width={140} height={10} fill={ROSE_SOFT} />
        <rect x={0} y={106} width={140} height={50} fill={SKY_SOFT} />
        <PathArrow d="M70 -14 V150" colour={INK} />
        <Lines x={150} y={13} text="Epithelium (lipophilic)" max={14} size={11.5} weight={600} anchor="start" show={L} />
        <Lines x={150} y={60} text="Stroma (hydrophilic)" max={14} size={11.5} weight={600} anchor="start" show={L} />
        <Lines x={150} y={101} text="Endothelium" max={14} size={11.5} weight={600} anchor="start" show={L} />
        <Lines x={150} y={134} text="Anterior chamber" max={14} size={11.5} weight={600} anchor="start" show={L} />
      </g>
      <T x={92} y={350} size={12.5} fill={SKY} show={L}>
        Overflow onto the cheek
      </T>
      <Lines x={424} y={330} text="Punctum and nasolacrimal duct → nose → systemic absorption" max={22} size={12} weight={600} fill={ROSE} show={L} />
      <Callout x={392} y={160} tx={470} ty={250} text="Punctal occlusion (finger on the inner corner)" show={L} max={22} />
    </g>
  ),
}

const pupilReceptors: DiagramDef = {
  viewBox: [720, 360],
  caption: 'Antimuscarinics block the sphincter (and the ciliary muscle, so accommodation too); phenylephrine stimulates the dilator. Using both gives the widest pupil.',
  render: (L) => (
    <g>
      <Arrowheads />
      <circle cx={210} cy={180} r={150} fill={IRIS} stroke={SKY} strokeWidth={2} />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2
        return <line key={i} x1={210 + Math.cos(a) * 80} y1={180 + Math.sin(a) * 80} x2={210 + Math.cos(a) * 144} y2={180 + Math.sin(a) * 144} stroke={SAGE} strokeWidth={1.6} />
      })}
      <circle cx={210} cy={180} r={64} fill="none" stroke={ROSE} strokeWidth={14} opacity={0.7} />
      <circle cx={210} cy={180} r={48} fill={INK} />
      <Callout x={210} y={118} tx={430} ty={40} text="Sphincter pupillae: parasympathetic, muscarinic receptors" show={L} max={30} />
      <Callout x={330} y={240} tx={430} ty={320} text="Dilator pupillae: sympathetic, alpha-1 receptors" show={L} max={30} />
      <TBox x={430} y={110} w={270} h={60} text="Tropicamide / cyclopentolate: block the sphincter and ciliary muscle" fill={ROSE_SOFT} ink={ROSE} size={12} />
      <Arrow x1={430} y1={140} x2={280} y2={160} colour={ROSE} id="ah-rose" />
      <TBox x={430} y={200} w={270} h={50} text="Phenylephrine: stimulates the dilator" fill={SAGE_SOFT} ink={SAGE} size={12} />
      <Arrow x1={430} y1={225} x2={340} y2={210} colour={SAGE} id="ah-sage" />
    </g>
  ),
}

const angleClosureMechanism: DiagramDef = {
  viewBox: [720, 380],
  caption: 'In pupil block, aqueous builds up behind the iris and pushes it forward against the trabecular meshwork. Pressure can rise fast.',
  render: (L) => (
    <g>
      <Arrowheads />
      <Panel x={10} y={10} w={340} h={360} title="Open angle">
        <AnteriorSegment cx={170} cy={200} s={0.8} />
        <PathArrow d="M196 170 C160 150 158 120 172 92" colour={SKY} id="ah-sky" />
        <Callout x={172} y={88} tx={40} ty={340} text="Aqueous reaches an open trabecular meshwork" show={L} anchor="start" max={26} />
      </Panel>
      <Panel x={370} y={10} w={340} h={360} title="Pupil block → angle closure">
        <AnteriorSegment cx={520} cy={200} s={0.8} bombe />
        <circle cx={552} cy={140} r={7} fill={SKY} opacity={0.7} />
        <Callout x={522} y={92} tx={390} ty={56} text="Closed angle" show={L} anchor="start" />
        <Callout x={504} y={130} tx={390} ty={110} text="Iris bombé" show={L} anchor="start" />
        <Callout x={524} y={178} tx={600} ty={320} text="Mid-dilated pupil: pupil block" show={L} max={14} />
        <T x={650} y={60} size={13} fill={ROSE} show={L}>
          IOP ↑
        </T>
      </Panel>
    </g>
  ),
}

const glaucomaDrugTargets: DiagramDef = {
  viewBox: [720, 420],
  caption: 'Drops lower IOP either by making less aqueous or by helping it out. Some classes do both (alpha-agonists also increase uveoscleral outflow).',
  render: (L) => (
    <g>
      <Arrowheads />
      <AnteriorSegment cx={300} cy={210} />
      <TBox x={420} y={20} w={290} h={64} text="Ciliary body: beta-blockers, carbonic anhydrase inhibitors, alpha-agonists (less aqueous made)" fill={ROSE_SOFT} ink={ROSE} size={12} />
      <Arrow x1={420} y1={60} x2={366} y2={70} colour={ROSE} id="ah-rose" />
      <TBox x={420} y={110} w={290} h={52} text="Uveoscleral outflow: prostaglandin analogues" fill={LILAC_SOFT} ink={LILAC} size={12} />
      <Arrow x1={420} y1={136} x2={372} y2={84} colour={LILAC} id="ah-lilac" />
      <TBox x={10} y={20} w={200} h={64} text="Trabecular meshwork: pilocarpine, SLT (more conventional outflow)" fill={SAGE_SOFT} ink={SAGE} size={12} />
      <Arrow x1={210} y1={52} x2={296} y2={66} colour={SAGE} id="ah-sage" />
      <T x={420} y={300} size={12.5} anchor="start" show={L} fill={MUTED}>
        Aqueous production ↓ = ciliary body
      </T>
      <T x={420} y={322} size={12.5} anchor="start" show={L} fill={MUTED}>
        Aqueous outflow ↑ = meshwork or uveoscleral
      </T>
    </g>
  ),
}

const drugEyeMap: DiagramDef = {
  viewBox: [720, 380],
  caption: 'Not exhaustive: these are the classic examples to recognise and ask about in a drug history.',
  render: (L) => (
    <g>
      <EyeSide cx={330} cy={190} r={140} />
      <Callout x={196} y={190} tx={40} ty={120} text="Cornea: amiodarone (vortex keratopathy)" show={L} max={20} />
      <Callout x={254} y={150} tx={150} ty={30} text="Lens: corticosteroids (posterior subcapsular cataract)" show={L} max={26} />
      <Callout x={222} y={120} tx={40} ty={250} text="Angle: topiramate (angle closure)" show={L} max={20} />
      <Callout x={232} y={230} tx={40} ty={330} text="Iris: tamsulosin (floppy iris in cataract surgery)" show={L} max={26} />
      <Callout x={460} y={150} tx={520} ty={60} text="Retina: hydroxychloroquine (maculopathy)" show={L} max={22} />
      <Callout x={484} y={190} tx={540} ty={290} text="Optic nerve: ethambutol (optic neuropathy)" show={L} max={22} />
    </g>
  ),
}

// ── Low vision ────────────────────────────────────────────────────────

const lvaDeviceTypes: DiagramDef = {
  viewBox: [720, 250],
  caption: 'Match the device to the task and working distance; stronger magnification means less field of view.',
  render: () => {
    const items: [string, JSX.Element][] = [
      [
        'Hand magnifier',
        <g key="h">
          <circle cx={0} cy={-10} r={28} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
          <rect x={18} y={12} width={10} height={44} rx={4} transform="rotate(-35 23 34)" fill={INK} />
        </g>,
      ],
      [
        'Stand magnifier',
        <g key="s">
          <rect x={-32} y={-36} width={64} height={46} rx={10} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
          <rect x={-36} y={10} width={72} height={10} fill={FIG.grey200} />
          <circle cx={0} cy={-14} r={6} fill={BUTTER} />
        </g>,
      ],
      [
        'Spectacle magnifier (high add)',
        <g key="p">
          <circle cx={-22} cy={0} r={18} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
          <circle cx={22} cy={0} r={18} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
          <line x1={-4} y1={0} x2={4} y2={0} stroke={INK} strokeWidth={2} />
        </g>,
      ],
      [
        'Telescope (distance)',
        <g key="t">
          <rect x={-34} y={-12} width={40} height={24} rx={4} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
          <rect x={6} y={-16} width={26} height={32} rx={4} fill={SKY_SOFT} stroke={INK} strokeWidth={2} />
        </g>,
      ],
      [
        'Video magnifier',
        <g key="v">
          <rect x={-36} y={-40} width={72} height={50} rx={6} fill={FIG.grey100} stroke={INK} strokeWidth={2} />
          <text x={0} y={-6} textAnchor="middle" fontSize={26} fontWeight={700} fill={INK}>
            Aa
          </text>
          <rect x={-6} y={10} width={12} height={16} fill={INK} />
          <rect x={-30} y={26} width={60} height={8} rx={3} fill={INK} />
        </g>,
      ],
    ]
    return (
      <g>
        {items.map(([name, art], i) => {
          const x = 10 + i * 142
          return (
            <Panel key={name} x={x} y={10} w={132} h={230}>
              <g transform={`translate(${x + 66} 110)`}>{art}</g>
              <Lines x={x + 66} y={196} text={name} max={16} size={12} weight={700} />
            </Panel>
          )
        })}
      </g>
    )
  },
}

const taskLighting: DiagramDef = {
  viewBox: [720, 320],
  caption: 'Bring the light close and to the side of the better eye, shaded so it falls on the task and not into the eyes. A typoscope cuts glare from white paper.',
  render: (L) => (
    <g>
      <Arrowheads />
      {/* table, person, lamp */}
      <rect x={40} y={230} width={400} height={12} rx={4} fill={BUTTER_INK} />
      <circle cx={130} cy={100} r={30} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.6} />
      <path d="M110 130 Q100 190 120 230 H160 Q170 180 150 130 Z" fill={LILAC_SOFT} stroke={LILAC} />
      <rect x={220} y={222} width={90} height={8} fill={FIG.white} stroke={INK} />
      <path d="M380 230 L360 140 L300 120" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M280 110 L322 104 L314 136 Z" fill={BUTTER} stroke={BUTTER_INK} />
      <path d="M300 128 L240 222 L310 222 Z" fill={BUTTER} opacity={0.5} />
      <line x1={150} y1={96} x2={240} y2={218} stroke={SKY} strokeDasharray="5 4" />
      <Callout x={300} y={120} tx={360} ty={60} text="Adjustable lamp, low and close" show={L} />
      <Callout x={148} y={96} tx={30} ty={40} text="Better eye side" show={L} anchor="start" />
      <Callout x={266} y={210} tx={330} ty={280} text="Light on the task, no glare into the eyes" show={L} max={22} />
      {/* typoscope */}
      <rect x={480} y={60} width={220} height={200} rx={8} fill={FIG.white} stroke={FIG.grey100c} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={496} y1={80 + i * 20} x2={684} y2={80 + i * 20} stroke={FIG.grey200} strokeWidth={6} strokeLinecap="round" />
      ))}
      <path d="M480 60 H700 V260 H480 Z M500 148 V172 H680 V148 Z" fill={INK} fillRule="evenodd" />
      <T x={590} y={290} size={12.5} show={L}>
        Typoscope
      </T>
    </g>
  ),
}

export const EYE_DIAGRAMS: Record<string, DiagramDef> = {
  'aqueous-flow': aqueousFlow,
  'anterior-eye-layers': anteriorEyeLayers,
  'cornea-layers': corneaLayers,
  'lens-structure': lensStructure,
  'retina-layers': retinaLayers,
  'lacrimal-drainage': lacrimalDrainage,
  'visual-pathway': visualPathway,
  'ocular-blood-supply': ocularBloodSupply,
  'optic-section': opticSection,
  'lid-eversion': lidEversion,
  'lid-margin': lidMargin,
  'soft-fit': softFit,
  'inside-out-lens': insideOutLens,
  'infiltrate-comparison': infiltrateComparison,
  'grading-strip': gradingStrip,
  'glaucomatous-disc': glaucomatousDisc,
  'medical-retina-signs': medicalRetinaSigns,
  'av-nipping': avNipping,
  'drop-pathways': dropPathways,
  'pupil-receptors': pupilReceptors,
  'angle-closure-mechanism': angleClosureMechanism,
  'glaucoma-drug-targets': glaucomaDrugTargets,
  'drug-eye-map': drugEyeMap,
  'lva-device-types': lvaDeviceTypes,
  'task-lighting': taskLighting,
}
