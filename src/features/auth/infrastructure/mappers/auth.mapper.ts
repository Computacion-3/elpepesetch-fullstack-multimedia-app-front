import type { SocketTicket } from '../../domain/entities/socket-ticket';
import { User } from '../../domain/entities/user';
import type { RegisterDraft } from '../../domain/entities/user';
import type { RegisterRequestDto, SocketTokenResponseDto, UserResponseDto } from '../dtos/auth.dto';

/** Translates between backend DTOs and domain entities. */
export class AuthMapper {
    static toUser(dto: UserResponseDto): User {
        const permissions = (dto.role.rolePermissions ?? []).flatMap((rp) =>
            rp.permission ? [rp.permission.name] : [],
        );
        return new User(dto.id, dto.username, dto.email, dto.fullName ?? null, dto.role.name, permissions);
    }

    static toSocketTicket(dto: SocketTokenResponseDto): SocketTicket {
        return { token: dto.token, expiresInSeconds: dto.expiresIn };
    }

    static toRegisterRequest(draft: RegisterDraft): RegisterRequestDto {
        const body: RegisterRequestDto = {
            username: draft.username,
            email: draft.email,
            password: draft.password,
        };
        const fullName = draft.fullName?.trim();
        if (fullName) body.fullName = fullName;
        return body;
    }
}
