import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { Create__Feature__UseCase } from '../domain/usecases/create-__feature-kebab__.usecase';
import { Get__Features__UseCase } from '../domain/usecases/get-__features-kebab__.usecase';
import type { __Feature__Datasource } from '../infrastructure/datasources/__feature-kebab__.datasource';
import { __Feature__HttpDatasource } from '../infrastructure/datasources/__feature-kebab__-http.datasource';
import { __Feature__MockDatasource } from '../infrastructure/datasources/__feature-kebab__-mock.datasource';
import { __Feature__RepositoryImpl } from '../infrastructure/repositories/__feature-kebab__.repository.impl';

/**
 * Composition root of the feature: the ONLY place that knows concrete classes.
 * Switch implementations with NEXT_PUBLIC_DATA_SOURCE=mock|http (default: mock).
 */
function createDatasource(): __Feature__Datasource {
    return process.env.NEXT_PUBLIC_DATA_SOURCE === 'http'
        ? new __Feature__HttpDatasource(createFetchHttpClient())
        : new __Feature__MockDatasource();
}

export function create__Feature__Container() {
    const repository = new __Feature__RepositoryImpl(createDatasource());

    return {
        get__Features__: new Get__Features__UseCase(repository),
        create__Feature__: new Create__Feature__UseCase(repository),
    };
}

export type __Feature__Container = ReturnType<typeof create__Feature__Container>;
