import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração Global de Validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle("BrasilCard API")
    .setDescription("API de carteira digital com arquitetura EDA e Clean Code")
    .setVersion("1.0")
    .addTag("Auth", "Autenticação e Gestão de Acesso")
    .addTag("Wallet", "Operações Financeiras (Depósitos, Transferências)")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  console.log("To see docs visit http://localhost:3000/api/docs");
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3000);
}
bootstrap();
