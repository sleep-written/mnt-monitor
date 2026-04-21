export interface MenuBuilderController {
    abort(): void;
    pause(message?: string): Promise<void>;
}