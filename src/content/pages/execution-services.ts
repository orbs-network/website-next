/**
 * Structural data for the Execution Services page — images and their intrinsic
 * dimensions. Copy lives under `pages.executionServices` in the catalogs.
 *
 * Dimensions travel with each path so `next/image` reserves the right box
 * before the file loads. They are the real ratios, not an assumed 16:9 — the
 * two diagrams are 1800x1032 and 1800x1179.
 */

export const EXECUTION_SERVICES_PRODUCTS = [
  { id: 'lambdaProduct', image: '/marketing/execution-services/lambda.svg' },
  { id: 'vm', image: '/marketing/execution-services/vm.svg' },
] as const

export const EXECUTION_SERVICES_DIAGRAMS = [
  { id: 'alternatives', src: '/marketing/execution-services/graph-1.png', width: 1800, height: 1032 },
  { id: 'evolution', src: '/marketing/execution-services/graph-2.png', width: 1800, height: 1179 },
] as const
