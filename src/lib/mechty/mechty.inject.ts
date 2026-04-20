export interface MechtyInject {
    dateConstructor?: {
        now(): number;
    };

    setTimeout?(
        callback: () => unknown,
        ms: number
    ): void;
}