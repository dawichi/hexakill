import { InjectionToken } from '@angular/core';

export type RandomSource = () => number;

export const RANDOM_SOURCE = new InjectionToken<RandomSource>('RANDOM_SOURCE');
