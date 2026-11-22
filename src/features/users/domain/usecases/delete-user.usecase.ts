import type { UsersRepository } from '../repositories/users.repository';

export class DeleteUserUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, id: number): Promise<void> {
        return this.repository.remove(accessToken, id);
    }
}
