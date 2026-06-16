export type FeedItem = {
  id: string
  title: string
  body: string
  theme: string
}

const topics: Omit<FeedItem, "id">[] = [
  {
    title: "Medication errors — what to do, reporting, root cause",
    theme: "Medication",
    body: "Making a medication mistake is stressful, but what you do in the next few minutes matters more than the mistake itself.",
  },
  {
    title: "Medication refusals — process, documentation, escalation",
    theme: "Medication",
    body: "When a service user refuses medication, follow the agreed process, document clearly, and escalate when needed.",
  },
  {
    title: "Medication administration — correct procedure, the six rights",
    theme: "Medication",
    body: "Right person, right drug, right dose, right route, right time, and right documentation — every single time.",
  },
  {
    title: "Controlled drugs — storage, counting, handover, documentation",
    theme: "Medication",
    body: "Controlled drugs require strict storage, accurate counts, and complete handover records at every shift change.",
  },
  {
    title: "Medication storage — temperatures, fridge checks, room conditions",
    theme: "Medication",
    body: "Check fridge temperatures daily and keep room-temperature medicines in suitable, secure conditions.",
  },
  {
    title: "Medication competency assessments — frequency, sign-off process",
    theme: "Medication",
    body: "Staff must be assessed and signed off before administering medicines independently.",
  },
  {
    title: "Covert medication — policy, best interest, documentation",
    theme: "Medication",
    body: "Covert administration is only lawful when it follows policy, a best-interest decision, and full documentation.",
  },
  {
    title: "PRN (as required) medication — protocols, reviewing, recording",
    theme: "Medication",
    body: "PRN medicines need clear protocols, regular review, and accurate recording of every administration.",
  },
  {
    title: "Missed medication — what to do, reporting",
    theme: "Medication",
    body: "If a dose is missed, report it promptly and seek clinical advice before the next scheduled dose.",
  },
  {
    title: "Medication audits — how to conduct, frequency, forms",
    theme: "Medication",
    body: "Regular medication audits help identify risks early and keep administration safe and compliant.",
  },
  {
    title: "Self-administration of medication — risk assessment, MAR charts",
    theme: "Medication",
    body: "Self-administration is only appropriate after a documented risk assessment and clear support plan.",
  },
  {
    title: "Disposing of medication — procedure for unused or expired stock",
    theme: "Medication",
    body: "Unused or expired medicines must be disposed of through the approved pharmacy process — never in household waste.",
  },
  {
    title: "Medication received from pharmacy — booking in, stock checks",
    theme: "Medication",
    body: "Book in pharmacy deliveries immediately, check against the order, and store medicines correctly.",
  },
  {
    title: "Recognising and reporting abuse — signs, types, who to tell",
    theme: "Safeguarding",
    body: "Know the signs of abuse, act on concerns without delay, and report through your safeguarding pathway.",
  },
  {
    title: "Safeguarding adults — policy overview, principles, legislation",
    theme: "Safeguarding",
    body: "Safeguarding is everyone's responsibility — empowerment, prevention, and proportionality guide every decision.",
  },
  {
    title: "Safeguarding children — reporting, thresholds, local contacts",
    theme: "Safeguarding",
    body: "If you suspect a child is at risk, report immediately using local safeguarding contacts and procedures.",
  },
  {
    title: "Whistleblowing — when to use it, protections, process",
    theme: "Safeguarding",
    body: "Whistleblowing protects people when internal reporting has not resolved serious concerns.",
  },
  {
    title: "Mental Capacity Act — principles, assessment, best interest decisions",
    theme: "Safeguarding",
    body: "Assume capacity unless proven otherwise, support decision-making, and record best-interest decisions clearly.",
  },
  {
    title: "DoLS — when to apply, process",
    theme: "Safeguarding",
    body: "Deprivation of Liberty Safeguards apply when someone lacks capacity and is under continuous supervision and control.",
  },
  {
    title: "Restraint and restrictive practices — policy, legislation, documentation",
    theme: "Safeguarding",
    body: "Any restraint must be lawful, necessary, proportionate, and fully documented afterwards.",
  },
  {
    title: "What to do when a service user falls — immediate steps, escalation",
    theme: "Falls & incidents",
    body: "Stay calm, do not move them unless unsafe, check for injury, and escalate according to your post-fall protocol.",
  },
  {
    title: "Incident and accident reporting — what counts, how to record",
    theme: "Falls & incidents",
    body: "Record all incidents and near-misses factually and promptly so patterns can be reviewed and prevented.",
  },
  {
    title: "Falls risk assessment — tools, frequency, post-fall monitoring",
    theme: "Falls & incidents",
    body: "Assess falls risk on admission and after any change in health, mobility, or medication.",
  },
  {
    title: "Head injuries following a fall — observation, escalation",
    theme: "Falls & incidents",
    body: "After a head injury, monitor closely for changing symptoms and escalate urgently if red flags appear.",
  },
  {
    title: "RIDDOR reporting — what triggers a report, who submits it",
    theme: "Falls & incidents",
    body: "Certain work-related injuries and dangerous occurrences must be reported to the HSE under RIDDOR.",
  },
  {
    title: "Infection control procedures — standard precautions, hand hygiene",
    theme: "Infection control",
    body: "Hand hygiene and standard precautions are the foundation of safe care in every interaction.",
  },
  {
    title: "PPE — correct use, donning and doffing, disposal",
    theme: "Infection control",
    body: "Use the right PPE for the task, don and doff in the correct order, and dispose of it safely.",
  },
  {
    title: "Outbreak management — isolation, cleaning, notifications",
    theme: "Infection control",
    body: "During an outbreak, isolate affected areas, intensify cleaning, and notify managers and public health as required.",
  },
  {
    title: "Wound and skin conditions — observation, escalation, documentation",
    theme: "Infection control",
    body: "Inspect skin regularly, document changes, and escalate early when wounds show signs of deterioration or infection.",
  },
  {
    title: "Safe moving and handling — technique, risk assessment, legislation",
    theme: "Moving & handling",
    body: "Plan every move, use equipment when needed, and never lift beyond your training and assessment.",
  },
  {
    title: "Hoist and sling use — safe use, checks, competency",
    theme: "Moving & handling",
    body: "Check slings and hoists before every use, match the sling to the person, and only operate if trained.",
  },
  {
    title: "Bed rails — risk assessment, consent, checking frequency",
    theme: "Moving & handling",
    body: "Bed rails are a restrictive practice — assess risk, obtain consent where possible, and check frequently.",
  },
  {
    title: "Sickness absence — reporting procedure, self-certification, SSP",
    theme: "HR & employment",
    body: "Report sickness absence as soon as possible and follow your employer's certification requirements.",
  },
  {
    title: "Disciplinary procedure — stages, gross misconduct, appeals",
    theme: "HR & employment",
    body: "Disciplinary processes must be fair, documented, and give staff the right to be heard and to appeal.",
  },
  {
    title: "Grievance procedure — how to raise, timescales, outcomes",
    theme: "HR & employment",
    body: "Staff can raise grievances formally when informal resolution has not worked — know the timescales.",
  },
  {
    title: "Annual leave — entitlement, booking notice, carry-over",
    theme: "HR & employment",
    body: "Book annual leave in advance where possible and check your entitlement and carry-over rules.",
  },
  {
    title: "Maternity leave — entitlement, pay, risk assessment, return to work",
    theme: "HR & employment",
    body: "Pregnant staff are entitled to risk assessments and protected maternity leave in line with policy and law.",
  },
  {
    title: "Probationary period — review process, extension, ending employment",
    theme: "HR & employment",
    body: "Probation reviews should be structured, documented, and focused on support as well as performance.",
  },
  {
    title: "Staff conduct and professional boundaries — expectations, breaches",
    theme: "HR & employment",
    body: "Maintain professional boundaries at all times — breaches can harm people and damage trust in care.",
  },
  {
    title: "Safer recruitment — DBS checks, references, right to work",
    theme: "HR & employment",
    body: "Recruitment must verify identity, right to work, references, and appropriate DBS checks before start.",
  },
  {
    title: "Care plan content and reviews — what to include, how often",
    theme: "Care planning",
    body: "Care plans must reflect the person's wishes, risks, and goals — review them whenever needs change.",
  },
  {
    title: "Risk assessment — types, templates, when to update",
    theme: "Care planning",
    body: "Update risk assessments after incidents, hospital admissions, or any significant change in circumstances.",
  },
  {
    title: "Consent to care — how to obtain, when needed, documentation",
    theme: "Care planning",
    body: "Seek informed consent for care and treatment wherever the person has capacity to decide.",
  },
  {
    title: "Mental health and wellbeing of service users — policy, escalation",
    theme: "Care planning",
    body: "Monitor emotional wellbeing as closely as physical health, and escalate when mood or behaviour changes.",
  },
  {
    title: "End of life care — documentation, DNAR, palliative care pathway",
    theme: "Care planning",
    body: "End of life plans must be person-centred, clearly documented, and shared with everyone providing care.",
  },
  {
    title: "Fire safety — evacuation procedure, fire checks, drills",
    theme: "Health & safety",
    body: "Know your evacuation route, complete fire checks, and take part in drills without exception.",
  },
  {
    title: "COSHH — hazardous substances, safety data sheets, risk assessment",
    theme: "Health & safety",
    body: "Use safety data sheets and COSHH assessments before handling any hazardous cleaning or clinical substances.",
  },
  {
    title: "Lone working — risk assessment, check-in procedures, safeguards",
    theme: "Health & safety",
    body: "Lone workers need agreed check-in procedures and a risk assessment that covers real-world scenarios.",
  },
  {
    title: "Food safety and nutrition — hydration, dietary needs, kitchen hygiene",
    theme: "Health & safety",
    body: "Support adequate nutrition and hydration, respect dietary needs, and maintain kitchen hygiene standards.",
  },
  {
    title: "Record keeping and documentation — what to record, accuracy, retention",
    theme: "Record keeping",
    body: "Accurate, timely records protect people, demonstrate care quality, and must be retained per policy.",
  },
]

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

export function getFeedItems(options?: { shuffle?: boolean }): FeedItem[] {
  const items = topics.map((topic, index) => ({
    id: `topic-${String(index + 1).padStart(2, "0")}`,
    ...topic,
  }))

  return options?.shuffle ? shuffle(items) : items
}
