import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot({ isGlobal: true }), UsersModule],
})
export class AppModule {}
