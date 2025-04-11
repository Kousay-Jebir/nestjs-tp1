export type SeedFactory<T> = () => Promise<T> | T;
