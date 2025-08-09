import type { User } from './shared-types';

describe('shared-types', () => {
  it('user type shape is compatible', () => {
    const user: User = {
      id: 'u_1',
      fullName: 'Test User',
      role: 'STAFF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(user.role).toBe('STAFF');
  });
});
