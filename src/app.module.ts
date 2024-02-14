import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { UserModule } from './user/user.module';
import { MeetModule } from './meet/meet.module';
import { RoomModule } from './room/room.module';

//Decorator do estilo módulo
/*Módulo é um agrupamento de arquivo que fechamos como se fosse um micro serviço. Então módulo é uma parte do código
que funciona de forma autonoma (pode ter entrada e aída) mas funciona sozinho.*/
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AuthModule,
    UserModule,
    MeetModule,
    RoomModule
  ],
  controllers: [],
  providers: [
    {provide: APP_GUARD, useClass: JwtAuthGuard}
  ],
})
export class AppModule {}
