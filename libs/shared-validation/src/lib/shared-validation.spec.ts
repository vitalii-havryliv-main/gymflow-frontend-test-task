import { createUserSchema } from './shared-validation';

describe('shared-validation schemas', () => {
  it('accepts valid user input', () => {
    const valid = {
      fullName: 'John Smith',
      role: 'STAFF',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
    };

    expect(() => createUserSchema.parse(valid)).not.toThrow();
  });

  it('rejects short fullName', () => {
    const invalid = { fullName: 'Al', role: 'MEMBER' };
    expect(() => createUserSchema.parse(invalid)).toThrow();
  });
});
