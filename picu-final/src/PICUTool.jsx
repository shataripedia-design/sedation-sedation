import { useState, useMemo } from "react";

const DRUGS = [
  {
    id: "midazolam", name: "Midazolam", category: "sedation", class: "Benzodiazepine",
    routes: ["IV"],
    doses: [
      { label: "Intermittent (procedural)", min: 0.05, max: 0.1, unit: "mg/kg/dose", route: "IV", note: "Max 2 mg/dose neonates; titrate slowly" },
      { label: "Continuous infusion", min: 0.02, max: 0.1, unit: "mg/kg/hr", route: "IV", note: "Start low; tolerance develops rapidly" },
    ],
    warnings: ["Respiratory depression — ensure airway management available", "Accumulation in renal/hepatic failure", "Propylene glycol toxicity with prolonged high-dose infusions"],
    monitoring: ["Respiratory rate & SpO₂", "RASS/COMFORT-B q4h", "Propylene glycol levels if infusion >72h at high doses"],
    reversible: true, reversal: "Flumazenil",
  },
  {
    id: "lorazepam", name: "Lorazepam", category: "sedation", class: "Benzodiazepine",
    routes: ["IV", "PO"],
    doses: [
      { label: "Intermittent", min: 0.05, max: 0.1, unit: "mg/kg/dose", route: "IV", note: "Max 4 mg/dose; q4–6h PRN" },
    ],
    warnings: ["Propylene glycol toxicity with prolonged use", "Less accumulation than midazolam in renal failure"],
    monitoring: ["RASS/COMFORT-B", "Propylene glycol if prolonged use", "LFTs"],
    reversible: true, reversal: "Flumazenil",
  },
  {
    id: "dexmedetomidine", name: "Dexmedetomidine", category: "sedation", class: "α₂-Agonist",
    routes: ["IV"],
    doses: [
      { label: "Loading (optional)", min: 0.5, max: 1.0, unit: "mcg/kg", route: "IV", note: "Over 10 min; omit if hemodynamically unstable" },
      { label: "Continuous infusion", min: 0.2, max: 1.5, unit: "mcg/kg/hr", route: "IV", note: "No respiratory depression; co-analgesia effect" },
    ],
    warnings: ["Bradycardia and hypotension — especially with loading dose", "Rebound hypertension/agitation with abrupt discontinuation", "Not for neonates <1 month (limited data)"],
    monitoring: ["HR, BP q1h initially", "RASS/COMFORT-B", "ECG if bradycardia"],
    reversible: false,
  },
  {
    id: "propofol", name: "Propofol", category: "sedation", class: "Alkylphenol",
    routes: ["IV"],
    doses: [
      { label: "Procedural sedation", min: 1, max: 2, unit: "mg/kg", route: "IV", note: "Titrate 0.5 mg/kg q3 min; short procedures only" },
      { label: "Infusion (ICU — use with caution)", min: 0.5, max: 4, unit: "mg/kg/hr", route: "IV", note: "⚠️ Risk of PRIS. Avoid prolonged high-dose in children." },
    ],
    warnings: ["⚠️ PROPOFOL INFUSION SYNDROME (PRIS) — avoid >4 mg/kg/hr or >48h in pediatrics", "Metabolic acidosis, rhabdomyolysis, cardiac failure — monitor lipids, CK, lactate", "Lipid vehicle — account for caloric load"],
    monitoring: ["Triglycerides", "CK, lactate q12h on infusion", "Urine color (myoglobinuria)", "RASS/COMFORT-B"],
    reversible: false,
  },
  {
    id: "ketamine", name: "Ketamine", category: "sedation", class: "NMDA Antagonist",
    routes: ["IV", "IM", "PO"],
    doses: [
      { label: "Procedural (IV)", min: 1, max: 2, unit: "mg/kg", route: "IV", note: "Over 1–2 min; give atropine 0.01 mg/kg if needed" },
      { label: "Procedural (IM)", min: 4, max: 6, unit: "mg/kg", route: "IM", note: "Onset 3–5 min" },
      { label: "Analgosedation infusion", min: 0.1, max: 0.5, unit: "mg/kg/hr", route: "IV", note: "Sub-dissociative; excellent for burn/procedure pain" },
    ],
    warnings: ["Laryngospasm — rare but have airway equipment ready", "Emergence phenomena/hallucinations — co-administer midazolam", "Use cautiously if raised ICP (controversial — may be safe)"],
    monitoring: ["Airway, SpO₂", "HR, BP", "Emergence reactions on recovery"],
    reversible: false,
  },
  {
    id: "chloral-hydrate", name: "Chloral Hydrate", category: "sedation", class: "Sedative-Hypnotic",
    routes: ["PO", "PR"],
    doses: [
      { label: "Procedural sedation", min: 25, max: 75, unit: "mg/kg/dose", route: "PO", note: "Max 1g/dose; for imaging/EEG. Delayed onset 30–60 min." },
    ],
    warnings: ["Respiratory depression and airway obstruction", "Avoid in cardiac/liver disease", "No reversal agent"],
    monitoring: ["SpO₂ continuous", "Level of consciousness", "Respiratory rate"],
    reversible: false,
  },
  {
    id: "morphine", name: "Morphine", category: "analgesia", class: "Opioid",
    routes: ["IV", "PO"],
    doses: [
      { label: "Intermittent IV", min: 0.05, max: 0.1, unit: "mg/kg/dose", route: "IV", note: "q2–4h; titrate to FLACC/NRS" },
      { label: "Continuous infusion", min: 0.01, max: 0.04, unit: "mg/kg/hr", route: "IV", note: "Neonates start 0.005–0.01 mg/kg/hr" },
    ],
    warnings: ["Respiratory depression — have naloxone at bedside", "Histamine release — may worsen bronchospasm", "Accumulation of active metabolites in renal failure (M6G)"],
    monitoring: ["SpO₂, RR", "Pain scores q4h (FLACC <3y, NRS ≥3y)", "Bowel function"],
    reversible: true, reversal: "Naloxone",
  },
  {
    id: "fentanyl", name: "Fentanyl", category: "analgesia", class: "Opioid",
    routes: ["IV"],
    doses: [
      { label: "Intermittent IV (acute)", min: 1, max: 2, unit: "mcg/kg/dose", route: "IV", note: "Over 5–10 min; rapid onset" },
      { label: "Continuous infusion", min: 1, max: 4, unit: "mcg/kg/hr", route: "IV", note: "Preferred in renal failure over morphine" },
    ],
    warnings: ["Chest wall rigidity with rapid high-dose bolus (wooden chest)", "No histamine release — preferred in hemodynamic instability", "Tolerance develops rapidly"],
    monitoring: ["SpO₂, RR", "Pain scores", "Withdrawal assessment if prolonged use (WAT-1)"],
    reversible: true, reversal: "Naloxone",
  },
  {
    id: "hydromorphone", name: "Hydromorphone", category: "analgesia", class: "Opioid",
    routes: ["IV", "PO"],
    doses: [
      { label: "Intermittent IV", min: 0.01, max: 0.02, unit: "mg/kg/dose", route: "IV", note: "q3–4h; 5–7× more potent than morphine" },
      { label: "Continuous infusion", min: 0.004, max: 0.008, unit: "mg/kg/hr", route: "IV", note: "" },
    ],
    warnings: ["Neuroexcitation with high doses/renal failure (norhydromorphone accumulation)", "Potency — double-check conversions from morphine"],
    monitoring: ["SpO₂, RR", "Sedation level", "Pain scores"],
    reversible: true, reversal: "Naloxone",
  },
  {
    id: "acetaminophen", name: "Acetaminophen (Paracetamol)", category: "analgesia", class: "Non-opioid",
    routes: ["IV", "PO", "PR"],
    doses: [
      { label: "PO/IV (term–12y)", min: 10, max: 15, unit: "mg/kg/dose", route: "PO/IV", note: "q4–6h; max 75 mg/kg/day or 4g/day" },
      { label: "PO (>12y / >50 kg)", min: 500, max: 1000, unit: "mg/dose", route: "PO", note: "Fixed dose; q4–6h" },
      { label: "Rectal (term neonates)", min: 20, max: 25, unit: "mg/kg/dose", route: "PR", note: "q8–12h; lower frequency due to erratic absorption" },
    ],
    warnings: ["Hepatotoxicity in overdose or liver disease — know max daily dose", "IV formulation much more bioavailable — do not convert PO dose to IV 1:1 in <50 kg"],
    monitoring: ["LFTs if prolonged use", "Total daily dose calculation"],
    reversible: false,
  },
  {
    id: "ibuprofen", name: "Ibuprofen", category: "analgesia", class: "NSAID",
    routes: ["PO", "IV"],
    doses: [
      { label: "PO (≥6 months)", min: 5, max: 10, unit: "mg/kg/dose", route: "PO", note: "q6–8h; max 40 mg/kg/day or 2.4g/day" },
    ],
    warnings: ["Avoid if renal impairment, dehydration, or hemodynamic instability", "GI bleeding risk — use with mucosal protection", "Avoid in platelet dysfunction or coagulopathy"],
    monitoring: ["Renal function", "GI symptoms", "Platelet function"],
    reversible: false,
  },
  {
    id: "ketamine-analgesia", name: "Ketamine (sub-dissociative)", category: "analgesia", class: "NMDA Antagonist",
    routes: ["IV"],
    doses: [
      { label: "Opioid-sparing adjunct", min: 0.1, max: 0.3, unit: "mg/kg/hr", route: "IV", note: "Sub-dissociative; reduces opioid requirement" },
    ],
    warnings: ["Emergence reactions at higher doses", "Dysphoria — consider low-dose midazolam or dexmedetomidine adjunct"],
    monitoring: ["Pain scores", "Behavioral observation", "HR/BP"],
    reversible: false,
  },
  {
    id: "rocuronium", name: "Rocuronium", category: "nmb", class: "Aminosteroidal NDNMB",
    routes: ["IV"],
    doses: [
      { label: "RSI intubation", min: 1.2, max: 1.2, unit: "mg/kg", route: "IV", note: "High-dose for RSI; onset ~60 sec" },
      { label: "Maintenance bolus", min: 0.3, max: 0.6, unit: "mg/kg", route: "IV", note: "Redose q30–60 min guided by TOF" },
      { label: "Continuous infusion", min: 0.3, max: 0.6, unit: "mg/kg/hr", route: "IV", note: "Use TOF monitoring to guide" },
    ],
    warnings: ["⚠️ ALWAYS ensure adequate sedation and analgesia before NMB", "Patient cannot signal pain or distress", "Sugammadex reversal available for aminosteroidal agents"],
    monitoring: ["Train-of-Four (TOF) — aim 1–2 twitches", "Daily sedation assessment", "Eye care, positioning, DVT prophylaxis"],
    reversible: true, reversal: "Sugammadex",
  },
  {
    id: "vecuronium", name: "Vecuronium", category: "nmb", class: "Aminosteroidal NDNMB",
    routes: ["IV"],
    doses: [
      { label: "Intermittent bolus", min: 0.05, max: 0.1, unit: "mg/kg", route: "IV", note: "q30–60 min" },
      { label: "Continuous infusion", min: 0.05, max: 0.1, unit: "mg/kg/hr", route: "IV", note: "Active metabolite accumulates in renal failure" },
    ],
    warnings: ["Active metabolite (3-desacetylvecuronium) accumulates in renal failure — prolonged paralysis", "Aminosteroidal — reversible with sugammadex"],
    monitoring: ["TOF monitoring", "Renal function"],
    reversible: true, reversal: "Sugammadex",
  },
  {
    id: "cisatracurium", name: "Cisatracurium", category: "nmb", class: "Benzylisoquinoline NDNMB",
    routes: ["IV"],
    doses: [
      { label: "Intubation bolus", min: 0.1, max: 0.2, unit: "mg/kg", route: "IV", note: "Slower onset ~3–5 min vs rocuronium" },
      { label: "Continuous infusion", min: 1, max: 3, unit: "mcg/kg/min", route: "IV", note: "Hofmann elimination — preferred in organ failure" },
    ],
    warnings: ["Hofmann elimination — organ-independent metabolism; preferred in multi-organ failure", "No reversal with sugammadex — use neostigmine/glycopyrrolate", "Histamine release less than atracurium"],
    monitoring: ["TOF monitoring", "No organ-specific concerns"],
    reversible: true, reversal: "Neostigmine + Glycopyrrolate",
  },
  {
    id: "succinylcholine", name: "Succinylcholine", category: "nmb", class: "Depolarizing NMB",
    routes: ["IV", "IM"],
    doses: [
      { label: "RSI — infants/children", min: 2, max: 2, unit: "mg/kg", route: "IV", note: "Higher dose in infants due to volume of distribution" },
      { label: "RSI — adolescents/adults", min: 1, max: 1.5, unit: "mg/kg", route: "IV", note: "" },
      { label: "IM (no IV access)", min: 4, max: 5, unit: "mg/kg", route: "IM", note: "Max 150 mg; longer onset" },
    ],
    warnings: ["⚠️ CONTRAINDICATED in hyperkalemia, burns >48h, crush injury, denervation, muscular dystrophy, myopathy", "⚠️ May trigger malignant hyperthermia", "Bradycardia — especially with repeat doses; pretreat with atropine in children <5y", "Masseter spasm — early sign of MH"],
    monitoring: ["K⁺ level before use if any risk factors", "HR monitoring", "Fasciculations"],
    reversible: false,
  },
  {
    id: "flumazenil", name: "Flumazenil", category: "reversal", class: "Benzo Antagonist",
    routes: ["IV"],
    doses: [
      { label: "Benzodiazepine reversal", min: 0.01, max: 0.02, unit: "mg/kg/dose", route: "IV", note: "Max 0.2 mg/dose; repeat q1 min up to 1 mg total. Short half-life — re-sedation likely." },
    ],
    warnings: ["Re-sedation common (half-life shorter than benzodiazepines)", "Can precipitate seizures in benzo-dependent patients", "Not a substitute for airway management"],
    monitoring: ["Respiratory status", "Consciousness level", "Re-sedation for ≥2h post-dose"],
    reversible: false,
  },
  {
    id: "naloxone", name: "Naloxone", category: "reversal", class: "Opioid Antagonist",
    routes: ["IV", "IM", "IN"],
    doses: [
      { label: "Respiratory depression (IV)", min: 0.01, max: 0.01, unit: "mg/kg/dose", route: "IV", note: "Titrate: start low to avoid acute withdrawal/pain crisis; q2–3 min PRN" },
      { label: "Full reversal (IV)", min: 0.1, max: 0.1, unit: "mg/kg", route: "IV", note: "Max 2 mg; for unresponsive overdose" },
      { label: "Infusion (if prolonged opioid)", min: 0.0025, max: 0.005, unit: "mg/kg/hr", route: "IV", note: "2/3 of reversal dose per hour" },
    ],
    warnings: ["Acute opioid withdrawal — agitation, pulmonary edema, cardiac arrhythmia", "Half-life shorter than most opioids — repeat dosing or infusion needed", "Titrate carefully in opioid-dependent patients"],
    monitoring: ["Pain score — avoid under-reversal or over-reversal", "HR, BP", "Withdrawal signs"],
    reversible: false,
  },
  {
    id: "sugammadex", name: "Sugammadex", category: "reversal", class: "Selective NMB Binder",
    routes: ["IV"],
    doses: [
      { label: "Routine reversal (TOF ≥2)", min: 2, max: 2, unit: "mg/kg", route: "IV", note: "For rocuronium/vecuronium" },
      { label: "Deep block (TOF = 0)", min: 4, max: 16, unit: "mg/kg", route: "IV", note: "16 mg/kg for immediate reversal of 1.2 mg/kg rocuronium RSI" },
    ],
    warnings: ["Only reverses aminosteroidal NMBs (rocuronium, vecuronium) — NOT cisatracurium or succinylcholine", "Bradycardia and hypotension possible", "Avoid with toremifene (competitively binds)"],
    monitoring: ["TOF post-reversal — confirm ≥4 twitches with ratio >0.9", "SpO₂, RR", "HR, BP"],
    reversible: false,
  },
  {
    id: "neostigmine", name: "Neostigmine + Glycopyrrolate", category: "reversal", class: "Cholinesterase Inhibitor",
    routes: ["IV"],
    doses: [
      { label: "NMB reversal (neostigmine)", min: 0.04, max: 0.07, unit: "mg/kg", route: "IV", note: "Always co-administer glycopyrrolate or atropine" },
      { label: "Glycopyrrolate (co-admin)", min: 0.008, max: 0.01, unit: "mg/kg", route: "IV", note: "Give immediately with/before neostigmine" },
    ],
    warnings: ["Muscarinic effects — bradycardia, bronchospasm, secretions", "Must co-administer anticholinergic (glycopyrrolate preferred over atropine)", "Only effective at TOF ≥2 twitches — incomplete reversal at deep block"],
    monitoring: ["TOF ≥4 with ratio >0.9 before extubation", "HR, SpO₂", "Bronchospasm"],
    reversible: false,
  },
];

const SCALES = [
  {
    id: "rass", name: "RASS", full: "Richmond Agitation-Sedation Scale", ageGroup: "≥5 years",
    description: "Standard ICU sedation assessment. Target score typically −1 to −2 for mechanically ventilated patients.",
    items: [
      { score: "+4", label: "Combative", description: "Overtly combative, violent, immediate danger to staff" },
      { score: "+3", label: "Very Agitated", description: "Pulls or removes tube(s) or catheter(s), aggressive" },
      { score: "+2", label: "Agitated", description: "Frequent non-purposeful movement, fights ventilator" },
      { score: "+1", label: "Restless", description: "Anxious but movements not aggressive or vigorous" },
      { score: "0", label: "Alert & Calm", description: "Spontaneously pays attention to caregiver" },
      { score: "−1", label: "Drowsy", description: "Not fully alert but sustained awakening (>10 sec)" },
      { score: "−2", label: "Light Sedation", description: "Briefly awakens with eye contact (<10 sec)" },
      { score: "−3", label: "Moderate Sedation", description: "Movement or eye opening to voice, no eye contact" },
      { score: "−4", label: "Deep Sedation", description: "No response to voice, movement to physical stim" },
      { score: "−5", label: "Unarousable", description: "No response to voice or physical stimulation" },
    ],
    target: "Target: −1 to −2 for most ventilated patients; 0 to −1 for non-invasive support",
  },
  {
    id: "comfort-b", name: "COMFORT-B", full: "COMFORT Behavioral Scale", ageGroup: "0–17 years",
    description: "Validated behavioral sedation scale for neonates and children. Score 6–30; target 11–22 for adequate sedation.",
    items: [
      { score: "1–5", label: "Alertness", description: "1=deeply asleep → 5=fully awake/hyperalert" },
      { score: "1–5", label: "Calmness/Agitation", description: "1=calm → 5=extremely agitated" },
      { score: "1–5", label: "Respiratory Response", description: "1=no response to vent → 5=fighting vent (intubated)" },
      { score: "1–5", label: "Body Movement", description: "1=no movement → 5=vigorous movement" },
      { score: "1–5", label: "Facial Tension", description: "1=fully relaxed → 5=facial muscles tense throughout" },
      { score: "1–5", label: "Muscle Tone", description: "1=no muscle tone → 5=extreme muscle rigidity" },
    ],
    target: "Target: 11–22 (adequate sedation). >22 = undersedated. <11 = oversedated.",
  },
  {
    id: "flacc", name: "FLACC", full: "Face, Legs, Activity, Cry, Consolability", ageGroup: "2 months – 7 years",
    description: "Behavioral pain assessment. Score 0–10. Each category scored 0–2.",
    items: [
      { score: "0–2", label: "Face", description: "0=no expression → 2=frequent grimace/clenched jaw" },
      { score: "0–2", label: "Legs", description: "0=normal/relaxed → 2=kicking or legs drawn up" },
      { score: "0–2", label: "Activity", description: "0=lying quietly → 2=arched, rigid, or jerking" },
      { score: "0–2", label: "Cry", description: "0=no cry → 2=crying steadily/screaming" },
      { score: "0–2", label: "Consolability", description: "0=content/relaxed → 2=difficult to console" },
    ],
    target: "0=Relaxed; 1–3=Mild; 4–6=Moderate; 7–10=Severe pain. Target ≤3.",
  },
  {
    id: "nrs", name: "NRS", full: "Numeric Rating Scale", ageGroup: "≥7 years (self-report)",
    description: "Self-reported pain score 0–10. Use in cognitively intact children ≥7 years.",
    items: [
      { score: "0", label: "No pain", description: "" },
      { score: "1–3", label: "Mild", description: "Pain is present but tolerable" },
      { score: "4–6", label: "Moderate", description: "Significant pain; intervention warranted" },
      { score: "7–10", label: "Severe", description: "Overwhelming pain; urgent intervention" },
    ],
    target: "Target: ≤3 for comfort. Reassess within 30–60 min after intervention.",
  },
  {
    id: "cpot", name: "CPOT", full: "Critical Care Pain Observation Tool", ageGroup: "Adolescents/Adults (≥12y)",
    description: "Behavioral pain tool for non-verbal ICU patients. Score 0–8; ≥3 indicates significant pain.",
    items: [
      { score: "0–2", label: "Facial Expression", description: "0=relaxed → 2=grimacing" },
      { score: "0–2", label: "Body Movements", description: "0=no movement → 2=pulling tubes, thrashing" },
      { score: "0–2", label: "Muscle Tension", description: "0=relaxed → 2=very tense/rigid" },
      { score: "0–2", label: "Ventilator Compliance", description: "0=tolerating vent → 2=fighting vent" },
    ],
    target: "Score ≥3 = significant pain → intervene. Reassess after 30 min.",
  },
  {
    id: "wat1", name: "WAT-1", full: "Withdrawal Assessment Tool", ageGroup: "0–18 years",
    description: "Screens for iatrogenic opioid and benzo withdrawal during weaning. Score ≥3 = withdrawal.",
    items: [
      { score: "0–1", label: "Loose/watery stools", description: "" },
      { score: "0–1", label: "Vomiting/retching/gagging", description: "" },
      { score: "0–1", label: "Temperature >37.8°C", description: "" },
      { score: "0–2", label: "State (SOS or RASS)", description: "Tremor, agitation, sweating" },
      { score: "0–1", label: "Startle to touch", description: "" },
      { score: "0–1", label: "Muscle tone — increased", description: "" },
      { score: "0–1", label: "Time to gain calm state (>2 min)", description: "" },
    ],
    target: "Score ≥3 = withdrawal present → slow wean or administer rescue dose.",
  },
];

const WEANING = [
  {
    id: "opioid-benzo", title: "Opioid & Benzodiazepine Weaning",
    indication: "After ≥5–7 days of continuous infusion, or if WAT-1 ≥3",
    steps: [
      "Convert IV infusion to equivalent enteral dose (methadone/lorazepam PO) — calculate 24h IV requirement",
      "Reduce IV infusion by 10–20% every 12–24h while maintaining enteral dose",
      "Monitor WAT-1 score q12h — hold wean if score ≥3",
      "Once IV off, taper enteral opioid by 10% of original dose every 1–2 days",
      "Consider clonidine 1–5 mcg/kg/dose q4–8h PO as adjunct for withdrawal symptoms",
    ],
    notes: "Longer exposures require slower weaning. Document cumulative dose. Involve pharmacy for methadone conversion.",
  },
  {
    id: "dex-wean", title: "Dexmedetomidine Weaning",
    indication: "After >24h use; risk of rebound hypertension and agitation",
    steps: [
      "Do NOT abruptly discontinue after prolonged use",
      "Reduce by 0.1 mcg/kg/hr every 4–6h while monitoring HR and BP",
      "If rebound agitation/hypertension: slow wean or bridge with oral clonidine",
      "Clonidine bridge: 1–3 mcg/kg/dose q6–8h PO; overlap 24–48h before stopping dexmedetomidine",
    ],
    notes: "Clonidine oral bioavailability ~75%; dose accordingly.",
  },
  {
    id: "nmb-liberation", title: "NMB Liberation Protocol",
    indication: "When indication for NMB resolved (e.g., ventilator dyssynchrony, ICP, ARDS)",
    steps: [
      "Confirm adequate analgosedation before reducing NMB",
      "Perform daily TOF assessment — reduce infusion if 3–4 twitches present",
      "If bolus-only regimen: extend interval and monitor TOF for return",
      "Perform daily sedation awakening trial once NMB discontinued",
      "Assess for ICU-acquired weakness: passive ROM, physio assessment",
    ],
    notes: "Never discontinue NMB without ensuring adequate sedation is maintained throughout.",
  },
  {
    id: "analgo-first", title: "Analgesia-First / PAD Bundle",
    indication: "All PICU patients requiring sedation",
    steps: [
      "Assess and treat pain FIRST before adding sedatives (Pain, Agitation, Delirium bundle)",
      "Use multimodal analgesia — opioid + non-opioid adjuncts (acetaminophen, NSAIDs, ketamine)",
      "Set RASS/COMFORT-B target daily — reassess appropriateness",
      "Perform spontaneous breathing trial and sedation interruption daily",
      "Screen for delirium (pCAM-ICU) in children ≥5 years",
      "Early mobilization and delirium prevention — minimize light/noise, maintain sleep cycle",
    ],
    notes: "Evidence-based bundle. Document daily target sedation level and rationale.",
  },
];

function calcDose(dose, weight) {
  if (!weight || weight <= 0) return null;
  if (dose.unit.includes("/hr")) {
    const minD = (dose.min * weight).toFixed(2);
    const maxD = (dose.max * weight).toFixed(2);
    const unit = dose.unit.replace("/kg", "");
    if (dose.min === dose.max) return `${minD} ${unit}`;
    return `${minD}–${maxD} ${unit}`;
  }
  const minD = (dose.min * weight).toFixed(2);
  const maxD = (dose.max * weight).toFixed(2);
  const unit = dose.unit.replace("/kg", "").replace("kg", "");
  if (dose.min === dose.max) return `${minD} ${unit.replace(/\/dose|\/min/, "/dose")}`;
  return `${minD}–${maxD} ${unit}`;
}

function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-sky-900/60 text-sky-200 border-sky-700/50",
    green: "bg-emerald-900/60 text-emerald-200 border-emerald-700/50",
    purple: "bg-violet-900/60 text-violet-200 border-violet-700/50",
    gray: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color]}`}>{children}</span>;
}

function DrugCard({ drug, weight }) {
  const [open, setOpen] = useState(false);
  const hasWarning = drug.warnings.some(w => w.startsWith("⚠️"));
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${hasWarning ? "border-amber-700/60 bg-amber-950/20" : "border-slate-700/60 bg-slate-800/40"}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">{drug.name}</span>
            {hasWarning && <span className="text-amber-400 text-xs">⚠️</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge color="gray">{drug.class}</Badge>
            {drug.routes.map(r => <Badge key={r} color="blue">{r}</Badge>)}
            {drug.reversible && <Badge color="green">Reversible → {drug.reversal}</Badge>}
          </div>
        </div>
        <span className="text-slate-400 text-lg mt-0.5 flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-700/50 p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dosing</div>
            <div className="space-y-2">
              {drug.doses.map((dose, i) => {
                const calc = calcDose(dose, weight);
                return (
                  <div key={i} className="bg-slate-900/60 rounded-lg p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm text-slate-200 font-medium">{dose.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {dose.min === dose.max ? `${dose.min} ${dose.unit}` : `${dose.min}–${dose.max} ${dose.unit}`}
                          {" "}<span className="text-slate-500">({dose.route})</span>
                        </div>
                        {dose.note && <div className="text-xs text-sky-300/80 mt-1 italic">{dose.note}</div>}
                      </div>
                      {calc && (
                        <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-3 py-1.5 text-right flex-shrink-0">
                          <div className="text-xs text-emerald-400 font-medium">For {weight} kg</div>
                          <div className="text-sm text-emerald-200 font-bold">{calc}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {drug.warnings.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">⚠ Warnings</div>
              <ul className="space-y-1">
                {drug.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-200/90 flex gap-2">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
                    <span>{w.replace("⚠️ ", "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monitoring</div>
            <div className="flex flex-wrap gap-1.5">
              {drug.monitoring.map((m, i) => (
                <span key={i} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded border border-slate-600/50">{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScaleCard({ scale }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">{scale.name}</span>
            <Badge color="purple">{scale.ageGroup}</Badge>
          </div>
          <div className="text-xs text-slate-400">{scale.full}</div>
        </div>
        <span className="text-slate-400 text-lg mt-0.5 flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-700/50 p-4 space-y-3">
          <p className="text-xs text-slate-300">{scale.description}</p>
          <div className="space-y-1.5">
            {scale.items.map((item, i) => (
              <div key={i} className="bg-slate-900/60 rounded-lg p-2.5 flex gap-3">
                <span className="text-xs font-mono font-bold text-violet-300 flex-shrink-0 w-10 pt-0.5">{item.score}</span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                  {item.description && <span className="text-xs text-slate-400"> — {item.description}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg p-3">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Clinical Target</div>
            <div className="text-xs text-emerald-200">{scale.target}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeaningCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors">
        <div>
          <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
          <div className="text-xs text-slate-400 italic">{item.indication}</div>
        </div>
        <span className="text-slate-400 text-lg mt-0.5 flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-700/50 p-4 space-y-3">
          <ol className="space-y-2">
            {item.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-slate-200">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-800 text-sky-200 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {item.notes && (
            <div className="bg-sky-900/30 border border-sky-700/40 rounded-lg p-3">
              <div className="text-xs text-sky-300"><span className="font-semibold">Note: </span>{item.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClinicalAlert({ tab }) {
  const alerts = {
    sedation: ["Always assess pain before escalating sedation (analgesia-first principle)", "Set and document daily sedation target (RASS/COMFORT-B)", "Daily sedation interruption trial unless contraindicated"],
    analgesia: ["Use multimodal analgesia to reduce opioid requirements", "Reassess pain within 30–60 min after each intervention", "Monitor for iatrogenic withdrawal (WAT-1) with prolonged use"],
    nmb: ["⚠️ CRITICAL: Ensure adequate sedation AND analgesia before any NMB", "Patient cannot signal pain, distress, or awareness — vigilance essential", "TOF monitoring mandatory — target 1–2 twitches for most indications", "Daily eye care, pressure area checks, DVT prophylaxis"],
    reversal: ["Re-sedation common after flumazenil (short half-life) — monitor ≥2h", "Titrate naloxone carefully — avoid precipitating acute opioid withdrawal", "Sugammadex only reverses aminosteroidal NMBs (rocuronium/vecuronium)"],
    weaning: ["Monitor WAT-1 q12h during opioid/benzo weaning", "Slower wean needed after longer duration or higher cumulative doses"],
  };
  const list = alerts[tab] || [];
  if (!list.length) return null;
  return (
    <div className="mb-4 bg-red-950/40 border border-red-800/50 rounded-xl p-4">
      <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Clinical Reminders</div>
      <ul className="space-y-1">
        {list.map((a, i) => (
          <li key={i} className="text-xs text-red-200 flex gap-2">
            <span className="text-red-500 flex-shrink-0">•</span><span>{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TABS = [
  { id: "sedation", label: "Sedation", icon: "💊" },
  { id: "analgesia", label: "Analgesia", icon: "🩺" },
  { id: "nmb", label: "NMB", icon: "⚡" },
  { id: "reversal", label: "Reversal", icon: "↩" },
  { id: "scales", label: "Scales", icon: "📊" },
  { id: "weaning", label: "Weaning", icon: "📉" },
];

export default function PICUTool() {
  const [tab, setTab] = useState("sedation");
  const [weight, setWeight] = useState("");
  const [search, setSearch] = useState("");
  const weightNum = parseFloat(weight) || 0;

  const drugs = useMemo(() => {
    const byCategory = DRUGS.filter(d => d.category === tab);
    if (!search) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(d => d.name.toLowerCase().includes(q) || d.class.toLowerCase().includes(q));
  }, [tab, search]);

  const allDrugs = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return DRUGS.filter(d => d.name.toLowerCase().includes(q) || d.class.toLowerCase().includes(q));
  }, [search]);

  const isSearchMode = search.length > 0 && !["scales", "weaning"].includes(tab);

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold text-base">PICU</span>
                <span className="text-slate-400 text-xs">Sedation · Analgesia · NMB</span>
              </div>
              <div className="text-xs text-amber-400/80 mt-0.5">⚕ Clinical decision support — always verify locally</div>
              <div className="text-xs text-slate-500 mt-1">
                Designed by <span className="text-sky-400 font-semibold">Dr. Mohammed Shatari</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                🏥 <span className="text-slate-500">King Saud Medical City</span>
                <span className="text-slate-700"> · Pediatric Critical Care</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-lg border border-slate-700 px-3 py-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Weight</span>
              <input
                type="number" min="0.5" max="200" step="0.5"
                value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="kg"
                className="w-16 bg-transparent text-sm font-bold text-emerald-300 placeholder-slate-600 focus:outline-none text-center"
              />
              <span className="text-xs text-slate-500">kg</span>
            </div>
          </div>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search drugs, classes..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-600 mb-3"
          />
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {isSearchMode ? (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-3">Showing {allDrugs.length} result{allDrugs.length !== 1 ? "s" : ""} for "{search}"</div>
            {allDrugs.length === 0
              ? <div className="text-center text-slate-500 py-12 text-sm">No drugs found</div>
              : allDrugs.map(d => <DrugCard key={d.id} drug={d} weight={weightNum} />)}
          </div>
        ) : tab === "scales" ? (
          <div className="space-y-3">{SCALES.map(s => <ScaleCard key={s.id} scale={s} />)}</div>
        ) : tab === "weaning" ? (
          <div className="space-y-3">
            <ClinicalAlert tab="weaning" />
            {WEANING.map(w => <WeaningCard key={w.id} item={w} />)}
          </div>
        ) : (
          <div className="space-y-3">
            <ClinicalAlert tab={tab} />
            {drugs.map(d => <DrugCard key={d.id} drug={d} weight={weightNum} />)}
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-6 mt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          ⚕ <strong className="text-slate-400">Medical Disclaimer:</strong> This tool is for educational reference only.
          All clinical decisions must be verified against institutional protocols, current literature, and individual patient factors.
          Doses may vary by age, weight, organ function, and local guidelines. This tool does not replace clinical judgment.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-500">Designed &amp; developed by <span className="text-sky-400 font-semibold">Dr. Mohammed Shatari</span></p>
          <p className="text-xs text-slate-600 mt-0.5">🏥 King Saud Medical City · Pediatric Critical Care</p>
        </div>
      </footer>
    </div>
  );
}
