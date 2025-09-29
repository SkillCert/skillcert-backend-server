import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { RequestTimeoutInterceptor } from './common/interceptors/request-timeout.interceptor';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Apply global exception filters
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Apply global exception filter

  // Apply global validation pipe with best-practice options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );


  // Apply request timeout interceptor
  app.useGlobalInterceptors(new RequestTimeoutInterceptor(5000));

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SkillCert Backend API')
    .setDescription('The SkillCert learning platform API documentation')
    .setVersion('1.0')
    .addTag('skillcert')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

