/**
 * Los tipos de import.meta.env para `tsc --noEmit` (npm run tipos), también
 * en un clon limpio, antes de que `astro dev` o `astro build` generen
 * .astro/types.d.ts (que lleva esta misma referencia).
 * [DOC] https://docs.astro.build/en/guides/environment-variables/ — «By
 *    default, Astro provides type definitions for import.meta.env through
 *    astro/client.d.ts»; BASE_URL entre las variables por defecto.
 * [DOC] https://docs.astro.build/en/reference/cli-reference/#astro-sync —
 *    `astro sync` «sets up a .astro/types.d.ts file», y lo ejecutan `astro
 *    dev` y `astro build`.
 */
/// <reference types="astro/client" />
