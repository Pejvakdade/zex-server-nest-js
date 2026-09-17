import { Module          } from '@nestjs/common';
import { ConfigService   } from '@nestjs/config';
import { TypeOrmModule   } from '@nestjs/typeorm';

import { MIGRATIONS_GLOB } from '@src/database/migrations.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const synchronize = configService.get<string>('POSTGRES_SYNCHRONIZE') === 'true';

        return {
          type       : 'postgres' as const,
          host       : configService.get<string >('POSTGRES_HOST'    ),
          port       : configService.get<number >('POSTGRES_PORT'    ),
          username   : configService.get<string >('POSTGRES_USERNAME'),
          password   : configService.get<string >('POSTGRES_PASSWORD'),
          database   : configService.get<string >('POSTGRES_DATABASE'),
          autoLoadEntities: true,
          // schema is generated from the entities in development; production runs migrations instead:
          // with synchronize off, every pending file in src/database/migrations is applied at boot.
          // Bun executes the .ts migrations directly, so no compile step is involved.
          synchronize: synchronize,
          migrations : [MIGRATIONS_GLOB],
          migrationsRun: !synchronize,
          logging    : configService.get<string>('POSTGRES_LOGGING'    ) === 'true',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PostgresModule {}
