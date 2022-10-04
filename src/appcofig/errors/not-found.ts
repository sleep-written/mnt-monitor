export class NotFoundError extends Error {
    constructor() {
        super('Archivo "./appconfig.yml" no encontrado');
    }
}
