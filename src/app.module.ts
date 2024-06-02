import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import config from '../config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerSessionEntity } from './bot/player-session.entity';

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
				entities: [PlayerSessionEntity],
				synchronize: true,
				charset: 'utf8mb4',
				timezone: 'Z',
			}),
			inject: [ConfigService],
		}),
		BotModule,
		HttpModule,
	],
	controllers: [],
	providers: [LoggerService],
})
export class AppModule {}
