export interface MenuContext {
    ctrl: AbortController;
    pause(msg?: string): Promise<void>;
}