import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UsersModule } from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Users salary api')
    .setDescription('Test task for DBB junior backend developer')
    .setVersion('1.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [UsersModule],
  });
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.NESTJS_PORT);
  console.log(
    `Serves is listening on: http://localhost:${process.env.NESTJS_PORT}/`,
  );
}
bootstrap();
