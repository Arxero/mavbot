import { BeforeInsert, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ProcessedGameDeal, VendorType } from './models';

@Entity({ name: 'game_deals' })
export class GameDealEntity {
	constructor(data: ProcessedGameDeal) {
		if (data) {
			this.title = data.title;
			this.url = data.url;
			this.type = data.type;
			this.thumbnail = data.thumbnail;
			this.subreddit = data.subreddit;
			this.redditId = data.id;
		}
	}

	@PrimaryGeneratedColumn('increment', { type: 'int' })
	id: number;

	@CreateDateColumn({ type: 'datetime' })
	createdAt: Date;

	@Column({ charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
	title: string;

	@Column({ type: 'varchar' })
	url: string;

	@Column({ type: 'enum', enum: VendorType })
	type: VendorType;

	@Column({ type: 'varchar', nullable: true })
	thumbnail?: string;

	@Column({ type: 'varchar' })
	subreddit: string;

	@Index({ unique: true })
	@Column({ type: 'varchar' })
	redditId: string;

	@BeforeInsert()
	setCreatedAt(): void {
		this.createdAt = new Date(Date.now());
	}
}
