import type { SocketTicket } from '../../domain/entities/socket-ticket';
import { User } from '../../domain/entities/user';
import type { ProfileDraft, RegisterDraft } from '../../domain/entities/user';
import type {
    RegisterRequestDto,
    SocketTokenResponseDto,
    UpdateProfileRequestDto,
    UserResponseDto,
} from '../dtos/auth.dto';

/** Translates between backend DTOs and domain entities. */
export class AuthMapper {
    static toUser(dto: UserResponseDto): User {
        const permissions = (dto.role.rolePermissions ?? []).flatMap((rp) =>
            rp.permission ? [rp.permission.name] : [],
        );
        // Un nombre o biografía vacíos cuentan como "sin dato" (el perfil permite borrarlos).
        return new User(
            dto.id,
            dto.username,
            dto.email,
            dto.fullName?.trim() || null,
            dto.role.name,
            permissions,
            dto.bio?.trim() || null,
        );
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

    /** Solo copia los campos presentes; nombre y biografía vacíos se envían para poder borrarlos. */
    static toUpdateProfileRequest(draft: ProfileDraft): UpdateProfileRequestDto {
        const body: UpdateProfileRequestDto = {};
        if (draft.username !== undefined) body.username = draft.username.trim();
        if (draft.email !== undefined) body.email = draft.email.trim();
        if (draft.fullName !== undefined) body.fullName = draft.fullName.trim();
        if (draft.bio !== undefined) body.bio = draft.bio.trim();
        if (draft.password !== undefined) body.password = draft.password;
        return body;
    }
}
