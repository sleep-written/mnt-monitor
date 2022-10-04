export class ShellLine {
    static reduce(content: string[]): string {
        return content.reduce(
            (prev, curr, i) => i > 0
                ?   `${prev} ${curr}`
                :   curr,
            ''
        );
    }

    #content: string;
    get content(): string {
        return this.#content;
    }

    #deleted = false;
    get deleted(): boolean {
        return this.#deleted;
    }

    constructor(...content: string[]) {
        this.#content = ShellLine.reduce(content);
        console.log(this.#content);
    }

    remove(): ShellLine {
        if (!this.#deleted) {
            const ESC = '\x1b';                 // ASCII escape character
            const CSI = ESC + '[';              // control sequence introducer

            process.stdout.write(CSI + 'A');    // moves cursor up one line
            process.stdout.write(CSI + 'K');    // clears from cursor to line end

            this.#content = '';
            this.#deleted = true;
        }

        return this;
    }

    replace(...content: string[]): ShellLine {
        this.remove();
        this.#content = ShellLine.reduce(content);
        
        console.log(this.#content);
        return this;
    }
}