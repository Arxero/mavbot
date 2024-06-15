import { Module } from '@nestjs/common';
import config from './core/env.parser';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerSessionEntity } from './top-players/player-session.entity';
import { AcfunModule } from './acfun/acfun.module';
import { TopPlayersModule } from './top-players/top-players.module';
import { GameDealEntity } from './game-deals/game-deal.entity';
import { GameDealsModule } from './game-deals/game-deals.module';
import { CommandsService } from './commands.service';
import { CoreModule } from './core';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [config] }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'mariadb',
				host: configService.get<string>('db.host'),
				port: configService.get<number>('db.port'),
				username: configService.get<string>('db.username'),
				password: configService.get<string>('db.password'),
				database: configService.get<string>('db.database'),
				entities: [PlayerSessionEntity, GameDealEntity],
				synchronize: true,
				charset: 'utf8mb4',
				timezone: 'Z',
			}),
			inject: [ConfigService],
		}),
		CoreModule,
		AcfunModule,
		TopPlayersModule,
		GameDealsModule,
	],
	controllers: [],
	providers: [CommandsService],
})
export class AppModule {}
