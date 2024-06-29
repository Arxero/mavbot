import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoggerService } from '@mavbot/core';
import { GameDealEntity } from './game-deal.entity';
import { ProcessedGameDeal } from './game-deals.models';

@Injectable()
export class GameDealsDbService {
	constructor(
		private logger: LoggerService,
		@InjectRepository(GameDealEntity) private gameDealsRepo: Repository<GameDealEntity>,
	) {}

	async saveGameDeals(newDeals: ProcessedGameDeal[]): Promise<GameDealEntity[]> {
		try {
			const unsavedDeals = (await this.getUnsaved(newDeals)).map(x => new GameDealEntity(x));
			if (!unsavedDeals.length) {
				return [];
			}

			const savedDeals = await this.gameDealsRepo.save(unsavedDeals);
			this.logger.log(`Saving Deals: ${newDeals.map(ps => ps.title).join(', ')} to the database.`);

			return savedDeals;
		} catch ({ sqlMessage }) {
			this.logger.error(`[${GameDealEntity.name}] Saving deals failed with error: ${sqlMessage}`);
			throw new Error(sqlMessage);
		}
	}

	async getUnsaved(deals: ProcessedGameDeal[]): Promise<ProcessedGameDeal[]> {
		if (!deals.length) {
			return [];
		}

		try {
			const existingDeals = await this.gameDealsRepo.find({
				where: {
					redditId: In(deals.map(x => x.id)),
				},
			});

			return deals.filter(d => !existingDeals.some(e => e.redditId === d.id));
		} catch ({ sqlMessage }) {
			this.logger.error(`[${GameDealEntity.name}] Getting unsaved deals failed with error: ${sqlMessage}`);
			throw new Error(sqlMessage);
		}
	}
}
