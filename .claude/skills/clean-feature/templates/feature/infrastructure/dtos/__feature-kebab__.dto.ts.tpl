/** Shapes exactly as the backend sends/receives them (snake_case, ISO strings...). */
export interface __Feature__ResponseDto {
    id: string;
    name: string;
    description?: string | null;
    created_at: string;
}

export interface Create__Feature__Dto {
    name: string;
    description?: string;
}
