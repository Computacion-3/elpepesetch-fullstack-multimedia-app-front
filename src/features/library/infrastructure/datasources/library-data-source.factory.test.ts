import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getLibraryDataSourceMode } from './library-data-source.factory';

describe('getLibraryDataSourceMode', () => {
  it('defaults to REST and accepts the two supported transports', () => {
    assert.equal(getLibraryDataSourceMode(), 'rest');
    assert.equal(getLibraryDataSourceMode('rest'), 'rest');
    assert.equal(getLibraryDataSourceMode('graphql'), 'graphql');
  });

  it('rejects unknown transports with a clear setup message', () => {
    assert.throws(() => getLibraryDataSourceMode('soap'), /NEXT_PUBLIC_DATA_SOURCE.*rest.*graphql/);
  });
});
