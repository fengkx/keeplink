import {PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query']
});
prisma.$use(async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  console.log(
    `Query ${params.model ?? 'RawQuery'}.${params.action} took ${
      after - before
    }ms`
  );

  return result;
});
