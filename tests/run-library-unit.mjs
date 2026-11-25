import { spawnSync } from 'node:child_process';
import { relative, sep } from 'node:path';

const testFiles = [
  'src/features/library/di/library.container.test.ts',
  'src/features/library/domain/entities/library-entry.test.ts',
  'src/features/library/domain/usecases/add-library-entry.usecase.test.ts',
  'src/features/library/infrastructure/datasources/library-graphql.datasource.test.ts',
  'src/features/library/infrastructure/datasources/library-http.datasource.test.ts',
  'src/features/library/infrastructure/mappers/library-api-error.mapper.test.ts',
  'src/features/library/infrastructure/mappers/library-entry.mapper.test.ts',
  'src/features/library/infrastructure/repositories/library.repository.impl.test.ts',
  'src/shared/infrastructure/graphql-client.test.ts',
];

const compile = spawnSync(process.execPath, [
  'node_modules/typescript/bin/tsc',
  '--module', 'commonjs',
  '--moduleResolution', 'node',
  '--target', 'ES2022',
  '--outDir', 'temp/library-unit',
  '--rootDir', 'src',
  '--esModuleInterop',
  '--skipLibCheck',
  '--noEmit', 'false',
  '--pretty', 'false',
  ...testFiles,
], { stdio: 'inherit' });

if (compile.status !== 0) process.exit(compile.status ?? 1);

const compiledFiles = testFiles.map((file) =>
  `temp${sep}library-unit${sep}${relative('src', file).replace(/\.ts$/, '.js').split(/[\\/]/).join(sep)}`,
);
const run = spawnSync(process.execPath, ['--test', ...compiledFiles], { stdio: 'inherit' });
process.exit(run.status ?? 1);
