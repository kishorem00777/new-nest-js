import { UnauthorizedException, ConflictException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('Email already registered');
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid or expired refresh token');
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token has expired');
  }
}
