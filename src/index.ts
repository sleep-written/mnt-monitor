import { AppConfig, InvalidFileError, NotFoundError } from './appcofig/index.js';
import { Loop } from './loop.js';

try {
    console.clear();
    console.log('>> mnt-monitor.-\n');
    console.log('- Iniciando proceso...')

    const loop = new Loop();
    await loop.execute();
} catch (err: any) {
    console.log('-----------------------------------------------------------------');
    console.log('- [FAIL]', err?.message ?? 'Error no identificado...');

    if (
        (err instanceof InvalidFileError) ||
        (err instanceof NotFoundError)
    ) {
        // Fallo en lectura del archivo
        console.log('- Creando archivo "./appconfig.yml"...');
        await AppConfig.create();
        console.log(
            '- Configure el archivo recién creado',
            'y reinicie la aplicación.'
        );
    } else {
        // Fallo general
        console.log(
            '- ERROR: \n ',
            err?.message ?? 'Error no identificado'
        );
    }
} finally {
    console.log('-----------------------------------------------------------------');
}
