/**
 * Contar los tests de una suite sin correrlos (encargo 11.4, para el juez del README): precargado con
 * `node --import <este fichero> --test …`, cada test que se registra queda omitido (skip) y los hooks no hacen nada.
 * node --test registra los mismos tests que en una ejecución de verdad, porque los cuerpos de los describe sí corren, y
 * su resumen («ℹ tests N») da la cuenta en unos segundos, sin build, sin Chrome y sin red.
 *
 * Vale mientras ningún juez cree tests dentro de otro test (t.test): esos nacen al correr el test de fuera, y aquí no
 * corre ninguno. Hoy ninguno lo hace; si alguno lo hiciera, la cuenta del README dejaría de casar con la de la suite y
 * el juez lo diría.
 *
 * [DOC] https://nodejs.org/api/module.html#modulesyncbuiltinesmexports — «The module.syncBuiltinESMExports() method
 *    updates all the live bindings for builtin ES Modules to match the properties of the CommonJS exports»: así, el
 *    `import { test } from 'node:test'` de cada juez recibe la versión de aquí.
 * [DOC] https://nodejs.org/api/test.html#testname-options-fn — skip: «If truthy, the test is skipped. If a string is
 *    provided, that string is displayed in the test results as the reason for skipping the test».
 * [DOC] https://nodejs.org/api/cli.html#--importmodule — «Preload the specified module at startup».
 */
import { createRequire, syncBuiltinESMExports } from 'node:module';

type Registrar = (nombre?: unknown, opciones?: unknown, fn?: unknown) => unknown;

const requerir = createRequire(import.meta.url);
const nodeTest = requerir('node:test') as Record<string, unknown>;

/** El mismo registro, con skip: el test se cuenta y no se corre. */
const omitido = (registrar: Registrar): Registrar =>
  Object.assign((nombre?: unknown, opciones?: unknown, fn?: unknown) => {
    if (typeof opciones === 'function') [fn, opciones] = [opciones, {}];
    return registrar(nombre, { ...(opciones as object | undefined), skip: 'solo se cuenta' }, fn);
  }, registrar);

nodeTest['test'] = omitido(nodeTest['test'] as Registrar);
nodeTest['it'] = omitido(nodeTest['it'] as Registrar);
for (const hook of ['before', 'after', 'beforeEach', 'afterEach']) nodeTest[hook] = (): void => {};
syncBuiltinESMExports();
