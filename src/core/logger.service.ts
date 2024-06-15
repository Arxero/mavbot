import { ConsoleLogger, Injectable } from '@nestjs/common';
import fs, { WriteStream } from 'fs';
import { isEmpty } from 'lodash';
import moment, { Moment } from 'moment';
import path from 'path';
import { ensureDirectory } from './core.utils';

enum LogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	DEBUG = 'debug',
}

@Injectable()
export class LoggerService extends ConsoleLogger {
	private logStream: WriteStream;
	private logDirectory = 'logs';
	private lastLogDate: Moment;

	private get logFilePath(): string {
		return path.resolve(__dirname, '..', '..', this.logDirectory, this.getFileName());
	}

	log(message: string, level: LogLevel = LogLevel.INFO, metadata: any = {}): void {
		ensureDirectory(this.logDirectory, '..', '..');
		this.ensureStream();
		const logLine = this.formatLogLine(message, level, metadata);
		this.logStream.write(logLine);

		if (level === LogLevel.ERROR) {
			super.error(message);
		} else {
			super.log(message);
		}
	}

	error(message: string, metadata: any = {}): void {
		this.log(message, LogLevel.ERROR, metadata);
	}

	private formatLogLine(message: string, level: LogLevel, metadata: any): string {
		const timestamp = moment().format('DD/MM/YYYY - HH:mm:ss');
		const metadataInfo = metadata && !isEmpty(metadata) ? ` - ${JSON.stringify(metadata)}` : '';

		return `[${level.toUpperCase()}] - ${timestamp} - ${message}${metadataInfo}\n`;
	}

	private getFileName(): string {
		return `${moment().format('DD-MMM-YYYY')}.log`;
	}

	private ensureStream(): void {
		const currentDate = moment().startOf('day');

		if (!this.logStream || (this.lastLogDate && !this.lastLogDate.isSame(currentDate, 'day'))) {
			if (this.logStream) {
				this.logStream.end();
			}

			this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
			this.lastLogDate = currentDate;
		}
	}
}
