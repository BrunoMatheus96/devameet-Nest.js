import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: ['error', 'log', 'warn', 'debug'] //Cria e controla o nível de Log na aplicação e quais Logs vão aparecer no console
    });

  //No CORS vamos deixar as APIs disponiveis para qualquer um, por isso o () está vazio
  app.enableCors(); //Dando as permissões CORS para aceitação de chamadas de origens diferentes

  app.useGlobalPipes(
    //classe
    new ValidationPipe({
      transform: true, //Opção que habilita a transformação que veio do POSTMAN para os objetos
      whitelist: true, //Só converte aquilo que tem mach em ambos
      forbidNonWhitelisted: false, //Não volta erro caso algum campo venha a mais do que é esperado
    }),
  );

  app.setGlobalPrefix('api'); //Setando o prefixo global das requisições para que todas as URL tenham o /api e se não tiver, não irá funcionar corretamente.

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();