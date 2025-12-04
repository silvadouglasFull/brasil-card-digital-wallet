import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { customOptions } from "./swagger/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
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
    .addCookieAuth("access_token")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  console.log("To see docs visit http://localhost:3000/api/docs");
  SwaggerModule.setup("api/docs", app, document, customOptions);

  await app.listen(3000);
}
bootstrap();
