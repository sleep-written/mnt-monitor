import type { SpawnOptionsWithoutStdio } from 'node:child_process';
import { spawn } from 'node:child_process';

export interface AsyncSpawnOptions extends SpawnOptionsWithoutStdio {
    encoding?: BufferEncoding;
    throwsOnExitCode?: boolean;
}
export interface AsyncSpawnOutput {
    code: number | null;
    stdout?: string;
    stderr?: string;
}

export function asyncSpawn(cmd: string, argv?: string[], options?: AsyncSpawnOptions) {
    return new Promise<AsyncSpawnOutput>((resolve, reject) => {
        const task = spawn(cmd, argv, {
            ...options,
            stdio: 'pipe'
        });

        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];

        task.stdout.on('data', chunk => stdout.push(chunk));
        task.stderr.on('data', chunk => stderr.push(chunk));

        let rejected = false;
        task.once('error', err => {
            rejected = true;
            reject(err);
        });

        task.once('close', code => {
            if (rejected) {
                return;
            }

            const stdoutStr = Buffer
                .concat(stdout)
                .toString(options?.encoding ?? 'utf-8')
                .trimEnd();

            const stderrStr = Buffer
                .concat(stderr)
                .toString(options?.encoding ?? 'utf-8')
                .trimEnd();
                
            const output: AsyncSpawnOutput = { code };
            if (stdoutStr.length > 0) { output.stdout = stdoutStr; }
            if (stderrStr.length > 0) { output.stderr = stderrStr; }

            if (options?.throwsOnExitCode && code !== 0) {
                const error = new Error(output.stderr ?? output.stdout ?? 'Unknown error');
                rejected = true;
                reject(error);
            } else {
                resolve(output);
            }
        });
    });
}