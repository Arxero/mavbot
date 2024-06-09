import { Repository } from 'typeorm';
import { PlayerSession, TopPlayerDb } from '../models';
import { PlayerSessionEntity, PlayerSessionParams } from '../player-session.entity';
import { LoggerService } from '../../logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TopPlayersDbService {
	constructor(
		private logger: LoggerService,
		@InjectRepository(PlayerSessionEntity) private playerSessionRepo: Repository<PlayerSessionEntity>,
	) {}

	async savePlayerSessions(model: PlayerSession[]): Promise<PlayerSessionEntity[]> {
		try {
			const data = model.map(x => new PlayerSessionEntity(x));
			this.logger.log(`Saving: ${model.map(ps => ps.name).join(', ')} to the database.`);

			return await this.playerSessionRepo.save(data);
		} catch (error) {
			this.logger.error(`Saving ${PlayerSessionEntity.name} failed with error: ${error}`);
			throw new Error(error);
		}
	}

	async findTopPlayers(params: PlayerSessionParams): Promise<TopPlayerDb[]> {
		try {
			return await this.playerSessionRepo
				.createQueryBuilder('session')
				.select('*')
				.addSelect('SUM(session.score)', 'totalScore')
				.addSelect('SUM(session.timePlayed)', 'totalTime')
				.where('session.createdAt BETWEEN :startDate AND :endDate', {
					startDate: params.startDate,
					endDate: params.endDate,
				})
				.groupBy('session.name')
				.having('SUM(session.score) >= :score', { score: params.scoreThreshold })
				.orderBy('totalTime', params.sortDirection)
				.addOrderBy('totalScore', params.sortDirection)
				.limit(params.take)
				.getRawMany();
		} catch (error) {
			this.logger.error(`Find for ${PlayerSessionEntity.name} failed with error: ${error}`);
			throw new Error(error);
		}
	}
}
