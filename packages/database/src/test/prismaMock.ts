import { PrismaClient } from '../generated/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

export function resetPrismaMock() {
  mockReset(prismaMock);
}
