import type { AllResults, CountryId, EmployerPlan, Household, ScenarioId } from '@engine'
import { COUNTRIES, SCENARIOS, splitCosts } from '@engine'
import { usd } from '@/lib/format'

export type StepId = 'cover' | ScenarioId

export interface Callout {
  country: CountryId
  text: string
}

export interface StepCopy {
  id: StepId
  /** The scenario whose care costs the chart adds on this step. Null while only coverage is shown. */
  scenario: ScenarioId | null
  title: string
  body: string
  callouts: Callout[]
}

const OTHERS = (Object.keys(COUNTRIES) as CountryId[]).filter((id) => id !== 'US')

function range(values: number[]): string {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  return Math.round(lo) === Math.round(hi) ? usd(lo) : `${usd(lo)} to ${usd(hi)}`
}

/** The four steps of the story. Every number comes from the same results the chart draws, so text and chart cannot disagree. */
export function buildSteps(all: AllResults, plan: EmployerPlan, household: Household, showEmployer: boolean): StepCopy[] {
  const split = (s: ScenarioId, id: CountryId) => splitCosts(all[s][id], showEmployer)
  const coverage = (id: CountryId) => split('healthy', id).coverageUSD
  const care = (s: ScenarioId, id: CountryId) => split(s, id).careUSD
  const otherCare = (s: ScenarioId) => range(OTHERS.map((id) => care(s, id)))

  const people = household.adults + household.children
  const coins = Math.round(plan.coinsurance * 100)
  const premium = plan.employeePremium + (plan.employerPremium ?? 0)
  const claims = (s: ScenarioId) => SCENARIOS[s].usAllowedClaims.value
  const capped = (s: ScenarioId) => care(s, 'US') >= plan.oopMax - 0.5

  const healthyInside = claims('healthy') <= plan.deductible

  return [
    {
      id: 'cover',
      scenario: null,
      title: 'Everyone pays to be covered',
      body: `Before anyone sees a doctor, every system charges for coverage: ${usd(coverage('US'))} in the US and ${range(
        OTHERS.map(coverage),
      )} elsewhere. It arrives as a premium, a payroll contribution, or (in the UK and Canada, where we estimate it) a share of income tax.`,
      callouts: [
        {
          country: 'US',
          text: `Your share of a ${usd(premium)} ${people > 1 ? 'family' : 'single'} premium${
            showEmployer ? ', plus your employer\'s share.' : '. Your employer pays the rest.'
          }`,
        },
        { country: 'CH', text: `Every person needs their own policy, so ${people} here, with no employer contribution.` },
      ],
    },
    {
      id: 'healthy',
      scenario: 'healthy',
      title: 'Most years are quiet',
      body: `In a healthy year the US household still pays ${usd(care('healthy', 'US'))} for care${
        healthyInside ? `, because it falls inside the ${usd(plan.deductible)} deductible` : ''
      }. Elsewhere care costs ${otherCare('healthy')}.`,
      callouts: [
        {
          country: 'US',
          text: healthyInside
            ? `You pay the first ${usd(claims('healthy'))} of care yourself: it's under the deductible.`
            : `You pay the deductible, then ${coins}% of the rest.`,
        },
        { country: 'DE', text: `${usd(care('healthy', 'DE'))} in prescription copays.` },
      ],
    },
    {
      id: 'baby',
      scenario: 'baby',
      title: 'Then a baby arrives',
      body: capped('baby')
        ? `The US household reaches its ${usd(plan.oopMax)} out-of-pocket cap, paying ${usd(care('baby', 'US'))} for care. Elsewhere birth costs ${otherCare('baby')}.`
        : `After the ${usd(plan.deductible)} deductible the US plan pays ${100 - coins}% of the bill, so the household pays ${usd(care('baby', 'US'))} for care. Elsewhere birth costs ${otherCare('baby')}.`,
      callouts: [
        {
          country: 'US',
          text: `${usd(claims('baby'))} of care: the ${usd(plan.deductible)} deductible plus ${coins}% of the rest${capped('baby') ? ', up to the cap' : ''}.`,
        },
        { country: 'DE', text: 'Maternity care carries no copays.' },
      ],
    },
    {
      id: 'serious',
      scenario: 'serious',
      title: 'Or someone gets seriously ill',
      body: `${
        capped('serious')
          ? `The US plan's ${usd(plan.oopMax)} out-of-pocket cap is the only limit, and this household reaches it.`
          : `The US household pays ${usd(care('serious', 'US'))} for care.`
      } Elsewhere care costs ${otherCare('serious')}.`,
      callouts: [
        {
          country: 'US',
          text: capped('serious')
            ? `${usd(claims('serious'))} of care reaches the ${usd(plan.oopMax)} out-of-pocket cap.`
            : `${usd(claims('serious'))} of care, after the deductible and ${coins}% coinsurance.`,
        },
        { country: 'DE', text: 'Hospital copays of €10 a day for up to 28 days, with an annual cap of 2% of household income.' },
      ],
    },
  ]
}

export { OTHERS }
