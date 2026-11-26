import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

/** Abstração do hash de senha, para o service não depender do bcrypt diretamente. */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
