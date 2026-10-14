import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import { bracketTax } from "../money.ts";
import {
  CA_FEDERAL_2026 as F,
  CA_FEDERAL_HEALTH_SHARE,
  CA_ONTARIO_2026 as O,
  CA_PROVINCIAL_HEALTH_SHARE,
  ontarioHealthPremium,
} from "../data/ca-2026.ts";
import { USD_PER_CAD } from "../data/fx.ts";
import { finalize } from "./us.ts";

export function caFederalTax(incomeCAD: number): number {
  const phaseOut = Math.min(
    Math.max((incomeCAD - F.bpaPhaseOutStart.value) / (F.bpaPhaseOutEnd.value - F.bpaPhaseOutStart.value), 0),
    1,
  );
  const bpa = F.basicPersonalAmount.value + F.bpaSupplement.value * (1 - phaseOut);
  return Math.max(bracketTax(incomeCAD, F.bands) - bpa * F.creditRate.value, 0);
}

export function caOntarioTax(incomeCAD: number): number {
  const basic = Math.max(bracketTax(incomeCAD, O.bands) - O.basicPersonalAmount.value * O.creditRate.value, 0);
  const surtax =
    Math.max(basic - O.surtaxThreshold1.value, 0) * O.surtaxRate1.value +
    Math.max(basic - O.surtaxThreshold2.value, 0) * O.surtaxRate2.value;
  return basic + surtax;
}

export function computeCA(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const fx = USD_PER_CAD.value;
  const toUSD = (cad: number) => cad * fx;
  const incomeCAD = profile.annualIncomeUSD / fx;
  const federal = caFederalTax(incomeCAD);
  const ontario = caOntarioTax(incomeCAD);
  const premium = ontarioHealthPremium(incomeCAD);
  const fxInput = { ...USD_PER_CAD, unit: "USD/CAD" };
  const income = {
    value: incomeCAD,
    sourceId: "assume-fx-cad",
    unit: "CAD",
    note: "Your US income converted to Canadian dollars at the placeholder market rate, treated as taxable income.",
  };

  const items: LineItem[] = [
    {
      id: "ca-ontario-premium",
      kind: "coverage",
      label: "Ontario Health Premium",
      amountUSD: toUSD(premium),
      paidBy: "you",
      derivation: {
        formula: "A flat amount from $0 to $900 set by taxable income, collected with your Ontario income tax, converted to USD",
        inputs: { incomeCAD: income, usdPerCad: fxInput },
      },
    },
    {
      id: "ca-ontario-tax-share",
      kind: "coverage",
      label: "Your Ontario income tax that funds health care",
      amountUSD: toUSD(ontario * CA_PROVINCIAL_HEALTH_SHARE.value),
      paidBy: "you",
      derivation: {
        formula:
          "Ontario income tax (after the basic credit and surtax) × health's share of provincial spending, converted to USD. Canadian health care has no premiums, so this is an estimate of your contribution through taxes, not a bill.",
        inputs: {
          incomeCAD: income,
          ontarioTax: { value: ontario, sourceId: "ca-tax-2026", unit: "CAD" },
          healthShare: { ...CA_PROVINCIAL_HEALTH_SHARE, unit: "share" },
          usdPerCad: fxInput,
        },
      },
    },
    {
      id: "ca-federal-tax-share",
      kind: "coverage",
      label: "Your federal income tax that funds health care",
      amountUSD: toUSD(federal * CA_FEDERAL_HEALTH_SHARE.value),
      paidBy: "you",
      derivation: {
        formula: "Federal income tax (after the basic credit) × the Canada Health Transfer's share of federal spending, converted to USD",
        inputs: {
          incomeCAD: income,
          federalTax: { value: federal, sourceId: "ca-tax-2026", unit: "CAD" },
          healthShare: { ...CA_FEDERAL_HEALTH_SHARE, unit: "share" },
          usdPerCad: fxInput,
        },
      },
    },
  ];

  return finalize(
    "CA",
    scenario,
    items,
    [
      "Assumes you live in Ontario. Hospital and doctor care are free at the point of use, so the scenario changes nothing here.",
    ],
    [
      "Outpatient prescription drugs, dental and vision care, which most Canadians cover through employer plans or pay themselves",
      "Sales tax, property tax and the federal government's direct health spending",
      "Payroll taxes (CPP and EI), which do not fund health care",
      "Wait times, which are a real cost not counted in dollars",
    ],
  );
}
