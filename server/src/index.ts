import { FileSystem } from 'lib/file-system';
import { styleText } from 'node:util';

const controller = new AbortController();
const signal = controller.signal;
process.on('SIGINT', () => {
    if (!signal.aborted) {
        controller.abort();
    }
});

while (!signal.aborted) {
    console.clear();
    console.log('@mnt-monitor');
    console.log('------------');

    const entries = (await FileSystem.load()).filter(x => x.target !== 'none');
    let found = false;
    for (const entry of entries) {
        while (!await entry.isMounted()) {
            found = true;
            const name = styleText('greenBright', `"${entry.target}"`);

            try {
                await entry.mount();
            } catch (err) {
                console.error(err);
            }
        }
    }

    if (!found) {
        console.log('👀👀👀👀👀👀');
    }
    
    await new Promise(r => setTimeout(r, 1000));
}