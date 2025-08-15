import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

function loadModules(): (new () => any)[] {
  const modulesDir = path.join(__dirname);
  const moduleFiles = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        fs.existsSync(
          path.join(modulesDir, dirent.name, `${dirent.name}.module.js`),
        ),
    )
    .map((dirent) => {
      const modulePath = path.join(
        modulesDir,
        dirent.name,
        `${dirent.name}.module.js`,
      );
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const imported = require(modulePath) as Record<string, unknown>;
      const moduleClass = Object.values(imported).find(
        (exp: unknown) =>
          typeof exp === 'function' &&
          /Module$/.test((exp as { name?: string }).name || ''),
      );
      return moduleClass as new () => any;
    })
    .filter(Boolean);

  return moduleFiles;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'skillcert',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      namingStrategy: new SnakeNamingStrategy(),
    }),
    ...loadModules(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
