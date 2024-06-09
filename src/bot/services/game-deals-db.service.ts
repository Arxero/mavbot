import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logger.service';
import { GameDealEntity } from '../game-deal.entity';
import { Repository } from 'typeorm';
import { ProcessedGameDeal } from '../models';

@Injectable()
export class GameDealsDbService {
	constructor(
		private logger: LoggerService,
		@InjectRepository(GameDealEntity) private gameDealsRepo: Repository<GameDealEntity>,
	) {}

	async saveGameDeals(model: ProcessedGameDeal[]): Promise<GameDealEntity[]> {
		try {
			const data = model.map(x => new GameDealEntity(x));
			const savedDeals = await this.gameDealsRepo.save(data);
			this.logger.log(`Saving Deals: ${model.map(ps => ps.title).join(', ')} to the database.`);

			return savedDeals;
		} catch ({ sqlMessage }) {
			if ((sqlMessage as string).includes('Duplicate entry')) {
				return [];
			}

			this.logger.error(`Saving ${GameDealEntity.name} failed with error: ${sqlMessage}`);
			throw new Error(sqlMessage);
		}
	}
}
