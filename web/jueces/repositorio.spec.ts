/**
 * Lo que el repositorio, que es público, no versiona (11.1, hallazgo 6 del censo pre-despliegue, firmado por Antonio).
 *
 *   1. docs/figma/modelo-make.zip, el código que generó Figma Make para el modelo, es una referencia de lectura para el
 *      calco que vive solo en local: las condiciones de lo que genera Make NO CONSTAN (docs/figma/README.md). Ni está
 *      en el índice de git ni podría volver a él sin forzarlo: .gitignore lo ignora. Hasta el 06/10 estuvo versionado
 *      y sigue en la historia; lo asume Antonio.
 *
 * Se pregunta a git desde la raíz del repositorio: `git ls-files` (lo versionado) y `git check-ignore` (lo ignorado,
 * exista o no el fichero; en un clon limpio, el zip no está).
 * [DOC] https://git-scm.com/docs/git-check-ignore — «For each pathname given via the command-line or from a file via
 *    --stdin, check whether the file is excluded by .gitignore»; sale con 0 si lo está y con 1 si no.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const ZIP = 'docs/figma/modelo-make.zip';

const git = (...args: string[]): { codigo: number | null; salida: string } => {
  const r = spawnSync('git', args, { cwd: RAIZ, encoding: 'utf8' });
  assert.equal(r.error, undefined, `git ${args.join(' ')}: ${String(r.error)}`);
  return { codigo: r.status, salida: r.stdout.trim() };
};

describe('lo que el repositorio público no versiona', () => {
  test(`1 · ${ZIP} no está en el índice de git, y .gitignore lo ignora`, () => {
    assert.equal(git('ls-files', '--', ZIP).salida, '', `${ZIP}, versionado`);
    assert.equal(git('check-ignore', '--quiet', '--no-index', '--', ZIP).codigo, 0, `${ZIP}, sin ignorar en .gitignore`);
  });
});
