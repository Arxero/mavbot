import { Injectable } from 'injection-js';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { PlayerSession, TopPlayerDb } from './models';
import { PlayerSessionEntity, PlayerSessionParams } from './player-session.entity';

@Injectable()
export class DbService {
	db: DataSource;

	private dbCredentials = [process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE];
	private dataSourceOptions: DataSourceOptions;

	get playerSessionRepo(): Repository<PlayerSessionEntity> {
		return this.db.getRepository(PlayerSessionEntity);
	}

	constructor(private logger: LoggerService) {
		if (this.dbCredentials.some(x => !x)) {
			this.logger.error('DB credentials were not provided.');
		} else {
			this.dataSourceOptions = {
				type: 'mariadb',
				host: process.env.DB_HOST,
				port: +process.env.DB_PORT!,
				username: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_DATABASE,
				entities: [PlayerSessionEntity],
				synchronize: true,
				charset: 'utf8mb4',
				timezone: 'Z',
			};
		}
	}

	async connect(): Promise<void> {
		try {
			this.db = await new DataSource(this.dataSourceOptions).initialize();
			this.logger.log('Connected to the database');
		} catch (error) {
			this.logger.error(error);
		}
	}

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
