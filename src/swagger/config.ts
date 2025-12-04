import { SwaggerCustomOptions } from "@nestjs/swagger";

export const customOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
  },
};
