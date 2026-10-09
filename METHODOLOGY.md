# How we calculated this: six countries (2026)

This explains how the calculator gets every number it shows. Each figure in the code is linked to an entry in `src/sources.ts`. Anything we chose ourselves, rather than took from a source, is labeled as an assumption.

## What we compare

We compare **what one household pays for health care in a year**, under three scenarios:

1. a healthy year,
2. having a baby,
3. a serious illness.

Each result comes in two views:

- **What you pay:** the money that leaves your paycheck or bank account.
- **Full cost:** what you pay, plus what your employer pays toward your coverage. Employer health spending is part of your compensation even though it never appears in your pay. Leaving it out makes US coverage look cheaper than it is, and leaving out Germany's employer half does the same for Germany.

All amounts are in US dollars. Foreign currencies are converted at placeholder market rates (see "Known limits").

## United States: employer coverage

**Premium.** We use the annual premium share you enter. If you don't know it, the example plan uses KFF's 2025 averages: a total premium of $9,325 for single coverage or $26,993 for family coverage. Workers pay 16% of the single premium and 26% of the family premium.

**Out of pocket.** The scenario sets the allowed claims for the person who needs care. You pay those claims up to the deductible. After that, you pay your coinsurance share of the rest. Your total is capped at your out-of-pocket maximum.

The example plan uses:

- KFF's average single deductible of $1,886,
- 20% coinsurance (an assumption),
- the 2026 ACA out-of-pocket ceiling of $10,600. Many real plans cap out-of-pocket costs lower than this.

**Scenario claims:**

| Scenario | Allowed claims | Basis |
|---|---|---|
| Healthy year | $1,500 | Assumption: a few visits, labs, and generic drugs |
| Having a baby | $20,416 | Peterson-KFF 2025 average for employer plans. Excludes the newborn's own care. |
| Serious illness | $150,000 | Assumption: high enough to reach any compliant out-of-pocket maximum |

## Germany: statutory health insurance (GKV)

**Income.** We convert your US salary to euros at a market exchange rate and apply German rules to that amount. This is a placeholder rate of 1.16 USD per EUR until the data pipeline adds the official rate.

Below the contribution ceiling, the exchange rate cancels out. Your contribution is 8.75% of your income in either currency.

**Contribution.** Contributions are charged on income up to the €69,750 ceiling. The rate is 14.6% plus the 2.9% average additional rate. You and your employer each pay half, so each side pays 8.75%.

A non-earning spouse and children are covered free through family insurance. That is why family size doesn't change the German contribution.

**Copays.** Germany charges small fixed copays: €10 per hospital day for up to 28 days a year, and €5–10 per prescription.

Copays have an annual cap: 2% of household income, after subtracting allowances of €7,119 for a spouse and €9,756 per child. Pregnancy and childbirth carry no copays, and children under 18 pay none.

| Scenario | Copays before the cap | Basis |
|---|---|---|
| Healthy year | €10 | Assumption: two prescriptions at the €5 minimum |
| Having a baby | €0 | §§ 24c–24i SGB V |
| Serious illness | €480 | Assumption: 28 hospital days plus €200 in other copays |

## United Kingdom: the NHS

The NHS is free at the point of use and has no premiums. Two things cost you money:

- **Taxes that fund it.** We take your income tax and employee National Insurance, using the 2026/27 rates for England, and count the share equal to health's share of government spending (about 18%). This is an estimate, not a bill. Your employer's National Insurance (15% above £5,000) is treated the same way and shows up in the full-cost view.
- **Prescription charges.** England charges £9.90 an item, and a 12-month certificate (£114.50) caps the year. Prescriptions are free during pregnancy and for a year after.

| Scenario | Prescription items | Basis |
|---|---|---|
| Healthy year | 2 | Assumption |
| Having a baby | 0 | Maternity exemption |
| Serious illness | 15 | Assumption: enough that the certificate caps the cost |

## Switzerland: mandatory private insurance

Everyone buys a policy from a private insurer, and the plan's benefits are set by law. **Employers pay nothing.**

- **Premiums** are the 2026 national averages: CHF 465.30 a month per adult and CHF 122.50 per child. Every household member needs their own policy, so family size matters a lot. Premiums do not depend on income.
- **Cost sharing:** adults pay the first CHF 300 (the standard deductible), then 10% of the rest, up to CHF 700 more. Hospital stays add CHF 15 a day.
- **Maternity** carries no deductible, coinsurance or hospital contribution from week 13 of pregnancy to 8 weeks after birth.

## Netherlands: regulated private insurance

Everyone buys basic insurance from a private insurer, which must accept them. Rules are set by law.

- **Premium:** €1,908 a year per adult, the 2026 average. Children under 18 are covered at no charge.
- **Deductible:** €385 a year per adult. It does not apply to GP visits, midwife care, maternity care or care for children.
- **Maternity home care (kraamzorg)** carries a €5.70-an-hour contribution. We assume 50 hours.
- **Employer levy:** your employer pays 6.10% of wages up to €79,409 toward the health insurance fund. It shows up in the full-cost view.

| Scenario | Claims that count toward the deductible | Basis |
|---|---|---|
| Healthy year | €200 | Assumption |
| Having a baby | €0 | Maternity care is exempt |
| Serious illness | The full €385 | Assumption |

## Canada: provincial insurance (Ontario)

Hospital and doctor care are free at the point of use. We assume you live in Ontario. Your cost is the **Ontario Health Premium** (up to $900, set by income) plus an estimated share of your income taxes:

- 40% of your Ontario income tax, matching health's share of provincial spending,
- about 11.4% of your federal income tax, matching the Canada Health Transfer's share of federal spending.

Tax is calculated from 2026 federal and Ontario brackets, basic personal amounts and Ontario's surtax. The result does not change by scenario, because care is free.

## How the tax-funded countries differ from the others

This is the biggest caution when reading the results. For the UK and Canada there is no premium, so the only way to show a cost is to estimate the share of your taxes that pays for health care. **We do that for the UK and Canada but not for the other four countries.** The US, Germany, Switzerland and the Netherlands also fund public programs from taxes, and those are left out.

The effect is that:

- the UK and Canada look more expensive for high earners than they would if every country's taxes were counted,
- the US looks cheaper than it is for anyone who pays the Medicare payroll tax or federal income tax that funds Medicare and Medicaid.

The estimate also assumes every tax dollar pays for every kind of spending equally. Treat the UK and Canada numbers as a rough sense of scale, not a bill.

## What's left out, and which way it pushes the result

| Left out | Effect on the comparison |
|---|---|
| US federal taxes that fund Medicare, Medicaid, and ACA subsidies | US looks cheaper than it is |
| Germany's federal tax subsidy to the health fund | Germany looks cheaper than it is |
| German long-term care insurance (about 3.6% plus surcharges) | Germany looks cheaper; the US has no equivalent program in the comparison |
| Out-of-network care, surprise bills, care that spans two US plan years | US looks cheaper than it is |
| Insurer-specific German additional rates (the average actually charged is above 2.9%) | Germany looks slightly cheaper than it is |
| Swiss premium subsidies and Dutch healthcare allowance, which cut costs for lower incomes | Switzerland and the Netherlands look more expensive than they are for lower incomes |
| Swiss premium variation by canton (often 30% or more) | Switzerland can be far cheaper or dearer than the average shown |
| UK and Canadian outpatient drugs, dental care, and wait times | UK and Canada look cheaper than they are |
| Taxes that fund public health programs in the US, Germany, Switzerland and the Netherlands | Those four look cheaper than they are, compared with the UK and Canada |

## Known limits of this version

- Assumes one earner.
- **Exchange rates are placeholders:** 1.16 USD per EUR, 1.34 per GBP, 1.25 per CHF and 0.72 per CAD. They affect every non-US result, so replace them before relying on the numbers.
- Some 2026 figures for the UK, Canada and the Netherlands come from secondary sources (listed in the source registry). Confirm them against the official publications in milestone 2.
- Canada is modeled for Ontario only. The UK is modeled for England only.
- Covers employer coverage only. Marketplace coverage comes in a later milestone.
- The healthy-year and serious-illness claim amounts are our assumptions, not sourced data.
- Germans earning above €77,400 may choose private insurance. We assume they stay in the statutory system.
