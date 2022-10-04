export class InvalidFileError extends Error {
    constructor() {
        super('Archivo "./appconfig.yml" inválido');
    }
}
