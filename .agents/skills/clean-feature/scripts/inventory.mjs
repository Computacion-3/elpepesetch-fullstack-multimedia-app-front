#!/usr/bin/env node
// Inventory of reusable Clean Architecture building blocks, used by the planning phase
// (reuse analysis) of the clean-feature skill.
//
//   node .agents/skills/clean-feature/scripts/inventory.mjs [--root .] [--json] [--out temp/clean-plans]
//
// Lists, per feature: entities, repository contracts (+ method signatures), use cases (+ execute
// signature and repository dependencies), datasource contracts/implementations, DTOs, mappers,
// slices (state fields + thunks with action types), selectors, facade hooks (+ returned keys),
// components and view models. Also lists src/shared and src/store.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(opt('root', '.'));
const outDir = opt('out');
const asJson = args.includes('--json');

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const walk = (dir) =>
    !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(e.name) ? [full] : [];
    });
const read = (f) => fs.readFileSync(f, 'utf8');
const squash = (s) => s.replace(/\s+/g, ' ').trim();

/** Extracts the `{ ... }` body that starts at `openIndex` (index of the opening brace). */
function blockFrom(text, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}' && --depth === 0) return text.slice(openIndex + 1, i);
    }
    return '';
}

function interfaceMembers(text, name) {
    const m = new RegExp(`interface\\s+${name}\\b[^{]*\\{`).exec(text);
    if (!m) return [];
    return blockFrom(text, m.index + m[0].length - 1)
        .split(/;\s*\n|\n/)
        .map(squash)
        .filter((l) => l && !l.startsWith('//') && !l.startsWith('*') && !l.startsWith('/*'));
}

function exportsOf(text) {
    return [...text.matchAll(/export\s+(?:default\s+)?(?:abstract\s+)?(class|interface|type|function|const|enum)\s+(\w+)/g)]
        .map((m) => ({ kind: m[1], name: m[2] }));
}

function describeFile(file, layerPath) {
    const text = read(file);
    const info = { file: rel(file), exports: exportsOf(text) };
    if (text.trim() === '') info.stub = true;

    if (layerPath.startsWith('domain/repositories') || layerPath.startsWith('infrastructure/datasources')) {
        info.contracts = info.exports
            .filter((e) => e.kind === 'interface' && /(Repository|Datasource|DataSource)$/.test(e.name))
            .map((e) => ({ name: e.name, methods: interfaceMembers(text, e.name) }));
        info.params = info.exports.filter((e) => /Params$|Dto$/.test(e.name)).map((e) => e.name);
    }
    if (/implements\s+\w+/.test(text)) {
        info.implements = [...text.matchAll(/class\s+(\w+)[^{]*implements\s+([\w\s,]+)\{/g)].map((m) => ({ class: m[1], contracts: squash(m[2]) }));
    }
    if (layerPath.startsWith('domain/usecases')) {
        const exec = text.match(/execute\s*\(([^)]*)\)\s*:\s*([^{]+)\{/);
        const ctor = text.match(/constructor\s*\(([^)]*)\)/);
        info.usecase = {
            execute: exec ? `execute(${squash(exec[1])}): ${squash(exec[2])}` : null,
            dependsOn: ctor ? [...ctor[1].matchAll(/:\s*(\w+)/g)].map((m) => m[1]) : [],
        };
    }
    if (layerPath.startsWith('domain/entities')) {
        const methods = [...text.matchAll(/^\s{4}(?:static\s+)?(\w+)\s*\([^)]*\)\s*:\s*[\w<>[\]| ]+\s*\{/gm)]
            .map((m) => m[1]).filter((n) => n !== 'constructor');
        info.entityMethods = methods;
        info.validators = [...text.matchAll(/export\s+function\s+(assert\w+|validate\w+)/g)].map((m) => m[1]);
    }
    if (layerPath.startsWith('presentation/store')) {
        info.thunks = [...text.matchAll(/export\s+const\s+(\w+)\s*=\s*create\w*Thunk\s*\(\s*['"`]([^'"`]+)['"`]/g)]
            .map((m) => ({ name: m[1], type: m[2] }));
        const state = text.match(/interface\s+(\w*State)\s*\{/);
        if (state) info.state = { name: state[1], fields: interfaceMembers(text, state[1]) };
        const deps = text.match(/interface\s+(\w*Dependencies)\s*\{/);
        if (deps) info.dependencies = { name: deps[1], members: interfaceMembers(text, deps[1]) };
        info.selectors = [...text.matchAll(/export\s+const\s+(select\w+)/g)].map((m) => m[1]);
        const actions = text.match(/export\s+const\s+\{([^}]+)\}\s*=\s*\w+\.actions/);
        if (actions) info.actions = actions[1].split(',').map(squash).filter(Boolean);
    }
    if (layerPath.startsWith('presentation/hooks')) {
        const ret = text.match(/return\s*\{([\s\S]*?)\};?\s*\n\}/);
        if (ret) {
            info.returns = ret[1].replace(/\/\/.*$/gm, '').split(',').map((s) => squash(s).split(':')[0]).filter(Boolean);
        }
    }
    return info;
}

const LAYERS = [
    'domain/entities', 'domain/value-objects', 'domain/repositories', 'domain/usecases',
    'infrastructure/dtos', 'infrastructure/mappers', 'infrastructure/datasources', 'infrastructure/repositories',
    'di', 'presentation/viewmodels', 'presentation/store', 'presentation/hooks', 'presentation/components',
];

function layerOf(featureDir, file) {
    const r = rel(file).slice(rel(featureDir).length + 1);
    return LAYERS.find((l) => r.startsWith(`${l}/`)) ?? r.split('/').slice(0, -1).join('/') ?? '(root)';
}

const inventory = { root: rel(root) || '.', generatedAt: new Date().toISOString(), features: {}, shared: [], store: [], routes: [] };

const featuresDir = path.join(root, 'src', 'features');
if (fs.existsSync(featuresDir)) {
    for (const entry of fs.readdirSync(featuresDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
        const dir = path.join(featuresDir, entry.name);
        const layers = {};
        for (const f of walk(dir)) {
            const layer = layerOf(dir, f);
            (layers[layer] ??= []).push(describeFile(f, layer));
        }
        // Existing but empty layer folders tell the planner which structure the project already expects.
        for (const layer of LAYERS) {
            if (!layers[layer] && fs.existsSync(path.join(dir, ...layer.split('/')))) layers[layer] = [];
        }
        inventory.features[entry.name] = layers;
    }
}
inventory.shared = walk(path.join(root, 'src', 'shared')).map((f) => ({ file: rel(f), exports: exportsOf(read(f)) }));
inventory.store = walk(path.join(root, 'src', 'store')).map((f) => ({ file: rel(f), exports: exportsOf(read(f)), stub: read(f).trim() === '' }));
inventory.routes = walk(path.join(root, 'app')).filter((f) => /(page|layout|route)\.tsx?$/.test(f)).map(rel);

function toMarkdown(inv) {
    const out = [`# Clean Architecture inventory`, ``, `Root: \`${inv.root}\` — generated ${inv.generatedAt}`, ``];
    const names = Object.keys(inv.features);
    if (names.length === 0) out.push('_No features under src/features yet._', '');
    for (const name of names) {
        out.push(`## Feature \`${name}\``, '');
        for (const [layer, files] of Object.entries(inv.features[name])) {
            out.push(`### ${layer}`);
            if (files.length === 0) out.push('- _(empty folder — structure exists, nothing implemented)_');
            for (const f of files) {
                const ex = f.stub ? '_(empty stub file — extend it instead of creating a new one)_' : f.exports.map((e) => `${e.kind} ${e.name}`).join(', ') || '—';
                out.push(`- \`${f.file}\` — ${ex}`);
                f.contracts?.forEach((c) => {
                    out.push(`  - contract **${c.name}**`);
                    c.methods.forEach((m) => out.push(`    - \`${m}\``));
                });
                f.implements?.forEach((i) => out.push(`  - ${i.class} implements ${i.contracts}`));
                if (f.usecase) out.push(`  - \`${f.usecase.execute ?? 'execute: ?'}\` — depends on: ${f.usecase.dependsOn.join(', ') || '—'}`);
                if (f.entityMethods?.length) out.push(`  - methods: ${f.entityMethods.join(', ')}`);
                if (f.validators?.length) out.push(`  - validators: ${f.validators.join(', ')}`);
                if (f.state) out.push(`  - state ${f.state.name}: ${f.state.fields.join(' | ')}`);
                if (f.dependencies) out.push(`  - thunk deps ${f.dependencies.name}: ${f.dependencies.members.join(' | ')}`);
                f.thunks?.forEach((t) => out.push(`  - thunk \`${t.name}\` ('${t.type}')`));
                if (f.selectors?.length) out.push(`  - selectors: ${f.selectors.join(', ')}`);
                if (f.actions?.length) out.push(`  - actions: ${f.actions.join(', ')}`);
                if (f.returns?.length) out.push(`  - returns: { ${f.returns.join(', ')} }`);
            }
            out.push('');
        }
    }
    out.push('## Shared kernel (src/shared)');
    if (inv.shared.length === 0) out.push('_none_');
    for (const f of inv.shared) out.push(`- \`${f.file}\` — ${f.exports.map((e) => e.name).join(', ')}`);
    out.push('', '## Global store (src/store)');
    if (inv.store.length === 0) out.push('_none (Redux not bootstrapped)_');
    for (const f of inv.store) out.push(`- \`${f.file}\` — ${f.stub ? '_(empty stub)_' : f.exports.map((e) => e.name).join(', ')}`);
    out.push('', '## Routes (app/)');
    inv.routes.forEach((r) => out.push(`- \`${r}\``));
    return out.join('\n');
}

const md = toMarkdown(inventory);
if (outDir) {
    const dir = path.resolve(root, outDir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify(inventory, null, 2));
    fs.writeFileSync(path.join(dir, 'inventory.md'), md);
    console.log(`Inventory written to ${rel(path.join(dir, 'inventory.md'))} and inventory.json`);
} else {
    console.log(asJson ? JSON.stringify(inventory, null, 2) : md);
}
