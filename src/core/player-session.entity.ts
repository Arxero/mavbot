import moment from 'moment';
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerSession, SortDirection, TopPlayersPeriod } from './models';

@Entity({ name: 'player_sessions' })
export class PlayerSessionEntity {
	constructor(data: PlayerSession) {
		if (data) {
			this.name = data.name;
			this.score = data.score!;
			this.timePlayed = data.timePlayed!;
			this.joined = data.joined;
			this.left = data.left!;
		}
	}

	@PrimaryGeneratedColumn('increment', { type: 'int' })
	id: number;

	@CreateDateColumn({ type: 'datetime' })
	createdAt: Date;

	@Column({ charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
	name: string;

	@Column()
	score: number;

	@Column()
	timePlayed: number;

	@Column({ type: 'datetime' })
	joined: Date;

	@Column({ type: 'datetime' })
	left: Date;

	@BeforeInsert()
	setCreatedAt(): void {
		this.createdAt = new Date(Date.now());
	}
}

export class PlayerSessionParams {
	take = 10;
	sortDirection = SortDirection.DESC;
    scoreThreshold: number;
    startDate: Date;
    endDate: Date;

    private set setDate(value: TopPlayersPeriod) {
        let current = moment();

        if (value === TopPlayersPeriod.Today || value === TopPlayersPeriod.Yesterday) {
            if (value === TopPlayersPeriod.Yesterday) {
                current = moment().subtract(1, 'day');
            }

            this.startDate = moment(current).startOf('day').toDate();
            this.endDate = moment(current).endOf('day').toDate();
        } else if (value === TopPlayersPeriod.ThisWeek) {
            this.startDate = moment(current).startOf('isoWeek').toDate();
            this.endDate = moment(current).endOf('isoWeek').toDate();
        } else if (value === TopPlayersPeriod.ThisMonth) {
            this.startDate = moment(current).startOf('month').toDate();
            this.endDate = moment(current).endOf('month').toDate();
        }
    }

    constructor(data: { scoreThreshold: number, time: TopPlayersPeriod }) {
        this.scoreThreshold = data.scoreThreshold;
        this.setDate = data.time;
    }
}
