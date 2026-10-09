import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import {
  UK_EMPLOYER_NI_2026,
  UK_HEALTH_SHARE,
  UK_PRESCRIPTIONS_2026,
  UK_SCENARIO_PRESCRIPTIONS,
  UK_TAX_2026 as T,
} from "../data/uk-2026.ts";
import { USD_PER_GBP } from "../data/fx.ts";
import { finalize } from "./us.ts";

export function ukIncomeTax(incomeGBP: number): number {
  const taper = Math.max(0, (incomeGBP - T.allowanceTaperStart.value) / 2);
  const allowance = Math.max(0, T.personalAllowance.value - taper);
  const taxable = Math.max(0, incomeGBP - allowance);
  const basic = Math.min(taxable, T.basicBandWidth.value);
  const higher = Math.min(Math.max(taxable - T.basicBandWidth.value, 0), T.higherBandLimit.value - T.basicBandWidth.value);
  const additional = Math.max(taxable - T.higherBandLimit.value, 0);
  return basic * T.basicRate.value + higher * T.higherRate.value + additional * T.additionalRate.value;
}

export function ukEmployeeNI(incomeGBP: number): number {
  const main = Math.max(Math.min(incomeGBP, T.niUpperEarningsLimit.value) - T.niPrimaryThreshold.value, 0);
  const upper = Math.max(incomeGBP - T.niUpperEarningsLimit.value, 0);
  return main * T.niMainRate.value + upper * T.niUpperRate.value;
}

export function ukEmployerNI(incomeGBP: number): number {
  return Math.max(incomeGBP - UK_EMPLOYER_NI_2026.secondaryThreshold.value, 0) * UK_EMPLOYER_NI_2026.rate.value;
}

export function computeUK(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const fx = USD_PER_GBP.value;
  const toUSD = (gbp: number) => gbp * fx;
  const incomeGBP = profile.annualIncomeUSD / fx;
  const share = UK_HEALTH_SHARE.value;
  const incomeTax = ukIncomeTax(incomeGBP);
  const ni = ukEmployeeNI(incomeGBP);

  const items = UK_SCENARIO_PRESCRIPTIONS[scenario.id];
  const rx = Math.min(items.value * UK_PRESCRIPTIONS_2026.charge.value, UK_PRESCRIPTIONS_2026.annualCertificate.value);
  const income = {
    value: incomeGBP,
    sourceId: "assume-fx-gbp",
    unit: "GBP",
    note: "Your US income converted to pounds at the placeholder market rate.",
  };

  const lineItems: LineItem[] = [
    {
      id: "uk-tax-share",
      label: "Your income tax and NI that fund the NHS",
      amountUSD: toUSD((incomeTax + ni) * share),
      paidBy: "you",
      derivation: {
        formula:
          "(income tax + employee National Insurance) × health's share of government spending, converted to USD. The NHS has no premiums, so this is an estimate of your contribution through taxes, not a bill.",
        inputs: {
          incomeGBP: income,
          incomeTax: { value: incomeTax, sourceId: "uk-tax-2026", unit: "GBP" },
          employeeNI: { value: ni, sourceId: "uk-tax-2026", unit: "GBP" },
          healthShare: { ...UK_HEALTH_SHARE, unit: "share" },
          usdPerGbp: { ...USD_PER_GBP, unit: "USD/GBP" },
        },
      },
    },
    {
      id: "uk-prescriptions",
      label: "Prescription charges",
      amountUSD: toUSD(rx),
      paidBy: "you",
      derivation: {
        formula: "min(items × charge per item, annual prepayment certificate), converted to USD",
        inputs: {
          items: { ...items, unit: "items" },
          chargePerItem: { ...UK_PRESCRIPTIONS_2026.charge, unit: "GBP" },
          annualCertificate: { ...UK_PRESCRIPTIONS_2026.annualCertificate, unit: "GBP" },
          usdPerGbp: { ...USD_PER_GBP, unit: "USD/GBP" },
        },
      },
    },
    {
      id: "uk-tax-share-employer",
      label: "Your employer's NI that funds the NHS",
      amountUSD: toUSD(ukEmployerNI(incomeGBP) * share),
      paidBy: "employer",
      derivation: {
        formula: "(income − secondary threshold) × employer NI rate × health's share of government spending, converted to USD",
        inputs: {
          incomeGBP: income,
          employerNIRate: { ...UK_EMPLOYER_NI_2026.rate, unit: "share" },
          secondaryThreshold: { ...UK_EMPLOYER_NI_2026.secondaryThreshold, unit: "GBP" },
          healthShare: { ...UK_HEALTH_SHARE, unit: "share" },
          usdPerGbp: { ...USD_PER_GBP, unit: "USD/GBP" },
        },
      },
    },
  ];

  return finalize(
    "UK",
    scenario,
    lineItems,
    ["The NHS is free at the point of use. Most of this figure is the estimated share of your taxes that pays for it."],
    [
      "VAT, council tax and other taxes that also fund the NHS",
      "Scotland's different income tax bands",
      "NHS dental charges, optical costs and private care to skip waiting lists",
      "Waiting times, which are a real cost not counted in dollars",
    ],
  );
}
