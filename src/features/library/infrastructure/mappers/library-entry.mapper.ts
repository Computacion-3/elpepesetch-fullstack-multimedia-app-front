import { LibraryEntry } from '../../domain/entities/library-entry';
import type { LibraryEntryMockDto } from '../dtos/library.dto';

export class LibraryEntryMapper {
  static toDomain(dto: LibraryEntryMockDto): LibraryEntry {
    return new LibraryEntry(dto);
  }
}
