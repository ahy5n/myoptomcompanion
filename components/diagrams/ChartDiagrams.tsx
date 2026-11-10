// Flowcharts, timelines, graphs, tables and hubs (no anatomy). Keyed by
// `diagram.id` like the other diagram files.

import { Arrowheads, BUTTER, BUTTER_INK, type DiagramDef, INK, LILAC, LILAC_SOFT, MUTED, ROSE, ROSE_SOFT, SAGE, SAGE_SOFT, SKY, SKY_SOFT, T } from './kit'
import { Arrow, Axes, flowHeight, FlowRows, Lines, makeAxes, PathArrow, TBox } from './kit2'
import { FIG } from './palette'

/** A plain step-by-step flow, `perRow` boxes per row. */
function flow(steps: string[], perRow: number, caption?: string, width = 700): DiagramDef {
  return {
    viewBox: [width, flowHeight(steps.length, perRow)],
    caption,
    render: () => (
      <g>
        <Arrowheads />
        <FlowRows steps={steps} perRow={perRow} width={width} />
      </g>
    ),
  }
}

// ── Linear flows ───────────────────────────────────────────────────────

const refractionFlow = flow(
  ['History', 'Habitual VA', 'Retinoscopy', 'Subjective: BVS', 'JCC (axis, then power)', 'Sphere check', 'Binocular balance', 'Binocular BVS', 'Near add', 'Range of clear vision', 'Trial frame check', 'Advice and recording'],
  4,
  'Objective first, then subjective, then binocular, then near — and always check the final prescription in a trial frame.',
)

const eyeExamFlow = flow(
  ['History', 'Vision', 'Objective refraction', 'Subjective refraction', 'Binocular vision', 'Anterior eye', 'Pupils', 'Posterior eye', 'Additional tests (IOP, fields, OCT)', 'Management, advice, recall', 'Records'],
  4,
  'Order varies by practice, but every routine examination covers each of these and is recorded contemporaneously.',
)

const pathToRegistration = flow(
  ['Pass final assessment', 'Apply to the GOC register', 'Professional indemnity insurance', 'Performers list (for NHS work)', 'Start work', 'CPD cycle: peer review and reflection'],
  3,
  'You can’t practise as an optometrist until your name is on the GOC register.',
)

const lvAssessmentFlow = flow(
  ['History and goals', 'Distance VA (logMAR at 2 m / 1 m)', 'Refraction (larger steps)', 'Near VA and reading speed', 'Contrast sensitivity', 'Central field and eccentric viewing', 'Trial of aids', 'Plan, training and referral'],
  4,
  'Start from what the person wants to do; every later step is aimed at those goals.',
)

const apologyStructure: DiagramDef = {
  viewBox: [700, 210],
  caption: 'A meaningful apology is specific, explains, puts things right and leaves the door open.',
  render: () => {
    const parts: [string, string, string, string][] = [
      ['“I’m sorry that…”', 'Specific apology', ROSE_SOFT, ROSE],
      ['“What happened was…”', 'Explanation', SKY_SOFT, SKY],
      ['“What we’ll do now is…”', 'Remedy', SAGE_SOFT, SAGE],
      ['“If you have any questions…”', 'Support and contact', LILAC_SOFT, LILAC],
    ]
    return (
      <g>
        <Arrowheads />
        {parts.map(([say, what, fill, ink], i) => {
          const x = 10 + i * 172
          return (
            <g key={what}>
              <path d={`M${x} 30 h126 a12 12 0 0 1 12 12 v86 a12 12 0 0 1 -12 12 h-80 l-18 22 v-22 h-28 a12 12 0 0 1 -12 -12 v-86 a12 12 0 0 1 12 -12z`} fill={fill} />
              <Lines x={x + 69} y={78} text={say} max={15} size={14} weight={600} />
              <text x={x + 69} y={198} textAnchor="middle" fontSize={13} fontWeight={700} fill={ink}>
                {what}
              </text>
              {i < 3 && <Arrow x1={x + 142} y1={85} x2={x + 166} y2={85} />}
            </g>
          )
        })}
      </g>
    )
  },
}

// ── Timelines ─────────────────────────────────────────────────────────

function timeline(stages: string[], caption: string): DiagramDef {
  const w = 720
  const step = (w - 110) / (stages.length - 1)
  return {
    viewBox: [w, 200],
    caption,
    render: () => (
      <g>
        <Arrowheads />
        <Arrow x1={20} y1={100} x2={w - 10} y2={100} width={3} colour={LILAC} />
        {stages.map((s, i) => {
          const x = 50 + i * step
          const up = i % 2 === 0
          return (
            <g key={s}>
              <circle cx={x} cy={100} r={9} fill={i === stages.length - 1 ? SAGE : LILAC} stroke={FIG.white} strokeWidth={3} />
              <line x1={x} y1={up ? 90 : 110} x2={x} y2={up ? 66 : 134} stroke={MUTED} />
              <Lines x={x} y={up ? 44 : 158} text={s} max={14} size={12.5} weight={600} />
            </g>
          )
        })}
      </g>
    ),
  }
}

const placementYearTimeline = timeline(
  ['Induction', 'Close supervision', 'Patient episodes and reflection', 'Interim review', 'Increasing independence', 'Final assessment', 'GOC registration'],
  'Supervision steps down as competence is evidenced; the interim review is the moment to fix gaps.',
)

const childTestsByAge: DiagramDef = {
  viewBox: [700, 230],
  caption: 'Ages are a guide: choose the test the child can actually do, and move to letters as soon as they can match.',
  render: () => {
    const a = makeAxes({ x: 40, y: 20, w: 620, h: 150, xMin: 0, xMax: 6, yMin: 0, yMax: 4 })
    const bands: [string, number, number, string, string][] = [
      ['Preferential looking', 0, 2, LILAC_SOFT, LILAC],
      ['Cardiff cards', 1, 3, SKY_SOFT, SKY],
      ['Kay pictures', 2, 4, SAGE_SOFT, SAGE],
      ['Letter matching (crowded logMAR)', 3, 6, BUTTER, BUTTER_INK],
    ]
    return (
      <g>
        <Arrowheads />
        {bands.map(([name, from, to, fill, ink], i) => (
          <g key={name}>
            <rect x={a.px(from)} y={28 + i * 36} width={a.px(to) - a.px(from)} height={28} rx={8} fill={fill} stroke={ink} />
            <text x={a.px(from) + 10} y={42 + i * 36} dominantBaseline="middle" fontSize={13} fontWeight={600} fill={INK}>
              {name}
            </text>
          </g>
        ))}
        <line x1={40} y1={180} x2={665} y2={180} stroke={INK} strokeWidth={1.5} markerEnd="url(#ah)" />
        {[0, 1, 2, 3, 4, 5, 6].map((y) => (
          <g key={y}>
            <line x1={a.px(y)} y1={180} x2={a.px(y)} y2={186} stroke={INK} />
            <text x={a.px(y)} y={200} textAnchor="middle" fontSize={12} fill={MUTED}>
              {y}
            </text>
          </g>
        ))}
        <text x={350} y={222} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>
          Age (years)
        </text>
      </g>
    )
  },
}

const cycloTimeline: DiagramDef = {
  viewBox: [700, 210],
  caption: 'Plan the appointment so retinoscopy falls in the 30–60 minute window, and warn about blur for the rest of the day.',
  render: () => {
    // Log-style time scale so the first hour isn't squashed.
    const px = (min: number) => 40 + (620 * Math.log(1 + min / 10)) / Math.log(1 + 1440 / 10)
    return (
      <g>
        <Arrowheads />
        <rect x={px(30)} y={60} width={px(60) - px(30)} height={50} rx={8} fill={SAGE_SOFT} stroke={SAGE} />
        <T x={(px(30) + px(60)) / 2} y={40} size={13} fill={SAGE}>
          Peak 30–60 min: do ret now
        </T>
        <rect x={px(60)} y={70} width={px(6 * 60) - px(60)} height={30} rx={8} fill={BUTTER} />
        <T x={(px(60) + px(360)) / 2} y={85} size={12.5} fill={BUTTER_INK}>
          Near blur and dilation (hours)
        </T>
        <rect x={px(360)} y={74} width={px(1440) - px(360)} height={22} rx={8} fill={FIG.grey100} />
        <T x={(px(360) + px(1440)) / 2} y={85} size={12} fill={MUTED}>
          Wearing off, up to 24 h
        </T>
        <line x1={30} y1={140} x2={670} y2={140} stroke={INK} strokeWidth={1.5} markerEnd="url(#ah)" />
        {(
          [
            [0, 'Instil'],
            [30, '30 min'],
            [60, '60 min'],
            [360, '6 h'],
            [1440, '24 h'],
          ] as const
        ).map(([m, l]) => (
          <g key={m}>
            <line x1={px(m)} y1={134} x2={px(m)} y2={146} stroke={INK} />
            <text x={px(m)} y={164} textAnchor="middle" fontSize={12.5} fontWeight={m === 0 ? 700 : 500} fill={m === 0 ? ROSE : MUTED}>
              {l}
            </text>
          </g>
        ))}
        <circle cx={px(0)} cy={85} r={8} fill={ROSE} />
        <text x={360} y={198} textAnchor="middle" fontSize={11.5} fill={MUTED}>
          (time axis stretched early on)
        </text>
      </g>
    )
  },
}

// ── Ladders and funnels ───────────────────────────────────────────────

function ladder(rungs: string[], caption: string, side?: string): DiagramDef {
  const h = 70 + rungs.length * 62
  return {
    viewBox: [640, h],
    caption,
    render: () => (
      <g>
        <Arrowheads />
        <line x1={150} y1={20} x2={150} y2={h - 16} stroke={MUTED} strokeWidth={4} strokeLinecap="round" />
        <line x1={470} y1={20} x2={470} y2={h - 16} stroke={MUTED} strokeWidth={4} strokeLinecap="round" />
        {rungs.map((r, i) => {
          const y = h - 60 - i * 62
          const tone = [SAGE_SOFT, SKY_SOFT, LILAC_SOFT, BUTTER, ROSE_SOFT, SAGE_SOFT][i % 6]
          return <TBox key={r} x={160} y={y} w={300} h={44} text={r} fill={tone} size={13} />
        })}
        <Arrow x1={110} y1={h - 30} x2={110} y2={30} colour={LILAC} width={2.4} />
        {side && <Lines x={560} y={50} text={side} max={18} size={12.5} weight={700} fill={ROSE} />}
      </g>
    ),
  }
}

const raisingConcernsLadder = ladder(
  ['Supervisor / clinic lead', 'Manager / programme lead', 'Senior management / Freedom to Speak Up Guardian', 'Regulator (GOC)'],
  'Start at the lowest level that can fix the problem, and go higher if it isn’t dealt with.',
  'If a patient is at immediate risk, act now',
)

const careerLadder = ladder(
  ['GOC registration', 'Enhanced services (e.g. MECS, repeat IOP)', 'College professional certificates', 'Higher certificates', 'Therapeutic qualifications (AS, SP, IP)', 'Advanced roles: community glaucoma, hospital clinics, teaching'],
  'Many routes combine these; you don’t need every rung to reach an advanced role.',
)

const historyStructure: DiagramDef = {
  viewBox: [640, 330],
  caption: 'Start open and let the patient talk, then narrow down. End with a short list of what it could be.',
  render: () => {
    const rows = ['Open questions (reason for visit)', 'Symptom details', 'Ocular and general health', 'Medication and family history', 'Lifestyle and tasks', 'Hypotheses']
    return (
      <g>
        {rows.map((r, i) => {
          const top = 14 + i * 52
          const w0 = 600 - i * 84
          const w1 = 600 - (i + 1) * 84
          const cx = 320
          const fill = [LILAC_SOFT, SKY_SOFT, SAGE_SOFT, BUTTER, ROSE_SOFT, LILAC][i]
          return (
            <g key={r}>
              <path d={`M${cx - w0 / 2} ${top} H${cx + w0 / 2} L${cx + Math.max(w1, 96) / 2} ${top + 46} H${cx - Math.max(w1, 96) / 2} Z`} fill={fill} />
              <Lines x={cx} y={top + 23} text={r} max={i > 3 ? 16 : 34} size={13} weight={600} fill={i === 5 ? FIG.white : INK} />
            </g>
          )
        })}
      </g>
    )
  },
}

const imrad: DiagramDef = {
  viewBox: [660, 330],
  caption: 'Read the methods hardest: that’s where bias hides.',
  render: () => {
    const cx = 210
    const parts: [string, string, number, number][] = [
      ['Introduction', 'What’s the question (PICO)? Is it clinically relevant?', 20, 260],
      ['Methods', 'Right design? Randomised, blinded, followed up? Sources of bias?', 100, 120],
      ['Results', 'How big is the effect, and how precise (CI)?', 180, 120],
      ['Discussion', 'Does it apply to my patients? Limitations owned?', 260, 260],
    ]
    return (
      <g>
        <path d={`M${cx - 130} 20 H${cx + 130} L${cx + 60} 100 V250 L${cx + 130} 310 H${cx - 130} L${cx - 60} 250 V100 Z`} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.5} />
        {parts.map(([name, note, y]) => (
          <g key={name}>
            <T x={cx} y={y + 32} size={15}>
              {name}
            </T>
            <line x1={cx + 140} y1={y + 32} x2={400} y2={y + 32} stroke={MUTED} strokeDasharray="3 3" />
            <Lines x={410} y={y + 32} text={note} max={30} size={12.5} anchor="start" />
          </g>
        ))}
      </g>
    )
  },
}

// ── Cycles, hubs and triangles ────────────────────────────────────────

const prescribingProcess: DiagramDef = {
  viewBox: [640, 420],
  caption: 'Prescribing is a cycle: review whether it worked, then assess again.',
  render: () => {
    const steps = ['Assess (history, examination, drug history, allergies)', 'Consider options, including no treatment', 'Reach a shared decision', 'Prescribe (legal, clear)', 'Provide information: use, side effects, safety-net', 'Monitor and review']
    const cx = 320
    const cy = 210
    const R = 150
    const pts = steps.map((_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / steps.length
      return [cx + R * Math.cos(a) * 1.25, cy + R * Math.sin(a)] as const
    })
    return (
      <g>
        <Arrowheads />
        {pts.map(([x, y], i) => {
          const [nx, ny] = pts[(i + 1) % pts.length]
          const mx = (x + nx) / 2 + (cx - (x + nx) / 2) * -0.18
          const my = (y + ny) / 2 + (cy - (y + ny) / 2) * -0.18
          return <PathArrow key={`a${i}`} d={`M${x + (nx - x) * 0.32} ${y + (ny - y) * 0.32} Q${mx} ${my} ${x + (nx - x) * 0.68} ${y + (ny - y) * 0.68}`} colour={LILAC} />
        })}
        {pts.map(([x, y], i) => (
          <TBox key={steps[i]} x={x - 80} y={y - 30} w={160} h={60} text={steps[i]} fill={[LILAC_SOFT, SKY_SOFT, SAGE_SOFT, BUTTER, ROSE_SOFT, SAGE_SOFT][i]} size={12} />
        ))}
      </g>
    )
  },
}

function hub(centre: string, spokes: string[], caption: string, opts: { arrows?: boolean; ring?: boolean } = {}): DiagramDef {
  return {
    viewBox: [660, 440],
    caption,
    render: () => {
      const cx = 330
      const cy = 220
      return (
        <g>
          <Arrowheads />
          {opts.ring && <circle cx={cx} cy={cy} r={150} fill="none" stroke={FIG.grey100c} strokeWidth={30} />}
          {spokes.map((s, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / spokes.length
            const x = cx + Math.cos(a) * 230
            const y = cy + Math.sin(a) * 160
            const tone = [LILAC_SOFT, SKY_SOFT, SAGE_SOFT, BUTTER, ROSE_SOFT, FIG.grey100, LILAC_SOFT, SKY_SOFT][i % 8]
            return (
              <g key={s}>
                {opts.arrows ? (
                  <>
                    <Arrow x1={cx + Math.cos(a) * 70} y1={cy + Math.sin(a) * 50} x2={x - Math.cos(a) * 80} y2={y - Math.sin(a) * 30} colour={MUTED} />
                  </>
                ) : (
                  <line x1={cx} y1={cy} x2={x} y2={y} stroke={FIG.grey100c} strokeWidth={2} />
                )}
                <TBox x={x - 75} y={y - 24} w={150} h={48} text={s} fill={tone} size={12.5} />
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={62} fill={LILAC} />
          <Lines x={cx} y={cy} text={centre} max={12} size={15} weight={700} fill={FIG.white} />
        </g>
      )
    },
  }
}

const eyeCareTeam = hub(
  'Patient',
  ['Optometrist', 'Dispensing optician', 'Orthoptist', 'Ophthalmologist', 'GP', 'Pharmacist', 'Ophthalmic nurse'],
  'Optometrists refer to ophthalmology and write to GPs; orthoptists, nurses and pharmacists share care and information around the patient.',
  { arrows: true },
)

const gocThemes = hub(
  'The patient',
  ['Communication', 'Consent', 'Care and respect', 'Confidentiality', 'Competence and supervision', 'Honesty and candour', 'Raising concerns', 'Professionalism (including online)'],
  'The GOC Standards put the patient at the centre of every one of these themes.',
  { ring: true },
)

const spPartnership: DiagramDef = {
  viewBox: [640, 380],
  caption: 'Supplementary prescribing only works within the agreed clinical management plan (CMP).',
  render: () => {
    const A: [number, number] = [320, 60]
    const B: [number, number] = [110, 320]
    const C: [number, number] = [530, 320]
    return (
      <g>
        <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={2} />
        <TBox x={A[0] - 110} y={A[1] - 44} w={220} h={64} text="Independent prescriber (doctor): diagnoses, agrees the CMP" fill={SKY_SOFT} size={12.5} />
        <TBox x={B[0] - 100} y={B[1] - 20} w={210} h={64} text="Supplementary prescriber (optometrist): prescribes within the CMP" fill={SAGE_SOFT} size={12.5} />
        <TBox x={C[0] - 110} y={C[1] - 20} w={200} h={64} text="Patient: agrees to the arrangement" fill={BUTTER} size={12.5} />
        <rect x={240} y={196} width={160} height={50} rx={25} fill={FIG.white} stroke={LILAC} strokeWidth={2} />
        <Lines x={320} y={221} text="Clinical management plan" max={16} size={13} weight={700} fill={LILAC} />
      </g>
    )
  },
}

// ── Branching flows ───────────────────────────────────────────────────

const safeguardingFlow: DiagramDef = {
  viewBox: [660, 440],
  caption: 'Follow your organisation’s safeguarding policy; if in doubt, speak to the lead the same day.',
  render: () => (
    <g>
      <Arrowheads />
      <TBox x={220} y={10} w={220} h={46} text="Concern about a child or adult" fill={LILAC_SOFT} />
      <Arrow x1={330} y1={56} x2={330} y2={78} />
      <path d="M330 80 L430 118 L330 156 L230 118 Z" fill={BUTTER} stroke={BUTTER_INK} />
      <Lines x={330} y={118} text="Anyone in immediate danger?" max={16} size={12.5} weight={700} />
      <Arrow x1={430} y1={118} x2={500} y2={118} colour={ROSE} id="ah-rose" />
      <text x={460} y={108} textAnchor="middle" fontSize={12} fontWeight={700} fill={ROSE}>
        Yes
      </text>
      <TBox x={502} y={94} w={140} h={48} text="Call 999" fill={ROSE_SOFT} ink={ROSE} />
      <Arrow x1={330} y1={156} x2={330} y2={182} />
      <text x={344} y={172} fontSize={12} fontWeight={700} fill={SAGE}>
        No
      </text>
      <TBox x={180} y={184} w={300} h={50} text="Record what you saw and heard: facts, the words used" fill={SKY_SOFT} />
      <Arrow x1={330} y1={234} x2={330} y2={256} />
      <TBox x={200} y={258} w={260} h={46} text="Speak to the practice safeguarding lead" fill={SAGE_SOFT} />
      <Arrow x1={330} y1={304} x2={330} y2={326} />
      <TBox x={160} y={328} w={340} h={50} text="Referral to the local authority (children’s or adult social care) as advised" fill={LILAC_SOFT} />
      <Arrow x1={330} y1={378} x2={330} y2={392} />
      <TBox x={230} y={394} w={200} h={40} text="Record actions taken" fill={FIG.grey100} />
    </g>
  ),
}

const certificationPathway: DiagramDef = {
  viewBox: [700, 360],
  caption: 'Registration is voluntary, but certification opens the door to support; the referral letter route doesn’t need to wait for a CVI.',
  render: () => (
    <g>
      <Arrowheads />
      <TBox x={10} y={30} w={170} h={56} text="Optometrist or eye clinic identifies sight loss" fill={LILAC_SOFT} />
      <Arrow x1={180} y1={58} x2={214} y2={58} />
      <TBox x={216} y={30} w={170} h={56} text="Consultant ophthalmologist completes the CVI (if eligible)" fill={SKY_SOFT} />
      <Arrow x1={386} y1={58} x2={420} y2={58} />
      <TBox x={422} y={30} w={130} h={56} text="Copies to GP, patient and council" fill={SAGE_SOFT} />
      <Arrow x1={552} y1={58} x2={586} y2={58} />
      <TBox x={588} y={30} w={102} h={56} text="Local council" fill={BUTTER} />
      <Arrow x1={639} y1={86} x2={639} y2={132} />
      <TBox x={520} y={134} w={170} h={56} text="Offers registration and a needs assessment" fill={BUTTER} />
      <Arrow x1={605} y1={190} x2={605} y2={232} />
      <TBox x={490} y={234} w={200} h={56} text="Rehabilitation, equipment, benefits and concessions" fill={SAGE_SOFT} />
      <PathArrow d="M95 86 V300 H486" dash="5 4" colour={ROSE} id="ah-rose" />
      <Lines x={260} y={256} text="Referral of Vision Impairment / Letter of Vision Impairment: straight to social care, for people not (yet) certified" max={46} size={12.5} weight={600} fill={ROSE} />
    </g>
  ),
}

const glaucomaReferralFlow: DiagramDef = {
  viewBox: [700, 330],
  caption: 'Based on NICE NG81 thresholds; follow your local pathway (some areas run repeat-measurement or refinement schemes).',
  render: () => (
    <g>
      <Arrowheads />
      <TBox x={10} y={20} w={180} h={50} text="IOP 24 mmHg or more" fill={SKY_SOFT} />
      <Arrow x1={190} y1={45} x2={228} y2={45} />
      <TBox x={230} y={20} w={220} h={50} text="Repeat with contact (GAT) tonometry" fill={SKY_SOFT} />
      <Arrow x1={450} y1={45} x2={488} y2={45} />
      <TBox x={490} y={14} w={200} h={62} text="Still 24 or more: refer (OHT)" fill={BUTTER} ink={BUTTER_INK} />
      <TBox x={10} y={120} w={300} h={56} text="Suspicious disc or a repeatable field defect (any IOP)" fill={LILAC_SOFT} />
      <Arrow x1={310} y1={148} x2={488} y2={148} />
      <TBox x={490} y={120} w={200} h={56} text="Refer: suspected COAG" fill={BUTTER} ink={BUTTER_INK} />
      <TBox x={10} y={220} w={300} h={44} text="Narrow angle with symptoms" fill={LILAC_SOFT} />
      <Arrow x1={310} y1={242} x2={488} y2={242} />
      <TBox x={490} y={220} w={200} h={44} text="Refer" fill={BUTTER} ink={BUTTER_INK} />
      <TBox x={10} y={274} w={300} h={44} text="Acute angle closure (pain, haloes, high IOP)" fill={ROSE_SOFT} />
      <Arrow x1={310} y1={296} x2={488} y2={296} colour={ROSE} id="ah-rose" />
      <TBox x={490} y={274} w={200} h={44} text="Emergency: same day" fill={ROSE} ink={FIG.white} />
    </g>
  ),
}

const redEyeTriage: DiagramDef = {
  viewBox: [700, 380],
  caption: 'Any “yes” on the left means same-day assessment. Mild, painless red eyes with normal vision can usually be managed with advice.',
  render: () => {
    const qs = ['Pain?', 'Reduced vision?', 'Photophobia?', 'Contact lens wearer?', 'Recent trauma or chemical?']
    return (
      <g>
        <Arrowheads />
        <TBox x={10} y={150} w={120} h={60} text="Red eye" fill={ROSE_SOFT} ink={ROSE} size={15} />
        {qs.map((q, i) => {
          const y = 12 + i * 70
          return (
            <g key={q}>
              <PathArrow d={`M130 180 C160 180 160 ${y + 26} 196 ${y + 26}`} colour={MUTED} />
              <TBox x={200} y={y} w={190} h={52} text={q} fill={BUTTER} />
              <Arrow x1={390} y1={y + 26} x2={470} y2={y + 26} colour={ROSE} id="ah-rose" />
              <text x={430} y={y + 18} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ROSE}>
                yes
              </text>
            </g>
          )
        })}
        <rect x={474} y={12} width={216} height={332} rx={14} fill={ROSE_SOFT} />
        <Lines x={582} y={160} text="Same-day referral or assessment" max={14} size={15} weight={700} fill={ROSE} />
        <TBox x={200} y={352} w={490} h={26} r={8} text="All no: mild, painless, normal vision → manage locally with advice" fill={SAGE_SOFT} ink={SAGE} size={12} max={80} />
      </g>
    )
  },
}

const redEyeTreatment: DiagramDef = {
  viewBox: [700, 420],
  caption: 'Summary only: follow the College CMGs and your scope of practice for each condition.',
  render: () => {
    const rows: [string, string, string, string][] = [
      ['Bacterial conjunctivitis', 'Often self-limiting; consider chloramphenicol', SAGE_SOFT, SAGE],
      ['Viral conjunctivitis', 'Supportive care: cool compresses, lubricants, hygiene', SAGE_SOFT, SAGE],
      ['Allergic conjunctivitis', 'Mast cell stabiliser or antihistamine drops', SAGE_SOFT, SAGE],
      ['Herpes simplex keratitis', 'Antiviral; refer per local protocol', BUTTER, BUTTER_INK],
      ['Contact lens keratitis (ulcer)', 'Emergency referral, same day', ROSE_SOFT, ROSE],
      ['Anterior uveitis', 'Urgent referral: steroid and cycloplegic', ROSE_SOFT, ROSE],
    ]
    return (
      <g>
        <Arrowheads />
        <TBox x={10} y={180} w={110} h={60} text="Red eye" fill={ROSE_SOFT} ink={ROSE} size={15} />
        {rows.map(([cond, plan, fill, ink], i) => {
          const y = 10 + i * 68
          return (
            <g key={cond}>
              <PathArrow d={`M120 210 C150 210 150 ${y + 28} 176 ${y + 28}`} colour={MUTED} />
              <TBox x={180} y={y} w={200} h={56} text={cond} fill={LILAC_SOFT} />
              <Arrow x1={380} y1={y + 28} x2={408} y2={y + 28} colour={ink} />
              <TBox x={410} y={y} w={280} h={56} text={plan} fill={fill} ink={ink} size={12.5} />
            </g>
          )
        })}
      </g>
    )
  },
}

// ── Tables and charts ─────────────────────────────────────────────────

const redEyeDifferential: DiagramDef = {
  viewBox: [760, 360],
  caption: 'Typical features only — patients don’t read textbooks. Pain, reduced vision and photophobia are the red flags.',
  render: () => {
    const cols = ['Pain', 'Photophobia', 'Vision', 'Discharge', 'Pupil', 'Cornea', 'IOP']
    const rows: [string, string[], number][] = [
      ['Conjunctivitis', ['Gritty', 'No', 'Normal', 'Yes', 'Normal', 'Clear', 'Normal'], 0],
      ['Subconjunctival haemorrhage', ['None', 'No', 'Normal', 'No', 'Normal', 'Clear', 'Normal'], 0],
      ['Episcleritis', ['Mild ache', 'No', 'Normal', 'No', 'Normal', 'Clear', 'Normal'], 0],
      ['Scleritis', ['Severe, boring', 'Mild', 'May drop', 'No', 'Normal', 'Clear', 'Normal'], 2],
      ['Anterior uveitis', ['Ache', 'Marked', 'Normal or ↓', 'Watery', 'Small, irregular', 'KPs', 'Normal (can ↑)'], 1],
      ['Keratitis', ['Yes', 'Yes', '↓', 'Watery or pus', 'Normal', 'Stains, infiltrate', 'Normal'], 2],
      ['Acute angle closure', ['Severe', 'Yes', '↓, haloes', 'Watery', 'Mid-dilated, fixed', 'Hazy', 'Very high'], 2],
    ]
    const x0 = 170
    const cw = (760 - x0 - 10) / cols.length
    const rh = 40
    const urgent = [SAGE_SOFT, BUTTER, ROSE_SOFT]
    return (
      <g>
        {cols.map((c, j) => (
          <text key={c} x={x0 + j * cw + cw / 2} y={22} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={INK}>
            {c}
          </text>
        ))}
        {rows.map(([name, cells, level], i) => {
          const y = 36 + i * rh
          return (
            <g key={name}>
              <rect x={6} y={y} width={748} height={rh - 4} rx={8} fill={urgent[level]} />
              <Lines x={14} y={y + (rh - 4) / 2} text={name} max={20} size={12.5} weight={700} anchor="start" />
              {cells.map((c, j) => (
                <Lines key={j} x={x0 + j * cw + cw / 2} y={y + (rh - 4) / 2} text={c} max={11} size={11.5} />
              ))}
            </g>
          )
        })}
        <g transform="translate(6 330)">
          {(
            [
              [SAGE_SOFT, 'Usually managed in practice'],
              [BUTTER, 'Urgent'],
              [ROSE_SOFT, 'Same day / emergency'],
            ] as const
          ).map(([c, l], i) => (
            <g key={l} transform={`translate(${i * 220} 0)`}>
              <rect width={18} height={14} rx={4} fill={c} />
              <text x={26} y={8} dominantBaseline="middle" fontSize={12} fill={MUTED}>
                {l}
              </text>
            </g>
          ))}
        </g>
      </g>
    )
  },
}

const sightLossCauses: DiagramDef = {
  viewBox: [660, 290],
  caption: 'Illustrative proportions, not exact figures. Most sight loss from refractive error and cataract can be corrected or treated.',
  render: () => {
    const bars: [string, number, boolean][] = [
      ['Uncorrected refractive error', 39, true],
      ['AMD', 23, false],
      ['Cataract', 19, true],
      ['Glaucoma', 7, false],
      ['Diabetic eye disease', 5, false],
      ['Other', 7, false],
    ]
    return (
      <g>
        {bars.map(([name, v, fix], i) => {
          const y = 14 + i * 44
          return (
            <g key={name}>
              <text x={200} y={y + 15} textAnchor="end" dominantBaseline="middle" fontSize={13} fontWeight={600} fill={INK}>
                {name}
              </text>
              <rect x={210} y={y} width={v * 7} height={30} rx={6} fill={fix ? SAGE : LILAC} />
              {fix && (
                <text x={218 + v * 7} y={y + 15} dominantBaseline="middle" fontSize={12} fontWeight={700} fill={SAGE}>
                  largely correctable
                </text>
              )}
            </g>
          )
        })}
      </g>
    )
  },
}

const medicinesCategories: DiagramDef = {
  viewBox: [700, 380],
  caption: 'Simplified. Exactly which medicines each level can sell, supply or prescribe is set by the Medicines Act exemptions and the GOC specialty registers.',
  render: () => {
    const cats: [string, string][] = [
      ['Prescription Only (POM)', ROSE_SOFT],
      ['Pharmacy (P)', BUTTER],
      ['General Sales List (GSL)', SAGE_SOFT],
    ]
    const chip = (label: string, fill: string, x: number, y: number, w = 64) => (
      <g key={label + x}>
        <rect x={x} y={y} width={w} height={22} rx={11} fill={fill} />
        <text x={x + w / 2} y={y + 11} textAnchor="middle" dominantBaseline="middle" fontSize={11.5} fontWeight={700} fill={INK}>
          {label}
        </text>
      </g>
    )
    const levels: [string, string, [string, string, number][]][] = [
      ['All optometrists', 'Sell or supply GSL and P medicines, plus some named POMs (e.g. diagnostic drops)', [['GSL', SAGE_SOFT, 44], ['P', BUTTER, 30], ['Named POMs', ROSE_SOFT, 92]]],
      ['Additional Supply (AS)', 'As above, plus a wider list of named POMs', [['GSL', SAGE_SOFT, 44], ['P', BUTTER, 30], ['More named POMs', ROSE_SOFT, 120]]],
      ['Supplementary Prescribing (SP)', 'Prescribe within an agreed clinical management plan', [['Any medicine in the CMP', LILAC_SOFT, 170]]],
      ['Independent Prescribing (IP)', 'Prescribe any licensed medicine for eye conditions within competence (not controlled drugs)', [['POMs for eye conditions', ROSE_SOFT, 170]]],
    ]
    return (
      <g>
        {cats.map(([name, fill], i) => {
          const y = 20 + i * 110
          const inset = (2 - i) * 30
          return (
            <g key={name}>
              <path d={`M${20 + inset} ${y + 100} L${60 + inset} ${y} H${240 - inset} L${280 - inset} ${y + 100} Z`} fill={fill} />
              <Lines x={150} y={y + 50} text={name} max={16} size={13.5} weight={700} />
            </g>
          )
        })}
        {levels.map(([name, note, chips], i) => {
          const y = 14 + i * 90
          let cx = 316
          return (
            <g key={name}>
              <rect x={306} y={y} width={384} height={80} rx={12} fill={FIG.grey50c} />
              <text x={316} y={y + 18} dominantBaseline="middle" fontSize={13.5} fontWeight={700} fill={LILAC}>
                {name}
              </text>
              <Lines x={316} y={y + 39} text={note} max={58} size={11.5} anchor="start" weight={500} />
              {chips.map(([l, f, w]) => {
                const el = chip(l, f, cx, y + 52, w)
                cx += w + 6
                return el
              })}
            </g>
          )
        })}
      </g>
    )
  },
}

const barriersToCare: DiagramDef = {
  viewBox: [720, 300],
  caption: 'Each barrier has a practical fix most practices can offer.',
  render: () => {
    const pairs: [string, string][] = [
      ['Cost worries', 'Free NHS sight tests and vouchers'],
      ['Awareness', 'Health promotion'],
      ['Mobility, transport', 'Domiciliary care'],
      ['Language', 'Interpreters'],
      ['Fear', 'Clear explanation, time'],
      ['Disability access', 'Reasonable adjustments'],
    ]
    return (
      <g>
        <Arrowheads />
        <circle cx={40} cy={180} r={18} fill={LILAC} />
        <rect x={26} y={200} width={28} height={50} rx={10} fill={LILAC} />
        <text x={40} y={276} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={INK}>
          Patient
        </text>
        <rect x={650} y={150} width={60} height={100} rx={6} fill={SKY_SOFT} stroke={SKY} />
        <path d="M644 152 L680 120 L716 152" fill={SKY} />
        <text x={680} y={276} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={INK}>
          Practice
        </text>
        <line x1={70} y1={250} x2={640} y2={250} stroke={MUTED} strokeWidth={2} />
        {pairs.map(([barrier, fix], i) => {
          const x = 90 + i * 92
          return (
            <g key={barrier}>
              <rect x={x} y={200} width={70} height={50} fill={ROSE_SOFT} stroke={ROSE} />
              <line x1={x} y1={216} x2={x + 70} y2={216} stroke={ROSE} />
              <Lines x={x + 35} y={234} text={barrier} max={10} size={11} weight={700} fill={ROSE} />
              <path d={`M${x - 6} 196 Q${x + 35} 130 ${x + 76} 196`} fill="none" stroke={SAGE} strokeWidth={3} />
              <Lines x={x + 35} y={i % 2 ? 98 : 62} text={fix} max={13} size={11.5} weight={600} fill={SAGE} />
            </g>
          )
        })}
      </g>
    )
  },
}

// ── Graphs ────────────────────────────────────────────────────────────

const accommodationAge: DiagramDef = {
  viewBox: [660, 360],
  caption: 'Hofstetter’s formulae. Comfortable reading at 40 cm (2.50 D) needs about twice that in reserve, so trouble starts around 5 D.',
  render: () => {
    const g = { x: 70, y: 20, w: 540, h: 270 }
    const a = makeAxes({ ...g, xMin: 10, xMax: 70, yMin: 0, yMax: 22 })
    const line = (fn: (v: number) => number) => a.fnPath((v) => Math.max(0, fn(v)))
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Age (years)" yLabel="Amplitude (D)" xTicks={[10, 20, 30, 40, 50, 60, 70]} yTicks={[0, 5, 10, 15, 20]} />
        <line x1={a.px(10)} y1={a.py(5)} x2={a.px(70)} y2={a.py(5)} stroke={ROSE} strokeDasharray="6 5" />
        <T x={a.px(64)} y={a.py(5) - 12} size={12} fill={ROSE} anchor="end">
          Onset of presbyopia (~5 D)
        </T>
        <path d={line((v) => 25 - 0.4 * v)} fill="none" stroke={SKY} strokeWidth={2} strokeDasharray="4 3" />
        <path d={line((v) => 18.5 - 0.3 * v)} fill="none" stroke={LILAC} strokeWidth={3} />
        <path d={line((v) => 15 - 0.25 * v)} fill="none" stroke={SAGE} strokeWidth={2} strokeDasharray="4 3" />
        {(
          [
            [SKY, 'Maximum 25 − 0.4 × age', '4 3'],
            [LILAC, 'Average 18.5 − 0.3 × age', ''],
            [SAGE, 'Minimum 15 − 0.25 × age', '4 3'],
          ] as const
        ).map(([c, l, dash], i) => (
          <g key={l} transform={`translate(${a.px(46)} ${a.py(21) + i * 22})`}>
            <line x1={0} y1={0} x2={28} y2={0} stroke={c} strokeWidth={3} strokeDasharray={dash || undefined} />
            <text x={36} y={0} dominantBaseline="middle" fontSize={12} fontWeight={600} fill={c}>
              {l}
            </text>
          </g>
        ))}
      </g>
    )
  },
}

const csfCurve: DiagramDef = {
  viewBox: [660, 360],
  caption: 'Illustrative curves. Cataract lowers mid and high spatial frequencies first, so contrast loss can show before letters do.',
  render: () => {
    const g = { x: 80, y: 20, w: 530, h: 260 }
    const a = makeAxes({ ...g, xMin: 0.5, xMax: 60, yMin: 1, yMax: 400, xLog: true, yLog: true })
    const csf = (peak: number, fp: number, s: number) => (f: number) => Math.max(1, 10 ** (Math.log10(peak) - (Math.log10(f) - Math.log10(fp)) ** 2 / (2 * s * s)))
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Spatial frequency (c/deg, log scale)" yLabel="Contrast sensitivity (log)" xTicks={[0.5, 1, 2, 5, 10, 20, 50]} yTicks={[1, 10, 100]} />
        <path d={a.fnPath(csf(200, 4, 0.51), 0.5, 50)} fill="none" stroke={LILAC} strokeWidth={3} />
        <path d={a.fnPath(csf(110, 3, 0.45), 0.5, 26)} fill="none" stroke={BUTTER_INK} strokeWidth={2.5} strokeDasharray="6 4" />
        <T x={a.px(4)} y={a.py(200) - 14} size={12.5} fill={LILAC}>
          Normal: peak about 3–5 c/deg
        </T>
        <T x={a.px(2.4)} y={a.py(60) + 16} size={12.5} fill={BUTTER_INK}>
          Cataract
        </T>
        <line x1={a.px(50)} y1={a.py(1)} x2={a.px(50)} y2={a.py(8)} stroke={ROSE} strokeWidth={2} />
        <T x={a.px(44)} y={a.py(12)} size={12} fill={ROSE} anchor="end">
          Cut-off ≈ acuity limit
        </T>
      </g>
    )
  },
}

const coneSpectra: DiagramDef = {
  viewBox: [660, 400],
  caption: 'Sensitivity curves are illustrative. Opponent channels compare cone signals: colour comes from differences, brightness from the sum.',
  render: () => {
    const g = { x: 70, y: 20, w: 540, h: 200 }
    const a = makeAxes({ ...g, xMin: 400, xMax: 700, yMin: 0, yMax: 1.1 })
    const bell = (peak: number, sd: number) => (l: number) => Math.exp(-((l - peak) ** 2) / (2 * sd * sd))
    const curves: [string, number, number, string][] = [
      ['S (~420 nm)', 420, 28, SKY],
      ['M (~530 nm)', 530, 45, SAGE],
      ['L (~560 nm)', 560, 50, ROSE],
    ]
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Wavelength (nm)" yLabel="Relative sensitivity" xTicks={[400, 450, 500, 550, 600, 650, 700]} />
        {curves.map(([name, p, sd, c], i) => (
          <g key={name}>
            <path d={a.fnPath(bell(p, sd))} fill="none" stroke={c} strokeWidth={3} />
            <T x={a.px(p) + (i === 1 ? -8 : i === 2 ? 8 : 0)} y={a.py(1) - 10} size={12.5} fill={c} anchor={i === 1 ? 'end' : i === 2 ? 'start' : 'middle'}>
              {name}
            </T>
          </g>
        ))}
        {(
          [
            ['L − M', 'Red–green channel', ROSE_SOFT],
            ['S − (L + M)', 'Blue–yellow channel', SKY_SOFT],
            ['L + M', 'Luminance channel', FIG.grey100],
          ] as const
        ).map(([sum, name, fill], i) => (
          <g key={name}>
            <rect x={70 + i * 185} y={300} width={170} height={70} rx={12} fill={fill} />
            <T x={155 + i * 185} y={322} size={15}>
              {sum}
            </T>
            <T x={155 + i * 185} y={348} size={12.5} weight={500}>
              {name}
            </T>
          </g>
        ))}
      </g>
    )
  },
}

const darkAdaptationCurve: DiagramDef = {
  viewBox: [660, 360],
  caption: 'Lower threshold = more sensitive. Cones adapt fast but plateau; rods take over after the break and keep improving for 30–40 minutes.',
  render: () => {
    const g = { x: 80, y: 20, w: 520, h: 260 }
    const a = makeAxes({ ...g, xMin: 0, xMax: 40, yMin: 0, yMax: 5 })
    const cone = (t: number) => 2.6 + 2.2 * Math.exp(-t / 2.2)
    const rod = (t: number) => 0.6 + 2.2 * Math.exp(-(t - 8) / 7)
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Time in the dark (minutes)" yLabel="Threshold (log units)" xTicks={[0, 10, 20, 30, 40]} yTicks={[1, 2, 3, 4, 5]} />
        <path d={a.fnPath(cone, 0, 9)} fill="none" stroke={SAGE} strokeWidth={3} />
        <path d={a.fnPath(cone, 9, 25)} fill="none" stroke={SAGE} strokeWidth={2} strokeDasharray="4 4" />
        <path d={a.fnPath(rod, 8, 40)} fill="none" stroke={LILAC} strokeWidth={3} />
        <circle cx={a.px(8)} cy={a.py(rod(8))} r={6} fill={ROSE} />
        <T x={a.px(9)} y={a.py(rod(8)) - 18} size={12.5} fill={ROSE} anchor="start">
          Rod–cone break (~7–10 min)
        </T>
        <T x={a.px(2)} y={a.py(4.8) - 2} size={12.5} fill={SAGE} anchor="start">
          Cone branch
        </T>
        <T x={a.px(24)} y={a.py(rod(24)) - 16} size={12.5} fill={LILAC} anchor="start">
          Rod branch
        </T>
        <T x={a.px(39)} y={a.py(0.6) + 18} size={12} fill={LILAC} anchor="end">
          Final rod threshold
        </T>
      </g>
    )
  },
}

const psychometricFunction: DiagramDef = {
  viewBox: [660, 360],
  caption: 'Threshold is defined on the curve: 50% for yes/no, 75% for two-alternative forced choice, because guessing gives 50% already.',
  render: () => {
    const g = { x: 80, y: 20, w: 520, h: 260 }
    const a = makeAxes({ ...g, xMin: 0, xMax: 10, yMin: 0, yMax: 100 })
    const logistic = (mid: number, k: number, floor: number) => (v: number) => floor + (100 - floor) / (1 + Math.exp(-k * (v - mid)))
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Stimulus intensity" yLabel="% correct / detected" yTicks={[0, 25, 50, 75, 100]} />
        <path d={a.fnPath(logistic(4, 1.4, 0))} fill="none" stroke={LILAC} strokeWidth={3} />
        <path d={a.fnPath(logistic(5.5, 1.2, 50))} fill="none" stroke={SKY} strokeWidth={3} strokeDasharray="7 4" />
        <line x1={a.px(0)} y1={a.py(50)} x2={a.px(4)} y2={a.py(50)} stroke={LILAC} strokeDasharray="3 3" />
        <line x1={a.px(4)} y1={a.py(50)} x2={a.px(4)} y2={a.py(0)} stroke={LILAC} strokeDasharray="3 3" />
        <line x1={a.px(0)} y1={a.py(75)} x2={a.px(5.5)} y2={a.py(75)} stroke={SKY} strokeDasharray="3 3" />
        <line x1={a.px(5.5)} y1={a.py(75)} x2={a.px(5.5)} y2={a.py(0)} stroke={SKY} strokeDasharray="3 3" />
        <T x={a.px(4)} y={a.py(0) - 14} size={12} fill={LILAC}>
          Threshold (50%)
        </T>
        <T x={a.px(6.6)} y={a.py(75) + 14} size={12} fill={SKY} anchor="start">
          2AFC threshold (75%)
        </T>
        <T x={a.px(0.3)} y={a.py(50) - 14} size={12} fill={SKY} anchor="start">
          2AFC guessing rate (50%)
        </T>
        <T x={a.px(1.6)} y={a.py(12)} size={12.5} fill={LILAC} anchor="start">
          Yes/no
        </T>
        <T x={a.px(6.4)} y={a.py(30)} size={12} fill={MUTED} anchor="start">
          Slope: how sharp the change is
        </T>
      </g>
    )
  },
}

const dkWaterGraph: DiagramDef = {
  viewBox: [660, 370],
  caption: 'Illustrative values. Hydrogel Dk follows water content; silicone hydrogels carry oxygen through silicone, so Dk is high even at low water. Thresholds are Holden–Mertz Dk/t values (numerically equal to Dk for a 0.1 mm lens).',
  render: () => {
    const g = { x: 80, y: 20, w: 520, h: 270 }
    const a = makeAxes({ ...g, xMin: 20, xMax: 80, yMin: 0, yMax: 160 })
    const hydrogel = (w: number) => 2 * Math.exp(0.0411 * w)
    const sihy: [number, number][] = [
      [24, 140],
      [33, 110],
      [36, 128],
      [38, 100],
      [46, 60],
      [48, 103],
      [55, 60],
    ]
    return (
      <g>
        <Arrowheads />
        <Axes {...g} px={a.px} py={a.py} xLabel="Water content (%)" yLabel="Dk" xTicks={[20, 30, 40, 50, 60, 70, 80]} yTicks={[0, 40, 80, 120, 160]} />
        <line x1={a.px(20)} y1={a.py(24)} x2={a.px(80)} y2={a.py(24)} stroke={BUTTER_INK} strokeDasharray="6 5" />
        <T x={a.px(79)} y={a.py(24) + 13} size={12} fill={BUTTER_INK} anchor="end">
          Daily wear ≈ 24 Dk/t
        </T>
        <line x1={a.px(20)} y1={a.py(87)} x2={a.px(80)} y2={a.py(87)} stroke={ROSE} strokeDasharray="6 5" />
        <T x={a.px(79)} y={a.py(87) - 11} size={12} fill={ROSE} anchor="end">
          Overnight wear ≈ 87 Dk/t
        </T>
        <path d={a.fnPath(hydrogel, 30, 78)} fill="none" stroke={SKY} strokeWidth={3} />
        <T x={a.px(52)} y={a.py(hydrogel(52)) - 26} size={12.5} fill={SKY}>
          Hydrogel: Dk rises with water
        </T>
        {sihy.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={a.px(x)} cy={a.py(y)} r={6} fill={LILAC} />
        ))}
        <T x={a.px(40)} y={a.py(148)} size={12.5} fill={LILAC} anchor="start">
          Silicone hydrogels: high Dk, lower water
        </T>
      </g>
    )
  },
}

export const CHART_DIAGRAMS: Record<string, DiagramDef> = {
  'refraction-flow': refractionFlow,
  'eye-exam-flow': eyeExamFlow,
  'path-to-registration': pathToRegistration,
  'lv-assessment-flow': lvAssessmentFlow,
  'apology-structure': apologyStructure,
  'placement-year-timeline': placementYearTimeline,
  'child-tests-by-age': childTestsByAge,
  'cyclo-timeline': cycloTimeline,
  'raising-concerns-ladder': raisingConcernsLadder,
  'career-ladder': careerLadder,
  'history-structure': historyStructure,
  imrad,
  'prescribing-process': prescribingProcess,
  'eye-care-team': eyeCareTeam,
  'goc-themes': gocThemes,
  'sp-partnership': spPartnership,
  'safeguarding-flow': safeguardingFlow,
  'certification-pathway': certificationPathway,
  'glaucoma-referral-flow': glaucomaReferralFlow,
  'red-eye-triage': redEyeTriage,
  'red-eye-treatment': redEyeTreatment,
  'red-eye-differential': redEyeDifferential,
  'sight-loss-causes': sightLossCauses,
  'medicines-categories': medicinesCategories,
  'barriers-to-care': barriersToCare,
  'accommodation-age': accommodationAge,
  'csf-curve': csfCurve,
  'cone-spectra': coneSpectra,
  'dark-adaptation-curve': darkAdaptationCurve,
  'psychometric-function': psychometricFunction,
  'dk-water-graph': dkWaterGraph,
}
