import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  controllers: [AdminController],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],
})
export class AdminModule {}
