import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}
  use(req: any, res: any, next: NextFunction) {
    const token = req.headers['auth-user'] as string;
    const secret = process.env.SECRET;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Vous ne pouvez pas accéder à la ressource' });
    }
    try {
      const decoded = verify(token, `${secret}`) as {
        sub: string;
        userId: number;
        iat: number;
      };
      if (!decoded?.userId) {
        return res
          .status(401)
          .json({ message: 'Vous ne pouvez pas accéder à la ressource' });
      }
      req.user = { userId: decoded.userId };
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Vous ne pouvez pas accéder à la ressource' });
    }
  }
}
