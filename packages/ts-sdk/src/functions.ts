import type { StepT, ThingT } from './types'

type hasInputs = { inputs: ThingT[] }

export function Migrate__Step0_14_to_15(s: StepT): StepT {
  const inputs: ThingT[] = (s as hasInputs).inputs || []

  const result: StepT = {
    ...s,
    actions: s.actions.map((a) => ({
      ...a,
      inputs: inputs,
    })),
  }
  return result
}
