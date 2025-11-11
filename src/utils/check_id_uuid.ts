/* eslint-disable prettier/prettier */
export function isValidUUID(uuid: string): boolean {
    if (!uuid) {
        console.error('Invalid UUID: UUID is empty');
        return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(uuid);
    if (!isValid) {
        console.error(`Invalid UUID: ${uuid}`);
    }
    return isValid;
}
