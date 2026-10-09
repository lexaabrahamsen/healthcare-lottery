import type { Source } from "./types.ts";

/**
 * Every figure in src/data points at one of these ids. A test fails if any
 * sourceId is missing from this registry.
 */
export const SOURCES: Record<string, Source> = {
  "user-input": {
    id: "user-input",
    kind: "user",
    label: "Entered by you",
  },

  // ── United States ──────────────────────────────────────────────
  "kff-ehbs-2025": {
    id: "kff-ehbs-2025",
    kind: "research",
    label: "KFF 2025 Employer Health Benefits Survey",
    url: "https://www.kff.org/health-costs/report/2025-employer-health-benefits-survey/",
    retrieved: "2026-10-07",
    notes:
      "Average annual premiums: $9,325 single, $26,993 family. Average single deductible: $1,886. Average worker share of premium: 16% single, 26% family.",
  },
  "cms-moop-2026": {
    id: "cms-moop-2026",
    kind: "primary",
    label: "HHS/CMS 2026 maximum annual limitation on cost sharing",
    url: "https://www.sequoia.com/2025/05/2026-benefit-limits-hsa-hdhp-and-aca/",
    retrieved: "2026-10-07",
    notes:
      "Revised in 2025 to $10,600 self-only / $21,200 family, replacing the originally announced $10,150 / $20,300. Replace URL with the CMS notice in milestone 2.",
  },
  "kff-pregnancy-2025": {
    id: "kff-pregnancy-2025",
    kind: "research",
    label: "Peterson-KFF: Health costs associated with pregnancy, childbirth, and postpartum care (Sep 2025)",
    url: "https://www.kff.org/health-costs/health-costs-associated-with-pregnancy-childbirth-and-postpartum-care/",
    retrieved: "2026-10-07",
    notes:
      "Employer-plan enrollees, 2021–2023 claims: $20,416 average total cost, $2,743 out of pocket. Newborn care ($5,820 average) is reported separately and excluded here.",
  },

  // ── Germany ────────────────────────────────────────────────────
  "vdek-2026": {
    id: "vdek-2026",
    kind: "primary",
    label: "vdek: Das ändert sich 2026 für gesetzlich Kranken- und Pflegeversicherte",
    url: "https://www.vdek.com/politik/was-aendert-sich/gesundheitswesen-2026.html",
    retrieved: "2026-10-07",
    notes:
      "General GKV rate 14.6%. Average additional contribution (durchschnittlicher Zusatzbeitrag) set by the BMG at 2.9%. Contribution ceiling €69,750/yr. Mandatory-insurance threshold €77,400/yr.",
  },
  "dak-freibetraege-2026": {
    id: "dak-freibetraege-2026",
    kind: "primary",
    label: "DAK: Freibeträge bei der Zuzahlungsbefreiung (2026)",
    url: "https://www.dak.de/dak/ihr-anliegen/zuzahlungsbefreiung/zuzahlungsbefreiung-belastungsgrenze/freibetraege-bei-zuzahlungsbefreiung_20490",
    retrieved: "2026-10-07",
    notes: "2026 allowances deducted before the copay cap: €7,119 for a spouse, €9,756 per child. BARMER's 2026 brochure gives the same figures.",
  },
  "sgb5-62": {
    id: "sgb5-62",
    kind: "primary",
    label: "§ 62 SGB V: Belastungsgrenze (annual copay cap)",
    url: "https://www.gesetze-im-internet.de/sgb_5/__62.html",
    notes: "Copays are capped at 2% of household gross income after allowances (1% for the chronically ill). Children under 18 pay no copays.",
  },
  "sgb5-61": {
    id: "sgb5-61",
    kind: "primary",
    label: "§ 61 SGB V: Zuzahlungen (copay amounts)",
    url: "https://www.gesetze-im-internet.de/sgb_5/__61.html",
    notes: "Hospital: €10 per day, at most 28 days per year. Prescriptions: 10% of price, minimum €5, maximum €10.",
  },
  "sgb5-24c": {
    id: "sgb5-24c",
    kind: "primary",
    label: "§§ 24c–24i SGB V: Leistungen bei Schwangerschaft und Mutterschaft",
    url: "https://www.gesetze-im-internet.de/sgb_5/__24c.html",
    notes: "Pregnancy and maternity services, including delivery, are provided without copays.",
  },

  // ── United Kingdom ─────────────────────────────────────────────
  "uk-tax-2026": {
    id: "uk-tax-2026",
    kind: "research",
    label: "LITRG: Tax and NIC rates and bands (2026/27, England, Wales and Northern Ireland)",
    url: "https://www.litrg.org.uk/tax-guides/tax-basics/what-tax-rates-apply-me",
    retrieved: "2026-10-08",
    notes:
      "Personal allowance £12,570. Basic rate 20% on the first £37,700 of taxable income, 40% to £125,140, 45% above. Employee NI 8% between £12,570 and £50,270, 2% above. Cross-checked against a second secondary source; confirm against GOV.UK in milestone 2.",
  },
  "uk-employer-ni-2026": {
    id: "uk-employer-ni-2026",
    kind: "research",
    label: "IRIS: Employer National Insurance rates for 2026/27",
    url: "https://www.iris.co.uk/blog/payroll/employer-national-insurance-contributions-guide/",
    retrieved: "2026-10-08",
    notes: "Employer Class 1 NI of 15% on earnings above the £5,000 secondary threshold. Ignores the Employment Allowance.",
  },
  "uk-nhs-rx-2026": {
    id: "uk-nhs-rx-2026",
    kind: "research",
    label: "Community Pharmacy England: NHS prescription charges remain at £9.90 (2026/27)",
    url: "https://cpe.org.uk/our-news/nhs-prescription-charges-to-remain-at-9-90/",
    retrieved: "2026-10-08",
    notes: "England: £9.90 per item. The 12-month prepayment certificate is frozen at £114.50. Scotland, Wales and Northern Ireland have no charge.",
  },
  "uk-nhs-rx-exemption": {
    id: "uk-nhs-rx-exemption",
    kind: "primary",
    label: "NHS: Who can get free prescriptions",
    url: "https://www.nhs.uk/nhs-services/prescriptions-and-pharmacies/who-can-get-free-prescriptions/",
    retrieved: "2026-10-08",
    notes: "Maternity exemption: free prescriptions during pregnancy and for 12 months after the due date.",
  },
  "fullfact-nhs-share": {
    id: "fullfact-nhs-share",
    kind: "research",
    label: "Full Fact: The NHS doesn't 'gobble up' 40% of total public expenditure",
    url: "https://fullfact.org/health/nhs-public-expenditure-40-percent/",
    retrieved: "2026-10-08",
    notes: "Health spending is planned at around 18% of total managed expenditure in 2024/25.",
  },

  // ── Switzerland ────────────────────────────────────────────────
  "ch-bag-premiums-2026": {
    id: "ch-bag-premiums-2026",
    kind: "primary",
    label: "BAG/FOPH: Prämiengenehmigung 2026",
    url: "https://www.priminfo.admin.ch/downloads/MM_Praemiengenehmigung%202026_DE.pdf",
    retrieved: "2026-10-08",
    notes: "Average monthly premiums for 2026: CHF 465.30 for adults, CHF 326.30 for young adults, CHF 122.50 for children (national mean 393.30).",
  },
  "ch-kvg": {
    id: "ch-kvg",
    kind: "primary",
    label: "KVG (SR 832.10) and KVV: cost sharing under mandatory health insurance",
    url: "https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/de",
    retrieved: "2026-10-08",
    notes:
      "Minimum adult deductible CHF 300. Coinsurance 10%, capped at CHF 700 a year for adults and CHF 350 for children. Hospital contribution CHF 15 a day. Maternity services from week 13 of pregnancy to 8 weeks after birth carry no cost sharing (Art. 64 para. 7).",
  },

  // ── Netherlands ────────────────────────────────────────────────
  "nl-premium-2026": {
    id: "nl-premium-2026",
    kind: "research",
    label: "Zorgwijzer: Miljoenennota 2026, higher premium but healthcare allowance lags",
    url: "https://www.zorgwijzer.nl/zorgverzekering-2026/miljoenennota-2026-hogere-zorgpremie-maar-zorgtoeslag-blijft-achter",
    retrieved: "2026-10-08",
    notes: "Average nominal premium €1,908 a year in 2026. The mandatory deductible (eigen risico) stays at €385. Maximum healthcare allowance €1,574 single, €3,010 for couples.",
  },
  "nl-zvw-2026": {
    id: "nl-zvw-2026",
    kind: "research",
    label: "Rendement: Definitieve percentages Zvw-premie 2026",
    url: "https://www.rendement.nl/sociale-verzekeringen/nieuws/definitieve-percentages-zvw-premie-2026-bekend.html",
    retrieved: "2026-10-08",
    notes: "Employer levy (werkgeversheffing Zvw) 6.10% of wages up to €79,409 in 2026.",
  },
  "nl-kraamzorg": {
    id: "nl-kraamzorg",
    kind: "research",
    label: "Zorgwijzer: Kraamzorg vergoeding (2026)",
    url: "https://www.zorgwijzer.nl/vergoeding/kraamzorg",
    retrieved: "2026-10-08",
    notes: "The deductible does not apply to midwife care, maternity care or care for children. Home maternity care carries a statutory own contribution of €5.70 an hour, for 24 to 80 hours.",
  },

  // ── Canada ─────────────────────────────────────────────────────
  "ca-tax-2026": {
    id: "ca-tax-2026",
    kind: "research",
    label: "KPMG: Federal and provincial/territorial income tax rates and brackets for 2026",
    url: "https://assets.kpmg.com/content/dam/kpmg/ca/pdf/2026/01/ca-federal-and-provincial-territorial-income-tax-rates-and-brackets-for-2026.pdf",
    retrieved: "2026-10-08",
    notes: "Federal: 14% to $58,523, 20.5% to $117,045, 26% to $181,440, 29% to $258,482, 33% above. Ontario: 5.05% to $53,891, 9.15% to $107,785, 11.16% to $150,000, 12.16% to $220,000, 13.16% above.",
  },
  "ca-bpa-2026": {
    id: "ca-bpa-2026",
    kind: "research",
    label: "Raymond Chabot Grant Thornton: Individual taxation, Ontario 2026",
    url: "https://www.rcgt.com/contentassets/5142f7cf936d42d7aa7666314c21ccd1/individual_taxation_ontario_2026.pdf",
    retrieved: "2026-10-08",
    notes:
      "Federal basic personal amount $16,452 ($14,829 plus a $1,623 supplement that phases out between $181,440 and $258,482). Ontario basic personal amount $12,989. Ontario surtax: 20% above $5,818 of basic Ontario tax, plus 36% above $7,446. Figures came from search summaries; confirm against the CRA in milestone 2.",
  },
  "ca-ohp-2026": {
    id: "ca-ohp-2026",
    kind: "research",
    label: "Ontario Health Premium schedule (2026)",
    url: "https://ebsource.com/employment/calculator/income-tax/ontario/",
    retrieved: "2026-10-08",
    notes: "$0 up to $20,000 of taxable income, rising in steps to a maximum of $900 above $200,600.",
  },
  "ca-pt-health-share": {
    id: "ca-pt-health-share",
    kind: "research",
    label: "RNAO: Health spending shares of government program spending (CIHI data)",
    url: "https://rnao.ca/policy/dashboards/fiscal-capacity/health-spending-shares-of-government-program-spending",
    retrieved: "2026-10-08",
    notes: "Health is about 40% of provincial and territorial program spending.",
  },
  "ca-cht-2026": {
    id: "ca-cht-2026",
    kind: "primary",
    label: "Department of Finance Canada: Major federal transfers",
    url: "https://www.canada.ca/en/department-finance/programs/federal-transfers/major-federal-transfers.html",
    retrieved: "2026-10-08",
    notes: "Canada Health Transfer of $57.4B in 2026–27. Total federal spending authority of $502.8B is from the PBO's summary of the 2026–27 Main Estimates and statutory spending.",
  },

  // ── Modeling assumptions ───────────────────────────────────────
  "assume-fx": {
    id: "assume-fx",
    kind: "assumption",
    label: "EUR→USD conversion rate (placeholder)",
    notes:
      "Placeholder market rate of 1.16 USD per EUR. Milestone 2 replaces this with the ECB reference rate fetched at build time, and adds a purchasing-power-parity option.",
  },
  "assume-fx-gbp": {
    id: "assume-fx-gbp",
    kind: "assumption",
    label: "GBP→USD conversion rate (placeholder)",
    notes: "Placeholder of 1.34 USD per GBP, to be replaced by a fetched reference rate in milestone 2.",
  },
  "assume-fx-chf": {
    id: "assume-fx-chf",
    kind: "assumption",
    label: "CHF→USD conversion rate (placeholder)",
    notes: "Placeholder of 1.25 USD per CHF, to be replaced by a fetched reference rate in milestone 2.",
  },
  "assume-fx-cad": {
    id: "assume-fx-cad",
    kind: "assumption",
    label: "CAD→USD conversion rate (placeholder)",
    notes: "Placeholder of 0.72 USD per CAD, to be replaced by a fetched reference rate in milestone 2.",
  },
  "assume-baby-kraamzorg": {
    id: "assume-baby-kraamzorg",
    kind: "assumption",
    label: "Netherlands: 50 hours of home maternity care",
    notes: "The basic insurance covers 24 to 80 hours of kraamzorg. We assume 50.",
  },
  "assume-healthy-year": {
    id: "assume-healthy-year",
    kind: "assumption",
    label: "Healthy year: light use of care",
    notes:
      "$1,500 in allowed claims (a few office visits, labs, generic prescriptions; preventive care is free under the ACA). Germany: two prescriptions at the €5 minimum. UK: two prescription items. Switzerland: CHF 1,500 of claims. Netherlands: €200 of claims counting toward the deductible. To be replaced with Peterson-KFF median-spending data in milestone 2.",
  },
  "assume-serious-illness": {
    id: "assume-serious-illness",
    kind: "assumption",
    label: "Serious illness: a year of major treatment",
    notes:
      "$150,000 in allowed claims, enough to reach any ACA-compliant out-of-pocket maximum. Germany: 28 hospital days at €10 plus €200 in prescription and therapy copays, before the annual cap. Switzerland: 28 hospital days. UK: 15 prescription items. Netherlands: enough to reach the full deductible.",
  },
  "assume-coinsurance": {
    id: "assume-coinsurance",
    kind: "assumption",
    label: "Example plan coinsurance of 20%",
    notes: "A common coinsurance rate, used only in the example plan. People enter their own.",
  },
  "assume-one-earner": {
    id: "assume-one-earner",
    kind: "assumption",
    label: "One earner per household",
    notes:
      "Germany: a non-earning spouse and children are covered free through family insurance (Familienversicherung). US: the earner's plan covers the household at the family tier.",
  },
};

export function getSource(id: string): Source {
  const s = SOURCES[id];
  if (!s) throw new Error(`Unknown sourceId: ${id}`);
  return s;
}
