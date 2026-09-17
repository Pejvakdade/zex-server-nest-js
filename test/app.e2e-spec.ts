/** --------------------------------------------------------------------------------------------------------------------
 * @file app.e2e-spec.ts
 * @fileOverview boots the real AppModule - Postgres and Redis from `docker compose up -d`, the
 *               development env files, the seeders - with the same pipes / prefix / middleware as
 *               main.ts, and walks the surface a deploy must not break: health, a public read, auth
 *               on a guarded route, the admin sign-in, DTO whitelisting, and the security headers.
 *
 * Run with: bun run test:e2e   (needs the compose stack up)
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${process.env.APPLICATION_ENV || 'development'}` });

import helmet from 'helmet';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@src/app/app.module';
import { API_PREFIX } from '@src/values/constants';

describe('ZexServer API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true });
    // pino stays wired so its middleware runs (request-id header); the test:e2e script sets
    // LOG_LEVEL=silent so nothing is printed.
    app.useLogger(app.get(Logger));
    app.use(helmet({ contentSecurityPolicy: false }));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix(API_PREFIX.slice(1));

    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health reports both stores reachable', async () => {
    const response = await http.get(`${API_PREFIX}/health`).expect(200);

    expect(response.body.result).toEqual({ postgres: 'ok', redis: 'ok' });
  });

  it('answers with helmet, rate-limit and request-id headers', async () => {
    const response = await http.get(`${API_PREFIX}/license`).set('x-request-id', 'e2e-1').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-ratelimit-limit']).toBeDefined();
    expect(response.headers['x-request-id']).toBe('e2e-1');
  });

  it('GET /plan is public and returns the seeded catalogue grouped by product', async () => {
    const response = await http.get(`${API_PREFIX}/plan`).expect(200);

    expect(response.body.result).toEqual(expect.objectContaining({ 'VPS Hosting': expect.any(Array) }));
  });

  it('GET /user/me without a token is 401', async () => {
    await http.get(`${API_PREFIX}/user/me`).expect(401);
  });

  it('rejects a body with unknown fields (forbidNonWhitelisted)', async () => {
    const response = await http
      .post(`${API_PREFIX}/user/sign-in`)
      .send({ email: 'x@y.z', password: 'whatever', isAdmin: true })
      .expect(400);

    expect(response.body.message).toEqual(expect.arrayContaining([expect.stringContaining('isAdmin')]));
  });

  it('signs the seeded admin in and resolves /user/me from the token', async () => {
    const credentials = { email: process.env.DEFAULT_ADMIN_EMAIL, password: process.env.DEFAULT_ADMIN_PASSWORD };
    const signIn = await http.post(`${API_PREFIX}/user/sign-in`).send(credentials).expect(200);

    const { token, user } = signIn.body.result;
    expect(token).toEqual(expect.any(String));
    expect(user).not.toHaveProperty('password');

    const me = await http.get(`${API_PREFIX}/user/me`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.result).toMatchObject({ email: credentials.email.toLowerCase(), userType: 'admin' });
  });

  it('keeps a customer out of the staff-only user list', async () => {
    const signIn = await http
      .post(`${API_PREFIX}/user/sign-in`)
      .send({ email: 'ops@quantedgecapital.com', password: 'Password123!' })
      .expect(200);

    await http.get(`${API_PREFIX}/user`).set('Authorization', `Bearer ${signIn.body.result.token}`).expect(401);
  });
});
