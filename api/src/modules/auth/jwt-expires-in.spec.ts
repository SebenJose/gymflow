import { parseExpiresIn } from './jwt-expires-in.js';

describe('parseExpiresIn', () => {
  it.each(['1d', '12h', '30 m', '1H'])('aceita a duração "%s"', (value) => {
    expect(parseExpiresIn(value)).toBe(value);
  });

  it('converte segundos puros em número', () => {
    expect(parseExpiresIn('3600')).toBe(3600);
  });

  it.each(['', 'um dia', '1 dia', '-5'])('rejeita "%s"', (value) => {
    expect(() => parseExpiresIn(value)).toThrow(/JWT_EXPIRES_IN inválido/);
  });
});
