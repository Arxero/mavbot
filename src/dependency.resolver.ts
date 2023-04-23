export class DependencyResolver {
	private instances: Map<DependencyType, any>;

	constructor() {
		this.instances = new Map();
	}

	register(key: DependencyType, instance: any): void {
		this.instances.set(key, instance);
	}

	resolve<T>(key: DependencyType): T {
		const instance = this.instances.get(key);

		if (!instance) {
			throw new Error(`Could not resolve dependency ${key}`);
		}

		return instance;
	}
}

export enum DependencyType {
	Config = 'Config',
	ImgDownloader = 'ImgDownloader',
	Logger = 'Logger',
	PlayersCheck = 'PlayersCheck'
}
