import { CoreModule } from '@mavbot/core';
import { Module } from '@nestjs/common';
import { TopPlayersCommandService } from './top-players-command.service';
import { CanvasService } from './canvas.service';
import { PlayersCheckService } from './players-check.service';
import { TopPlayersDbService } from './top-players-db.service';
import { TopPlayersService } from './top-players.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerSessionEntity } from './player-session.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [CoreModule, TypeOrmModule.forFeature([PlayerSessionEntity]), HttpModule],
	providers: [TopPlayersCommandService, CanvasService, PlayersCheckService, TopPlayersDbService, TopPlayersService],
	exports: [TopPlayersCommandService],
})
export class TopPlayersModule {}
