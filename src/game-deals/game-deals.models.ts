export interface RedditResponse {
	data: {
		children: [
			{
				data: {
					id: string;
					thumbnail: string;
					url: string;
					title: string;
					subreddit: string;
					created: number;
					preview?: {
						images: [
							{
								source: {
									url: string;
								};
							},
						];
					};
				};
			},
		];
	};
}

export enum VendorType {
	Steam = 'steam',
	EpicGames = 'epicgames',
}

export interface ProcessedGameDeal {
	id: string;
	title: string;
	url: string;
	type: VendorType;
	thumbnail?: string;
	subreddit: string;
}

export interface RedditToken {
	access_token: string;
	expires_in: number;
	issued_at: number;
}
