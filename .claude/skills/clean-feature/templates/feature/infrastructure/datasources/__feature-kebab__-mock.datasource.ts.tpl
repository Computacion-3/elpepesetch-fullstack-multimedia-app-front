import type { Create__Feature__Dto, __Feature__ResponseDto } from '../dtos/__feature-kebab__.dto';
import type { __Feature__Datasource } from './__feature-kebab__.datasource';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class __Feature__MockDatasource implements __Feature__Datasource {
    // Seed with FIXED values: the store (and therefore this class) is created during render, and
    // Next.js 16 cacheComponents rejects new Date()/Date.now()/Math.random() during prerender.
    private items: __Feature__ResponseDto[] = [
        { id: '1', name: 'First __feature__', description: 'Seed data for local development.', created_at: '2026-01-01T00:00:00.000Z' },
    ];

    async fetchAll(): Promise<__Feature__ResponseDto[]> {
        await delay(400);
        return this.items.map((item) => ({ ...item }));
    }

    async fetchById(id: string): Promise<__Feature__ResponseDto | null> {
        await delay(200);
        const found = this.items.find((item) => item.id === id);
        return found ? { ...found } : null;
    }

    async create(dto: Create__Feature__Dto): Promise<__Feature__ResponseDto> {
        await delay(500);
        const created: __Feature__ResponseDto = {
            id: String(Date.now()),
            name: dto.name,
            description: dto.description,
            created_at: new Date().toISOString(),
        };
        this.items.push(created);
        return { ...created };
    }
}
