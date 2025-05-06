import { SeedFactory } from './seed-factory';

export interface SeedEntityConfig<T> {
  entity: new () => T;
  factory: SeedFactory<T>;
  count: number;
}
