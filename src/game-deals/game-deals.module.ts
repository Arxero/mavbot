import { CoreModule } from '@mavbot/core';
import { Module } from '@nestjs/common';
import { GameDealsCommandService } from './game-deals-command.service';
import { GameDealsDbService } from './game-deals-db.service';
import { GameDealsService } from './game-deals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameDealEntity } from './game-deal.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [CoreModule, TypeOrmModule.forFeature([GameDealEntity]), HttpModule],
	providers: [GameDealsCommandService, GameDealsDbService, GameDealsService],
	exports: [GameDealsCommandService],
})
export class GameDealsModule {}
