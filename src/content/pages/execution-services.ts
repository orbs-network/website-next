/**
 * Structural data for the Execution Services page — images and their intrinsic
 * dimensions. Copy lives under `pages.executionServices` in the catalogs.
 *
 * Dimensions travel with each path so `next/image` reserves the right box
 * before the file loads. They are the real ratios, not an assumed 16:9 — the
 * two diagrams are 1800x1032 and 1800x1179.
 */

export const EXECUTION_SERVICES_PRODUCTS = [
  {
    id: 'lambdaProduct',
    image: '/marketing/execution-services/lambda.svg',
    darkImage: '/marketing/execution-services/lambda-dark.svg',
    illustration: { src: '/marketing/execution-services/lambda-illustration.svg', width: 452, height: 405 },
  },
  {
    id: 'vm',
    image: '/marketing/execution-services/vm.svg',
    darkImage: '/marketing/execution-services/vm-dark.svg',
    illustration: { src: '/marketing/execution-services/vm-illustration.svg', width: 467, height: 372 },
  },
] as const

export const EXECUTION_SERVICES_DIAGRAMS = [
  {
    id: 'alternatives',
    src: '/marketing/execution-services/graph-1.png',
    width: 1800,
    height: 1032,
    background: 'bg-neutral-900',
  },
  {
    id: 'evolution',
    src: '/marketing/execution-services/graph-2.png',
    width: 1800,
    height: 1179,
    background: 'bg-white',
  },
] as const
