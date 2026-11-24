#!/usr/bin/env node
// Instantiates the clean-feature templates for a new feature.
//
//   node .claude/skills/clean-feature/scripts/scaffold.mjs --name note [--plural notes]
//        [--layers domain,infrastructure,di,presentation,app] [--write] [--force] [--root .]
//
// Dry-run by default (prints what it would do). Never overwrites existing files unless --force.
// Also bootstraps src/shared and src/store when they are missing, and wires the new slice and
// container into src/store/store.ts through the <clean:*> marker comments.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(here, '..', 'templates');

function parseArgs(argv) {
    const args = { layers: 'domain,infrastructure,di,presentation,app', root: '.', write: false, force: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--write') args.write = true;
        else if (a === '--force') args.force = true;
        else if (a.startsWith('--')) args[a.slice(2)] = argv[++i];
    }
    return args;
}

const toWords = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_-]+/).filter(Boolean).map((w) => w.toLowerCase());
const pascal = (w) => w.map((x) => x[0].toUpperCase() + x.slice(1)).join('');
const camel = (w) => { const p = pascal(w); return p[0].toLowerCase() + p.slice(1); };
const kebab = (w) => w.join('-');

function tokensFor(name, plural) {
    const s = toWords(name);
    const p = toWords(plural ?? `${name}s`);
    return {
        '__Features__': pascal(p),
        '__features__': camel(p),
        '__features-kebab__': kebab(p),
        '__Feature__': pascal(s),
        '__feature__': camel(s),
        '__feature-kebab__': kebab(s),
    };
}

const apply = (text, tokens) =>
    Object.entries(tokens).reduce((acc, [k, v]) => acc.split(k).join(v), text);

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : [full];
    });
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.name) {
        console.error('Usage: scaffold.mjs --name <singular> [--plural <plural>] [--layers ...] [--write] [--force]');
        process.exit(2);
    }
    const root = path.resolve(args.root);
    const tokens = tokensFor(args.name, args.plural);
    const featureDir = path.join(root, 'src', 'features', tokens['__features-kebab__']);
    const layers = new Set(args.layers.split(',').map((l) => l.trim()));

    /** @type {{src: string, dest: string, kind: 'feature'|'bootstrap'}[]} */
    const jobs = [];
    for (const file of walk(path.join(templatesDir, 'feature'))) {
        const rel = path.relative(path.join(templatesDir, 'feature'), file);
        if (!layers.has(rel.split(path.sep)[0])) continue;
        jobs.push({ src: file, dest: path.join(featureDir, apply(rel, tokens).replace(/.tpl$/, '')), kind: 'feature' });
    }
    if (layers.has('app')) {
        for (const file of walk(path.join(templatesDir, 'app'))) {
            const rel = path.relative(path.join(templatesDir, 'app'), file);
            jobs.push({ src: file, dest: path.join(root, 'app', apply(rel, tokens).replace(/.tpl$/, '')), kind: 'feature' });
        }
    }
    for (const [tplSub, destSub] of [['shared', 'src/shared'], ['store', 'src/store']]) {
        for (const file of walk(path.join(templatesDir, tplSub))) {
            const rel = path.relative(path.join(templatesDir, tplSub), file);
            jobs.push({ src: file, dest: path.join(root, destSub, rel.replace(/.tpl$/, '')), kind: 'bootstrap' });
        }
    }

    const report = [];
    for (const job of jobs) {
        const exists = fs.existsSync(job.dest);
        const relDest = path.relative(root, job.dest).split(path.sep).join('/');
        if (exists && (job.kind === 'bootstrap' || !args.force)) {
            report.push(`skip    ${relDest} (exists)`);
            continue;
        }
        report.push(`${exists ? 'replace' : 'create '} ${relDest}`);
        if (args.write) {
            fs.mkdirSync(path.dirname(job.dest), { recursive: true });
            fs.writeFileSync(job.dest, apply(fs.readFileSync(job.src, 'utf8'), tokens));
        }
    }

    // Wire the feature into src/store/store.ts.
    const storePath = path.join(root, 'src', 'store', 'store.ts');
    const T = tokens;
    const slicePath = `@/src/features/${T['__features-kebab__']}/presentation/store/${T['__features-kebab__']}.slice`;
    const diPath = `@/src/features/${T['__features-kebab__']}/di/${T['__feature-kebab__']}.container`;
    const wiring = {
        '// <clean:imports>': [
            `import { ${T['__features__']}Slice } from '${slicePath}';`,
            `import type { ${T['__Features__']}Dependencies } from '${slicePath}';`,
            `import { create${T['__Feature__']}Container } from '${diPath}';`,
        ],
        '// <clean:slices>': [`    ${T['__features__']}Slice,`],
        '// <clean:extra>': [`        ${T['__features__']}: create${T['__Feature__']}Container() satisfies ${T['__Features__']}Dependencies,`],
    };
    const storeText = fs.existsSync(storePath)
        ? fs.readFileSync(storePath, 'utf8')
        : apply(fs.readFileSync(path.join(templatesDir, 'store', 'store.ts.tpl'), 'utf8'), tokens);
    const hasMarkers = Object.keys(wiring).every((m) => storeText.includes(m));
    const wantsWiring = layers.has('di') && layers.has('presentation');

    if (wantsWiring && hasMarkers && !storeText.includes(`${T['__features__']}Slice`)) {
        let next = storeText;
        for (const [marker, lines] of Object.entries(wiring)) {
            const idx = next.indexOf(marker);
            const lineEnd = next.indexOf('\n', idx);
            next = next.slice(0, lineEnd + 1) + lines.join('\n') + '\n' + next.slice(lineEnd + 1);
        }
        report.push('wire    src/store/store.ts (slice + thunk extraArgument)');
        if (args.write) fs.writeFileSync(storePath, next);
    } else if (wantsWiring && !hasMarkers) {
        report.push('MANUAL  src/store/store.ts has no <clean:*> markers. Add by hand:');
        for (const lines of Object.values(wiring)) for (const l of lines) report.push(`          ${l.trim()}`);
    }

    const layoutPath = path.join(root, 'app', 'layout.tsx');
    if (fs.existsSync(layoutPath) && !fs.readFileSync(layoutPath, 'utf8').includes('StoreProvider')) {
        report.push("MANUAL  app/layout.tsx: wrap {children} with <StoreProvider> from '@/src/store/StoreProvider'.");
    }

    console.log(`${args.write ? 'Scaffolded' : 'Dry run for'} feature "${T['__features-kebab__']}":`);
    for (const line of report) console.log(`  ${line}`);
    if (!args.write) console.log('\nRe-run with --write to apply.');
}

main();
