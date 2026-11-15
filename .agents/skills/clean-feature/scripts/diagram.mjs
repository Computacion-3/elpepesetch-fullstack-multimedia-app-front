#!/usr/bin/env node
// Didactic Clean Architecture diagrams generated from the REAL code of a feature.
//
//   node .agents/skills/clean-feature/scripts/diagram.mjs [--feature <name>] [--root .]
//        [--out temp/clean-diagrams] [--format both|md|html]
//
// Produces, per feature:
//   1. Onion view     — layers as nested rings with the feature's files in each ring.
//   2. Dependency map — every file colored by layer; solid = value import, dotted = `import type`,
//                       red = import that breaks the dependency rule.
//   3. Request flows  — one sequence diagram per thunk: user → component → facade hook → thunk →
//                       use case → repository contract → implementation (bound in di/) → datasource,
//                       and back through mappers, reducer and selectors (with the error path).
// Without --feature: an architecture overview of all features + one section per feature.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(opt('root', '.'));
const outDir = path.resolve(root, opt('out', 'temp/clean-diagrams'));
const format = opt('format', 'both');
const onlyFeature = opt('feature');
const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js';

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const read = (f) => fs.readFileSync(f, 'utf8');
const walk = (dir) =>
    !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(e.name) ? [full] : [];
    });

// ---------------------------------------------------------------------------------------------
// Layers (same element model as eslint.clean.config.mjs)
// ---------------------------------------------------------------------------------------------
const LAYER_INFO = {
    'app': { title: 'app/ — Next.js routes', ring: 'frameworks', color: '#c5f6fa', stroke: '#0c8599',
        text: 'Entry points (URLs). Thin: they render a presentation screen and never access data.' },
    'app-store': { title: 'src/store — global Redux wiring', ring: 'frameworks', color: '#e5dbff', stroke: '#6741d9',
        text: 'makeStore() combines feature slices and injects each feature container as the thunk extraArgument.' },
    'pres-component': { title: 'presentation/components', ring: 'adapters', color: '#d3f9d8', stroke: '#2b8a3e',
        text: 'React UI. Renders view models and forwards user intents to the facade hook. No Redux, no business rules.' },
    'pres-hook': { title: 'presentation/hooks — facade', ring: 'adapters', color: '#b2f2bb', stroke: '#2b8a3e',
        text: 'The only bridge between components and Redux: selects state and dispatches thunks.' },
    'pres-store': { title: 'presentation/store — slice + thunks', ring: 'adapters', color: '#8ce99a', stroke: '#2b8a3e',
        text: 'UI state machine. Thunks call use cases received through `extra` and store view models.' },
    'pres-viewmodel': { title: 'presentation/viewmodels', ring: 'adapters', color: '#ebfbee', stroke: '#2b8a3e',
        text: 'Plain, serializable, UI-shaped data mapped from entities.' },
    'domain-usecase': { title: 'domain/usecases', ring: 'application', color: '#ffd8a8', stroke: '#d9480f',
        text: 'One application action each. Validates input and orchestrates repository contracts (decides the order).' },
    'domain-repository': { title: 'domain/repositories — contracts', ring: 'application', color: '#ffe8cc', stroke: '#d9480f',
        text: 'Ports: what data operations the domain needs, in domain terms. Implemented by infrastructure.' },
    'domain-entity': { title: 'domain/entities', ring: 'entities', color: '#fff3bf', stroke: '#e67700',
        text: 'Business concepts and invariants. Pure TypeScript: no React, Next, Redux or HTTP.' },
    'infra-repository': { title: 'infrastructure/repositories', ring: 'adapters', color: '#d0ebff', stroke: '#1864ab',
        text: 'Implements a domain contract using a datasource + mapper; translates errors into domain errors.' },
    'infra-mapper': { title: 'infrastructure/mappers', ring: 'adapters', color: '#e7f5ff', stroke: '#1864ab',
        text: 'DTO ⇄ entity translation.' },
    'infra-datasource': { title: 'infrastructure/datasources', ring: 'frameworks', color: '#a5d8ff', stroke: '#1864ab',
        text: 'The only code that talks to the outside world (fetch, SDK, mock). One branch per external service.' },
    'infra-dto': { title: 'infrastructure/dtos', ring: 'adapters', color: '#e7f5ff', stroke: '#1864ab',
        text: 'Exact wire shapes of the backend.' },
    'di': { title: 'di/ — composition root', ring: 'frameworks', color: '#f3d9fa', stroke: '#862e9c',
        text: 'Chooses concrete classes and builds datasource → repository → use cases.' },
    'shared-domain': { title: 'src/shared/domain', ring: 'entities', color: '#f8f9fa', stroke: '#495057',
        text: 'Shared kernel: domain errors.' },
    'shared-infrastructure': { title: 'src/shared/infrastructure', ring: 'frameworks', color: '#f1f3f5', stroke: '#495057',
        text: 'Shared adapters: http client, error translator.' },
    'shared': { title: 'src/shared', ring: 'adapters', color: '#f8f9fa', stroke: '#495057', text: 'Shared utilities.' },
};

const RINGS = [
    { id: 'frameworks', title: 'Frameworks & drivers — Next.js, Redux wiring, HTTP/SDK, DI' },
    { id: 'adapters', title: 'Interface adapters — presentation (UI/state) and infrastructure (repositories, mappers, DTOs)' },
    { id: 'application', title: 'Application — use cases and the contracts they need' },
    { id: 'entities', title: 'Enterprise — entities and business rules' },
];

function classify(file) {
    const r = rel(file);
    let m;
    if (r.startsWith('src/shared/domain/')) return { layer: 'shared-domain' };
    if (r.startsWith('src/shared/infrastructure/')) return { layer: 'shared-infrastructure' };
    if (r.startsWith('src/shared/')) return { layer: 'shared' };
    if (r.startsWith('src/store/')) return { layer: 'app-store' };
    if (r.startsWith('app/')) return { layer: 'app' };
    if ((m = r.match(/^src\/features\/([^/]+)\/(.+)$/))) {
        const [, feature, rest] = m;
        const map = [
            ['domain/usecases/', 'domain-usecase'], ['domain/repositories/', 'domain-repository'], ['domain/', 'domain-entity'],
            ['infrastructure/repositories/', 'infra-repository'], ['infrastructure/mappers/', 'infra-mapper'],
            ['infrastructure/datasources/', 'infra-datasource'], ['infrastructure/', 'infra-dto'],
            ['di/', 'di'], ['presentation/components/', 'pres-component'], ['presentation/hooks/', 'pres-hook'],
            ['presentation/store/', 'pres-store'], ['presentation/viewmodels/', 'pres-viewmodel'],
        ];
        const hit = map.find(([prefix]) => rest.startsWith(prefix));
        return { layer: hit ? hit[1] : 'unknown', feature };
    }
    return { layer: 'unknown' };
}

// Coarse groups used by the dependency rule.
const GROUP = (layer) =>
    layer.startsWith('domain-') ? 'domain'
        : layer.startsWith('infra-') ? 'infrastructure'
            : layer;

const ALLOWED = {
    'shared-domain': { value: ['shared-domain'] },
    'shared': { value: ['shared', 'shared-domain'] },
    'shared-infrastructure': { value: ['shared', 'shared-domain', 'shared-infrastructure'] },
    'domain': { value: ['domain', 'shared-domain'] },
    'infrastructure': { value: ['domain', 'infrastructure', 'shared', 'shared-domain', 'shared-infrastructure'] },
    'di': { value: ['domain', 'infrastructure', 'di', 'shared', 'shared-domain', 'shared-infrastructure'] },
    'pres-store': { value: ['shared-domain', 'pres-store', 'pres-viewmodel'], type: ['domain'] },
    'pres-viewmodel': { value: ['pres-viewmodel'], type: ['domain'] },
    'pres-hook': { value: ['pres-store', 'pres-viewmodel', 'pres-hook', 'app-store'], type: ['domain'] },
    'pres-component': { value: ['pres-component', 'pres-viewmodel', 'pres-hook', 'shared'], type: ['domain'] },
    'app-store': { value: ['app-store', 'pres-store', 'di'] },
    'app': { value: ['app', 'pres-hook', 'pres-component', 'app-store', 'shared'] },
};

function isAllowed(from, to, typeOnly) {
    const f = GROUP(from.layer);
    const t = GROUP(to.layer);
    const rule = ALLOWED[f];
    if (!rule) return true;
    const crossFeature = from.feature && to.feature && from.feature !== to.feature;
    if (crossFeature) {
        if (f === 'domain' && t === 'domain') return typeOnly;
        if (f === 'di' && t === 'di') return true;
        if (f === 'pres-component' && t === 'pres-component') return true;
        if (!['app', 'app-store'].includes(f)) return false;
    }
    if (rule.value.includes(t)) return true;
    return Boolean(typeOnly && rule.type?.includes(t));
}

// ---------------------------------------------------------------------------------------------
// Import graph
// ---------------------------------------------------------------------------------------------
function resolveImport(fromFile, spec) {
    let base;
    if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
    else if (spec.startsWith('@/')) base = path.join(root, spec.slice(2));
    else return null;
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

function importsOf(file) {
    const text = read(file);
    const out = [];
    const re = /(?:import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
    for (const m of text.matchAll(re)) {
        const clause = m[2];
        const typeOnly = Boolean(m[1]) || (/^\{[\s\S]*\}$/.test(clause.trim()) &&
            clause.replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean).every((s) => s.startsWith('type ')));
        out.push({ spec: m[3], typeOnly, target: resolveImport(file, m[3]) });
    }
    return out;
}

const allFiles = [
    ...walk(path.join(root, 'src')),
    ...walk(path.join(root, 'app')),
];
const fileInfo = new Map(allFiles.map((f) => [f, { file: f, ...classify(f), imports: importsOf(f) }]));

// ---------------------------------------------------------------------------------------------
// Mermaid helpers
// ---------------------------------------------------------------------------------------------
const esc = (s) => String(s).replace(/"/g, '#quot;').replace(/</g, '#lt;').replace(/>/g, '#gt;');
const mainExport = (file) => {
    const m = read(file).match(/export\s+(?:default\s+)?(?:abstract\s+)?(?:class|function|const|interface)\s+(\w+)/);
    return m ? m[1] : '';
};

function classDefs() {
    return Object.entries(LAYER_INFO)
        .map(([k, v]) => `    classDef ${k.replace(/-/g, '_')} fill:${v.color},stroke:${v.stroke},color:#212529,stroke-width:1px`)
        .join('\n');
}

function featureFiles(feature) {
    const inFeature = [...fileInfo.values()].filter((i) => i.feature === feature);
    const set = new Set(inFeature.map((i) => i.file));
    // One hop outside the feature: store wiring, shared kernel, routes that use it.
    for (const info of fileInfo.values()) {
        if (set.has(info.file)) continue;
        const touches = info.imports.some((imp) => imp.target && set.has(imp.target));
        const usedBy = inFeature.some((i) => i.imports.some((imp) => imp.target === info.file));
        if (touches || usedBy) set.add(info.file);
    }
    return [...set].map((f) => fileInfo.get(f));
}

function onionDiagram(files, label) {
    const lines = ['flowchart TB'];
    const byRing = Object.fromEntries(RINGS.map((r) => [r.id, []]));
    files.forEach((f) => {
        const ring = LAYER_INFO[f.layer]?.ring;
        if (ring) byRing[ring].push(f);
    });
    const open = [];
    RINGS.forEach((ring, depth) => {
        const pad = '  '.repeat(depth + 2);
        lines.push(`${'  '.repeat(depth + 1)}subgraph ring_${ring.id}["${esc(ring.title)}"]`);
        open.push(depth);
        // One node per layer listing its files keeps the rings compact and readable.
        const layersInRing = GRAPH_ORDER.filter((l) => byRing[ring.id].some((f) => f.layer === l));
        layersInRing.forEach((layer) => {
            const names = byRing[ring.id].filter((f) => f.layer === layer).map((f) => esc(path.basename(f.file)));
            lines.push(`${pad}${ring.id}_${layer.replace(/-/g, '_')}["<b>${esc(LAYER_INFO[layer].title)}</b><br/>${names.join('<br/>')}"]:::${layer.replace(/-/g, '_')}`);
        });
        if (layersInRing.length === 0) lines.push(`${pad}empty_${ring.id}["(nothing yet)"]`);
    });
    for (let d = open.length - 1; d >= 0; d--) lines.push(`${'  '.repeat(d + 1)}end`);
    lines.push('    style ring_frameworks fill:#e7f5ff,stroke:#1864ab');
    lines.push('    style ring_adapters fill:#ebfbee,stroke:#2b8a3e');
    lines.push('    style ring_application fill:#fff4e6,stroke:#d9480f');
    lines.push('    style ring_entities fill:#fff9db,stroke:#e67700');
    lines.push(classDefs());
    return { title: `Onion view — ${label}`, code: lines.join('\n') };
}

const GRAPH_ORDER = ['app', 'pres-component', 'pres-hook', 'pres-store', 'pres-viewmodel', 'app-store', 'di',
    'domain-usecase', 'domain-repository', 'domain-entity', 'infra-repository', 'infra-mapper', 'infra-datasource',
    'infra-dto', 'shared-domain', 'shared-infrastructure', 'shared', 'unknown'];

function dependencyDiagram(files, label) {
    const ids = new Map(files.map((f, i) => [f.file, `f${i}`]));
    const lines = ['flowchart LR'];
    for (const layer of GRAPH_ORDER) {
        const members = files.filter((f) => f.layer === layer);
        if (!members.length) continue;
        lines.push(`  subgraph L_${layer.replace(/-/g, '_')}["${esc(LAYER_INFO[layer]?.title ?? layer)}"]`);
        for (const f of members) {
            const exp = mainExport(f.file);
            lines.push(`    ${ids.get(f.file)}["${esc(path.basename(f.file))}${exp ? `<br/><small>${esc(exp)}</small>` : ''}"]:::${layer.replace(/-/g, '_')}`);
        }
        lines.push('  end');
        lines.push(`  style L_${layer.replace(/-/g, '_')} fill:#ffffff,stroke:#adb5bd`);
    }
    const violations = [];
    const redLinks = [];
    let edge = 0;
    for (const f of files) {
        const seen = new Set();
        for (const imp of f.imports) {
            if (!imp.target || !ids.has(imp.target) || imp.target === f.file) continue;
            const key = `${imp.target}|${imp.typeOnly}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const to = fileInfo.get(imp.target);
            const ok = isAllowed(f, to, imp.typeOnly);
            lines.push(`  ${ids.get(f.file)} ${imp.typeOnly ? '-.->' : '-->'} ${ids.get(imp.target)}`);
            if (!ok) {
                redLinks.push(edge);
                violations.push(`${rel(f.file)} → ${rel(imp.target)}${imp.typeOnly ? ' (type)' : ''}: ${f.layer} must not depend on ${to.layer}`);
            }
            edge++;
        }
    }
    if (redLinks.length) lines.push(`  linkStyle ${redLinks.join(',')} stroke:#e03131,stroke-width:3px`);
    lines.push(classDefs());
    return { title: `Dependency map — ${label}`, code: lines.join('\n'), violations };
}

// ---------------------------------------------------------------------------------------------
// Request flows (sequence diagrams) traced from the code
// ---------------------------------------------------------------------------------------------
const filesOf = (feature, layer) => [...fileInfo.values()].filter((i) => i.feature === feature && i.layer === layer);
const classIn = (files, re) => {
    for (const f of files) {
        const m = read(f.file).match(re);
        if (m) return { file: f.file, text: read(f.file), match: m };
    }
    return null;
};
const methodBody = (text, name) => {
    const m = new RegExp(`(?:async\\s+)?${name}\\s*\\([^)]*\\)[^{]*\\{`).exec(text);
    if (!m) return '';
    let depth = 0;
    for (let i = m.index + m[0].length - 1; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}' && --depth === 0) return text.slice(m.index, i);
    }
    return '';
};

function traceThunks(feature) {
    const flows = [];
    const slices = filesOf(feature, 'pres-store').filter((f) => f.file.endsWith('.slice.ts'));
    const containers = filesOf(feature, 'di');
    for (const slice of slices) {
        const text = read(slice.file);
        const sliceName = text.match(/createSlice\(\s*\{\s*name:\s*['"]([^'"]+)['"]/)?.[1] ?? feature;
        const thunkRe = /export\s+const\s+(\w+)\s*=\s*create\w*Thunk\s*\(\s*['"`]([^'"`]+)['"`]/g;
        for (const t of text.matchAll(thunkRe)) {
            const body = text.slice(t.index, t.index + 1500);
            const extraCall = body.match(/extra\.(\w+)\.(\w+)\.execute\(([^)]*)\)/);
            const directContainer = body.match(/(\w+Container)\.(\w+)\.execute\(([^)]*)\)/);
            const ucKey = extraCall?.[2] ?? directContainer?.[2];
            const flow = { thunk: t[1], type: t[2], sliceName, ucKey, injectedVia: extraCall ? 'extra' : directContainer ? 'container-import' : 'unknown',
                vmMapper: body.match(/(\w+ViewModelMapper)\.toViewModel/)?.[1], rejects: /rejectWithValue/.test(body) };

            // Use case class from the container.
            const binding = ucKey && classIn(containers, new RegExp(`${ucKey}\\s*:\\s*new\\s+(\\w+)\\s*\\(`));
            flow.useCase = binding?.match[1] ?? (ucKey ? `${ucKey} use case` : 'use case');
            flow.container = binding ? path.basename(binding.file) : containers[0] ? path.basename(containers[0].file) : 'di container';
            const ucFile = classIn(filesOf(feature, 'domain-usecase'), new RegExp(`class\\s+${flow.useCase}\\b`));
            if (ucFile) {
                const exec = methodBody(ucFile.text, 'execute');
                flow.validates = exec.match(/\b(assert\w+|validate\w+)\(/)?.[1];
                flow.repoCalls = [...exec.matchAll(/this\.(\w+)\.(\w+)\(/g)].map((m) => ({ field: m[1], method: m[2] }));
                flow.repoContracts = [...ucFile.text.matchAll(/private\s+readonly\s+(\w+)\s*:\s*(\w+)/g)].map((m) => ({ field: m[1], type: m[2] }));
                flow.ucSignature = ucFile.text.match(/execute\s*\(([^)]*)\)\s*:\s*Promise<([^>]+>?)>/);
            }
            // Repository impl + datasource for the first repository call.
            const call = flow.repoCalls?.[0];
            const contract = call && flow.repoContracts?.find((c) => c.field === call.field)?.type;
            flow.contract = contract ?? `${feature} repository`;
            flow.repoMethod = call?.method ?? 'method';
            const impl = contract && [...fileInfo.values()].map((i) => i.file).filter((f) => rel(f).includes('/infrastructure/repositories/'))
                .map((f) => ({ f, text: read(f) })).find(({ text: tx }) => new RegExp(`implements\\s+[\\w\\s,]*\\b${contract}\\b`).test(tx));
            if (impl) {
                flow.impl = impl.text.match(/class\s+(\w+)/)?.[1];
                const mbody = methodBody(impl.text, flow.repoMethod);
                flow.dsMethod = mbody.match(/this\.\w*[dD]ata[sS]ource\w*\.(\w+)\(/)?.[1];
                flow.toDomain = mbody.match(/(\w+Mapper)\.toDomain/)?.[1];
                flow.toDto = mbody.match(/(\w+Mapper)\.(to\w*Dto)/)?.slice(1, 3).join('.');
                flow.translatesErrors = /toDomainError/.test(mbody);
                flow.dsContract = impl.text.match(/constructor\s*\([^)]*:\s*(\w+)/)?.[1];
                flow.dsImpls = flow.dsContract
                    ? [...fileInfo.values()].filter((i) => i.layer === 'infra-datasource')
                        .flatMap((i) => [...read(i.file).matchAll(new RegExp(`class\\s+(\\w+)[^{]*implements\\s+[\\w\\s,]*\\b${flow.dsContract}\\b`, 'g'))].map((m) => m[1]))
                    : [];
            }
            // Hook and component that trigger the thunk.
            const hook = [...fileInfo.values()].filter((i) => i.layer === 'pres-hook')
                .map((i) => ({ i, text: read(i.file) })).find(({ text: tx }) => new RegExp(`\\b${flow.thunk}\\b`).test(tx));
            if (hook) {
                flow.hook = hook.text.match(/export\s+function\s+(use\w+)/)?.[1] ?? path.basename(hook.i.file);
                const effect = hook.text.match(new RegExp(`useEffect\\([\\s\\S]{0,250}?dispatch\\(\\s*${flow.thunk}\\(`));
                const cb = [...hook.text.matchAll(/const\s+(\w+)\s*=\s*(?:useCallback\()?\s*(?:async\s*)?\(([^)]*)\)[^=]*=>\s*\{?([\s\S]*?)(?:\n\s{4}\}|\);)/g)]
                    .find((m) => new RegExp(`dispatch\\(\\s*${flow.thunk}\\(`).test(m[3]));
                flow.trigger = effect ? { kind: 'mount' } : cb ? { kind: 'action', fn: cb[1] } : { kind: 'action', fn: flow.thunk };
                flow.selectors = [...hook.text.matchAll(/useAppSelector\(\s*(select\w+)/g)].map((m) => m[1]);
                const comp = [...fileInfo.values()].filter((i) => ['pres-component', 'app'].includes(i.layer))
                    .find((i) => i.imports.some((imp) => imp.target === hook.i.file));
                flow.component = comp ? path.basename(comp.file).replace(/\.tsx?$/, '') : 'Component';
            }
            flows.push(flow);
        }
    }
    return flows;
}

function sequenceDiagram(flow) {
    const L = [];
    const p = (s) => esc(s);
    L.push('sequenceDiagram');
    L.push('    autonumber');
    L.push('    actor U as User');
    L.push('    box rgb(211,249,216) Presentation');
    L.push(`        participant C as ${p(flow.component ?? 'Component')}`);
    L.push(`        participant H as ${p(flow.hook ?? 'facade hook')}`);
    L.push(`        participant T as ${p(flow.thunk)} (thunk)`);
    L.push(`        participant S as store: ${p(flow.sliceName)} slice`);
    L.push('    end');
    L.push('    box rgb(255,232,204) Domain');
    L.push(`        participant UC as ${p(flow.useCase)}`);
    L.push(`        participant R as ${p(flow.contract)} (contract)`);
    L.push('    end');
    L.push('    box rgb(208,235,255) Infrastructure');
    L.push(`        participant RI as ${p(flow.impl ?? 'RepositoryImpl')}`);
    L.push(`        participant DS as ${p(flow.dsImpls?.length ? flow.dsImpls.join(' | ') : (flow.dsContract ?? 'Datasource'))}`);
    L.push('    end');
    L.push('    participant API as Backend / mock data');

    if (flow.trigger?.kind === 'mount') {
        L.push('    U->>C: opens the screen');
        L.push(`    C->>H: ${p(flow.hook ?? 'useFeature')}()`);
        L.push(`    H->>T: useEffect: status is 'idle' → dispatch(${p(flow.thunk)}())`);
    } else {
        L.push('    U->>C: interacts (e.g. submits the form)');
        L.push(`    C->>H: ${p(flow.trigger?.fn ?? flow.thunk)}(params)`);
        L.push(`    H->>T: dispatch(${p(flow.thunk)}(params))`);
    }
    L.push(`    T-->>S: ${p(flow.type)}/pending`);
    const via = flow.injectedVia === 'extra' ? `extra.${flow.sliceName}.${flow.ucKey}` : flow.injectedVia === 'container-import' ? `container.${flow.ucKey} ⚠ imported directly` : flow.ucKey ?? 'useCase';
    L.push(`    T->>UC: ${p(via)}.execute()`);
    if (flow.validates) L.push(`    Note over UC: ${p(flow.validates)}() — invariants checked BEFORE persistence`);
    L.push(`    UC->>R: ${p(flow.repoMethod)}()`);
    L.push(`    Note over R,RI: ${p(flow.container)} binds the contract to its implementation`);
    L.push(`    R->>RI: ${p(flow.repoMethod)}()`);
    if (flow.toDto) L.push(`    Note over RI: ${p(flow.toDto)}(params) → DTO`);
    L.push(`    RI->>DS: ${p(flow.dsMethod ?? 'call')}()`);
    L.push('    DS->>API: HTTP request / SDK call / in-memory mock');
    L.push('    API-->>DS: raw response');
    L.push('    DS-->>RI: DTO');
    L.push('    alt success');
    L.push(`        RI-->>UC: entity (${p(flow.toDomain ?? 'Mapper')}.toDomain)`);
    L.push('        UC-->>T: domain result');
    L.push(`        T-->>S: ${p(flow.type)}/fulfilled — ${p(flow.vmMapper ?? 'ViewModelMapper')}.toViewModel → plain view models`);
    L.push('    else failure');
    L.push(`        RI-->>UC: throws DomainError${flow.translatesErrors ? ' (toDomainError)' : ''}`);
    L.push('        UC-->>T: rejects');
    L.push(`        T-->>S: ${p(flow.type)}/rejected — ${flow.rejects ? 'rejectWithValue(message)' : '⚠ no rejectWithValue'}`);
    L.push('    end');
    L.push(`    S-->>H: ${p(flow.selectors?.length ? flow.selectors.join(', ') : 'selectors')}`);
    L.push('    H-->>C: items, flags, errorMessage');
    L.push('    C-->>U: re-render');
    return { title: `Request flow — ${flow.thunk} ('${flow.type}')`, code: L.join('\n') };
}

function overviewDiagram(features) {
    const lines = ['flowchart LR'];
    const layers = ['app', 'presentation', 'domain', 'infrastructure', 'di', 'app-store'];
    const cls = { app: 'app', presentation: 'pres_store', domain: 'domain_usecase', infrastructure: 'infra_repository', di: 'di', 'app-store': 'app_store' };
    const coarse = (l) => (l.startsWith('pres-') ? 'presentation' : GROUP(l));
    const edges = new Map();
    for (const feature of features) {
        lines.push(`  subgraph F_${feature.replace(/\W/g, '_')}["feature: ${esc(feature)}"]`);
        for (const layer of ['presentation', 'domain', 'infrastructure', 'di']) {
            const count = [...fileInfo.values()].filter((i) => i.feature === feature && coarse(i.layer) === layer).length;
            if (count) lines.push(`    ${feature.replace(/\W/g, '_')}_${layer}["${layer}<br/><small>${count} file(s)</small>"]:::${cls[layer]}`);
        }
        lines.push('  end');
    }
    lines.push('  app_routes["app/ routes"]:::app');
    lines.push('  global_store["src/store"]:::app_store');
    const nodeOf = (i) => (i.layer === 'app' ? 'app_routes' : i.layer === 'app-store' ? 'global_store'
        : i.feature ? `${i.feature.replace(/\W/g, '_')}_${coarse(i.layer)}` : null);
    for (const i of fileInfo.values()) {
        for (const imp of i.imports) {
            const to = imp.target && fileInfo.get(imp.target);
            if (!to) continue;
            const a = nodeOf(i);
            const b = nodeOf(to);
            if (!a || !b || a === b) continue;
            const ok = isAllowed(i, to, imp.typeOnly);
            const key = `${a}|${b}`;
            edges.set(key, (edges.get(key) ?? true) && ok);
        }
    }
    const red = [];
    [...edges.entries()].forEach(([key, ok], idx) => {
        const [a, b] = key.split('|');
        lines.push(`  ${a} --> ${b}`);
        if (!ok) red.push(idx);
    });
    if (red.length) lines.push(`  linkStyle ${red.join(',')} stroke:#e03131,stroke-width:3px`);
    lines.push(classDefs());
    void layers;
    return { title: 'Architecture overview — features and layers', code: lines.join('\n') };
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
const LEGEND = [
    '**How to read these diagrams**',
    '',
    '- **Dependency rule:** arrows point from the file that imports to the file it depends on. Dependencies must point *inward* (towards the domain). A **red** arrow breaks the rule.',
    '- **Solid arrow** = value import (uses code). **Dotted arrow** = `import type` (only shapes, erased at build time).',
    '- **Colors:** green = presentation, orange/yellow = domain, blue = infrastructure, purple = composition (di / src/store), cyan = Next.js routes.',
    '- **Request flow:** the presentation makes ONE call to a use case; the use case decides the order across repository *contracts*; only datasources talk to the outside world; results come back as entities and are turned into plain view models before entering Redux.',
];

function layerGlossary(files) {
    const used = [...new Set(files.map((f) => f.layer))].filter((l) => LAYER_INFO[l]);
    return used.map((l) => `- **${LAYER_INFO[l].title}** — ${LAYER_INFO[l].text}`);
}

function renderMarkdown(title, sections) {
    const out = [`# ${title}`, '', `_Generated ${new Date().toISOString()} by clean-feature/diagram.mjs from the current code._`, '', ...LEGEND, ''];
    for (const s of sections) {
        out.push(`## ${s.heading}`, '');
        if (s.intro) out.push(...s.intro, '');
        for (const d of s.diagrams) {
            out.push(`### ${d.title}`, '', '```mermaid', d.code, '```', '');
            if (d.violations?.length) out.push('**Violations:**', ...d.violations.map((v) => `- ${v}`), '');
        }
    }
    return out.join('\n');
}

function mdToHtmlInline(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderHtml(title, sections) {
    const list = (items) => `<ul>${items.filter((l) => l.startsWith('- ')).map((l) => `<li>${mdToHtmlInline(l.slice(2))}</li>`).join('')}</ul>`;
    const body = sections.map((s) => `
    <section>
      <h2>${mdToHtmlInline(s.heading)}</h2>
      ${s.intro ? list(s.intro) : ''}
      ${s.diagrams.map((d) => `
      <figure>
        <figcaption>${mdToHtmlInline(d.title)}</figcaption>
        <pre class="mermaid">${d.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        ${d.violations?.length ? `<div class="violations"><strong>Violations</strong><ul>${d.violations.map((v) => `<li>${mdToHtmlInline(v)}</li>`).join('')}</ul></div>` : ''}
      </figure>`).join('')}
    </section>`).join('');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${mdToHtmlInline(title)}</title>
<style>
  :root { --bg: #f8f9fa; --card: #ffffff; --text: #212529; --muted: #6c757d; --border: #dee2e6; --bad: #e03131; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.55 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--text); }
  header, main { max-width: 1200px; margin: 0 auto; padding: 16px; }
  h1 { font-size: 1.6rem; margin: 8px 0 4px; }
  h2 { font-size: 1.25rem; margin: 28px 0 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
  .muted { color: var(--muted); font-size: .9rem; }
  .legend, figure { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin: 16px 0; }
  figure { overflow-x: auto; }
  figcaption { font-weight: 600; margin-bottom: 8px; }
  .violations { border-left: 4px solid var(--bad); padding: 4px 12px; margin-top: 12px; background: #fff5f5; }
  code { background: #f1f3f5; padding: 1px 4px; border-radius: 4px; }
  .mermaid { background: #fff; margin: 0; }
</style>
</head>
<body>
<header>
  <h1>${mdToHtmlInline(title)}</h1>
  <p class="muted">Generated ${new Date().toISOString()} by clean-feature/diagram.mjs from the current code.</p>
  <div class="legend">${list(LEGEND.slice(2))}</div>
</header>
<main>${body}
</main>
<script src="${MERMAID_CDN}"></script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'base', securityLevel: 'strict', flowchart: { htmlLabels: true, curve: 'basis' },
    themeVariables: { fontFamily: 'system-ui, sans-serif', fontSize: '14px' } });
</script>
</body>
</html>
`;
}

function sectionsForFeature(feature) {
    const files = featureFiles(feature);
    const flows = traceThunks(feature);
    const dep = dependencyDiagram(files, feature);
    return {
        heading: `Feature \`${feature}\``,
        intro: layerGlossary(files),
        diagrams: [onionDiagram(files, feature), dep, ...flows.map(sequenceDiagram)],
        violations: dep.violations,
    };
}

const featuresDir = path.join(root, 'src', 'features');
const features = fs.existsSync(featuresDir)
    ? fs.readdirSync(featuresDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
        .filter((f) => [...fileInfo.values()].some((i) => i.feature === f))
    : [];

if (onlyFeature && !features.includes(onlyFeature)) {
    console.error(`Feature "${onlyFeature}" not found (or has no files). Available: ${features.join(', ') || '—'}`);
    process.exit(1);
}

const selected = onlyFeature ? [onlyFeature] : features;
const sections = selected.map(sectionsForFeature);
if (!onlyFeature && features.length > 1) sections.unshift({ heading: 'Overview', diagrams: [overviewDiagram(features)] });
const title = onlyFeature ? `Clean Architecture — ${onlyFeature}` : 'Clean Architecture — project';
const baseName = onlyFeature ?? 'project';

fs.mkdirSync(outDir, { recursive: true });
const written = [];
if (format === 'both' || format === 'md') {
    const p = path.join(outDir, `${baseName}.md`);
    fs.writeFileSync(p, renderMarkdown(title, sections));
    written.push(p);
}
if (format === 'both' || format === 'html') {
    const p = path.join(outDir, `${baseName}.html`);
    fs.writeFileSync(p, renderHtml(title, sections));
    written.push(p);
}
const totalViolations = sections.reduce((n, s) => n + (s.violations?.length ?? 0), 0);
console.log(`Diagrams for ${selected.join(', ') || '(no features)'}:`);
written.forEach((p) => console.log(`  ${rel(p)}`));
console.log(`Dependency-rule violations drawn in red: ${totalViolations}`);
