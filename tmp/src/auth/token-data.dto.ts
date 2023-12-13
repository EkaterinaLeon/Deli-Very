export type TokenDTO = {
    id: number;
    role: 'restaurant' | 'courier';
};
export function isPASTokenDto(data: any): data is TokenDTO {
    return typeof data.id === 'number' && ['restaurant', 'courier'].includes(data.role);
}
