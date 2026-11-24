#!/usr/bin/env node
// Structural Clean Architecture checks that import-boundary linting cannot express.
// Part of `npm run lint:clean` (runs after eslint -c eslint.clean.config.mjs).
//
//   node .agents/skills/clean-feature/scripts/clean-audit.mjs [--root .] [--json] [--feature <name>]
//
// Exit code 1 when any "error" is found; warnings never fail the run.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(opt('root', '.'));
const asJson = args.includes('--json');
const onlyFeature = opt('feature');
const featuresDir = path.join(root, 'src', 'features');

/** @type {{level: 'error'|'warn', rule: string, file: string, line: number, message: string, hint: string}[]} */
const findings = [];
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const report = (level, rule, file, line, message, hint) => findings.push({ level, rule, file: rel(file), line, message, hint });

const walk = (dir) =>
    !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : [full];
    });
const read = (f) => fs.readFileSync(f, 'utf8');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// Naming conventions per layer folder (relative to the feature root).
const NAMING = [
    { dir: 'domain/usecases', re: /\.usecase\.ts$/, hint: 'Use cases: <verb>-<noun>.usecase.ts (e.g. create-routine.usecase.ts).' },
    { dir: 'domain/repositories', re: /\.repository\.ts$/, hint: 'Repository contracts: <entity>.repository.ts.' },
    { dir: 'infrastructure/dtos', re: /\.dto\.ts$/, hint: 'DTOs: <entity>.dto.ts.' },
    { dir: 'infrastructure/mappers', re: /\.mapper\.ts$/, hint: 'Mappers: <entity>.mapper.ts.' },
    { dir: 'infrastructure/repositories', re: /\.repository\.impl\.ts$/, hint: 'Repository implementations: <entity>.repository.impl.ts.' },
    { dir: 'infrastructure/datasources', re: /datasource(\.interface)?\.ts$/, hint: 'Datasources: <entity>.datasource.ts (contract), <entity>-<kind>.datasource.ts (impl).' },
    { dir: 'presentation/store', re: /\.(slice|selectors)\.ts$/, hint: 'Store files: <feature>.slice.ts and <feature>.selectors.ts.' },
    { dir: 'presentation/hooks', re: /^use-[a-z0-9-]+\.tsx?$/, hint: 'Facade hooks: use-<feature>.ts.', basename: true },
    { dir: 'presentation/viewmodels', re: /\.viewmodel\.ts$/, hint: 'View models: <entity>.viewmodel.ts.' },
    { dir: 'presentation/components', re: /^[A-Z][A-Za-z0-9]*\.tsx$/, hint: 'Components: PascalCase.tsx.', basename: true },
    { dir: 'di', re: /\.container\.ts$/, hint: 'Composition root: <entity>.container.ts.' },
];

function auditFeature(featureDir) {
    const name = path.basename(featureDir);
    const files = walk(featureDir).filter((f) => /\.(ts|tsx)$/.test(f));
    const byDir = (sub) => files.filter((f) => rel(f).startsWith(`${rel(featureDir)}/${sub}/`));

    // 1. Required layers.
    for (const layer of ['domain', 'infrastructure', 'presentation']) {
        if (!fs.existsSync(path.join(featureDir, layer))) {
            report('warn', 'structure/missing-layer', featureDir, 1, `Feature "${name}" has no ${layer}/ folder.`,
                'Every feature normally has domain/, infrastructure/ and presentation/. Ignore only for UI-only features.');
        }
    }
    if (byDir('presentation/store').length > 0 && !fs.existsSync(path.join(featureDir, 'di'))) {
        report('error', 'structure/missing-di', featureDir, 1, `Feature "${name}" has a slice but no di/ container.`,
            'Create di/<entity>.container.ts and inject it as thunk extraArgument in src/store/store.ts.');
    }

    // 2. Naming.
    for (const rule of NAMING) {
        for (const f of byDir(rule.dir)) {
            const subject = rule.basename ? path.basename(f) : f;
            if (!rule.re.test(subject)) report('warn', 'naming', f, 1, `Unexpected file name in ${rule.dir}/.`, rule.hint);
        }
    }

    // 3. Every repository contract has an implementation; every datasource class implements a contract.
    const contracts = [];
    for (const f of byDir('domain/repositories')) {
        const text = read(f);
        for (const m of text.matchAll(/export\s+interface\s+(\w+Repository)\b/g)) contracts.push({ name: m[1], file: f, line: lineOf(text, m.index) });
    }
    const infraTexts = byDir('infrastructure').map((f) => ({ f, text: read(f) }));
    for (const c of contracts) {
        const implemented = infraTexts.some(({ text }) => new RegExp(`implements\\s+[\\w\\s,]*\\b${c.name}\\b`).test(text));
        if (!implemented) {
            report('error', 'contract/unimplemented-repository', c.file, c.line, `${c.name} has no implementation in infrastructure/.`,
                `Add infrastructure/repositories/<entity>.repository.impl.ts with "class XRepositoryImpl implements ${c.name}".`);
        }
    }
    for (const { f, text } of infraTexts.filter(({ f }) => rel(f).includes('/infrastructure/datasources/'))) {
        for (const m of text.matchAll(/export\s+class\s+(\w+)([^{]*)\{/g)) {
            if (!/implements\s+\w+/.test(m[2])) {
                report('error', 'contract/datasource-without-interface', f, lineOf(text, m.index), `Datasource ${m[1]} does not implement a datasource interface.`,
                    'Declare an interface in <entity>.datasource.ts and make every implementation (mock/http/sdk) implement it.');
            }
        }
    }
    for (const { f, text } of infraTexts.filter(({ f }) => rel(f).includes('/infrastructure/repositories/'))) {
        for (const m of text.matchAll(/export\s+class\s+(\w+)([^{]*)\{/g)) {
            if (!/implements\s+\w+Repository/.test(m[2])) {
                report('error', 'contract/repository-impl-without-contract', f, lineOf(text, m.index), `${m[1]} does not implement a domain repository contract.`,
                    'Repository implementations must "implements <X>Repository" from domain/repositories.');
            }
        }
    }

    // 4. Use cases: one public execute().
    for (const f of byDir('domain/usecases')) {
        const text = read(f);
        if (!/\basync\s+execute\s*\(|\bexecute\s*\(/.test(text)) {
            report('warn', 'usecase/no-execute', f, 1, 'Use case without an execute() method.', 'Expose exactly one public execute(...) per use case class.');
        }
        const m = text.match(/constructor\s*\(([^)]*)\)/);
        if (m && /Impl\b|Datasource\b/.test(m[1])) {
            report('error', 'usecase/concrete-dependency', f, lineOf(text, m.index), 'Use case depends on a concrete implementation.',
                'Constructor parameters must be domain repository CONTRACTS (interfaces), never *Impl or datasources.');
        }
    }

    // 5. Thunks delegate to use cases from `extra`; state holds no entities.
    for (const f of byDir('presentation/store').filter((x) => x.endsWith('.slice.ts'))) {
        const text = read(f);
        const entityImports = [...text.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]*domain\/entities\/[^'"]+['"]/g)]
            .flatMap((m) => m[1].split(',').map((s) => s.replace(/\btype\b/, '').trim().split(/\s+as\s+/).pop()))
            .filter(Boolean);
        const stateBlock = text.match(/interface\s+\w*State\s*\{([\s\S]*?)\n\}/);
        if (stateBlock) {
            for (const ent of entityImports) {
                if (new RegExp(`\\b${ent}\\b`).test(stateBlock[1])) {
                    report('error', 'state/entity-in-state', f, lineOf(text, stateBlock.index), `Slice state stores the domain entity ${ent}.`,
                        'Store plain view models (presentation/viewmodels) — class instances break serialization and SSR hydration.');
                }
            }
        }
        const thunkRe = /export\s+const\s+(\w+)\s*=\s*create\w*Thunk\s*\(/g; // createAsyncThunk, createAppThunk (withTypes), createAppAsyncThunk
        for (const m of text.matchAll(thunkRe)) {
            const body = text.slice(m.index, m.index + 1200);
            if (!/\bextra\b/.test(body)) {
                report('error', 'thunk/no-extra', f, lineOf(text, m.index), `Thunk ${m[1]} does not use use cases from \`extra\`.`,
                    'Destructure { extra } in the payload creator and call extra.<feature>.<useCase>.execute(...).');
            }
            if (!/rejectWithValue/.test(body)) {
                report('warn', 'thunk/no-reject-with-value', f, lineOf(text, m.index), `Thunk ${m[1]} does not use rejectWithValue.`,
                    'Catch errors and return rejectWithValue(describeError(err, "...")) so the UI receives a safe message.');
            }
        }
        if (/\bnew\s+[A-Z]\w*(UseCase|RepositoryImpl|Datasource)\s*\(/.test(text)) {
            report('error', 'thunk/instantiates-dependencies', f, 1, 'Slice instantiates use cases/repositories/datasources.',
                'Only di/ creates objects. Thunks receive them via extra.');
        }
    }

    // 6. Facade hook smells.
    for (const f of byDir('presentation/hooks')) {
        const text = read(f);
        const m = text.match(/useEffect\([\s\S]{0,300}?\.length\s*===\s*0[\s\S]{0,200}?dispatch\(/);
        if (m) {
            report('warn', 'hook/refetch-on-empty', f, lineOf(text, m.index), 'Initial load is conditioned on an empty list.',
                'An empty server result re-triggers the fetch forever. Use a status field (\'idle\' | \'loading\' | \'succeeded\' | \'failed\') and fetch only when idle.');
        }
    }

    // 7. Mappers must not invent session data.
    for (const f of byDir('infrastructure/mappers')) {
        const text = read(f);
        const m = text.match(/\b(userId|ownerId|authorId|token)\s*:\s*['"\d]/);
        if (m) {
            report('warn', 'mapper/hardcoded-session', f, lineOf(text, m.index), `Mapper hardcodes "${m[1]}".`,
                'Session data must come from params (use case input) or the http client, not from a mapper constant.');
        }
    }

    // 8. Components must not hold business rules that belong to the entity (heuristic).
    for (const f of byDir('presentation/components')) {
        const text = read(f);
        const m = text.match(/\.trim\(\)\.length\s*[<>]=?\s*\d+/);
        if (m) {
            report('warn', 'component/duplicated-invariant', f, lineOf(text, m.index), 'Component validates a length rule.',
                'Invariants belong to the entity/use case. Let the ValidationError message reach the UI via the facade hook.');
        }
    }
}

function auditGlobal() {
    const storeFile = path.join(root, 'src', 'store', 'store.ts');
    if (fs.existsSync(storeFile)) {
        const text = read(storeFile);
        if (/export\s+const\s+store\s*=\s*configureStore/.test(text)) {
            report('error', 'store/singleton', storeFile, 1, 'Store exported as a module singleton.',
                'Export makeStore() and create it once per client in StoreProvider (useState(makeStore)).');
        }
        if (/extraArgument/.test(text) === false && fs.existsSync(featuresDir)) {
            report('warn', 'store/no-extra-argument', storeFile, 1, 'Store does not inject an extraArgument.',
                'Inject feature containers: getDefaultMiddleware({ thunk: { extraArgument: { <feature>: create<Feature>Container() } } }).');
        }
    }
    const provider = path.join(root, 'src', 'store', 'StoreProvider.tsx');
    if (fs.existsSync(provider) && !/^\s*['"]use client['"]/.test(read(provider))) {
        report('error', 'store/provider-not-client', provider, 1, "StoreProvider is missing 'use client'.", "Put 'use client' on the first line.");
    }
    const layout = path.join(root, 'app', 'layout.tsx');
    if (fs.existsSync(layout) && /^\s*['"]use client['"]/.test(read(layout))) {
        report('warn', 'app/client-layout', layout, 1, "Root layout is a Client Component.", 'Keep app/layout.tsx a Server Component; wrap children with <StoreProvider>.');
    }
}

if (fs.existsSync(featuresDir)) {
    for (const entry of fs.readdirSync(featuresDir, { withFileTypes: true })) {
        if (entry.isDirectory() && (!onlyFeature || entry.name === onlyFeature)) auditFeature(path.join(featuresDir, entry.name));
    }
}
auditGlobal();

const errors = findings.filter((f) => f.level === 'error').length;
const warns = findings.length - errors;
if (asJson) {
    console.log(JSON.stringify({ errors, warnings: warns, findings }, null, 2));
} else {
    for (const f of findings) {
        console.log(`${f.level === 'error' ? 'error' : 'warn '} ${f.file}:${f.line} [${f.rule}] ${f.message}\n      → ${f.hint}`);
    }
    console.log(`\nclean-audit: ${errors} error(s), ${warns} warning(s)`);
}
process.exit(errors > 0 ? 1 : 0);
