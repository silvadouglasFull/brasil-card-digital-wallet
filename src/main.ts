import { NestFactory } from '@nestjs/core';
import { ENV } from '../env';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(ENV.PORT ?? 3000);
}
bootstrap();
