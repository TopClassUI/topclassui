// One row per behaviour a test claims to protect. Each was a real survivor once,
// or guards a claim this repository makes in docs/DECISIONS.md.
// One file per area in this folder, found by itself: add a file, never a line here.
import { type Mutation, collectMutations } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = await collectMutations(import.meta.dirname)
