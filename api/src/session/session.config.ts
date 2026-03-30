import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

export function setupSession(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const PgSession = connectPgSimple(session);
  const pool = app.get<Pool>(Pool);

  app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
      }),
      secret: configService.get<string>('SESSION_SECRET') as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: configService.get<string>('NODE_ENV') === 'production',
      },
    }),
  );
}
