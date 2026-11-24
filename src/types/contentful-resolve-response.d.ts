// The package ships no type declarations. Only the call `api.ts` makes is typed.
declare module 'contentful-resolve-response' {
  export default function resolveResponse(
    response: unknown,
    options?: { removeUnresolved?: boolean; itemEntryPoints?: string[] }
  ): unknown[]
}
