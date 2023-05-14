import fs, { WriteStream } from 'fs';
import { Injectable } from 'injection-js';
import { isEmpty } from 'lodash';
import moment from 'moment';
import path from 'path';
import { FileHelper } from './utils';

enum LogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	DEBUG = 'debug',
}

@Injectable()
export class LoggerService extends FileHelper {
	private logStream: WriteStream;
	private logDirectory = 'logs';
	private logFilePath = path.resolve(__dirname, '..', '..' ,this.logDirectory, this.getFileName());
	private lastLogDate: Date;

	constructor() {
        super();
        this.ensureDirectory(this.logDirectory, '..', '..');
	}

	log(message: string, level: LogLevel = LogLevel.INFO, metadata: any = {}): void {
		this.ensureStream();
		const logLine = this.formatLogLine(message, level, metadata);
		this.logStream.write(logLine);

        if (level === LogLevel.ERROR) {
            console.error(message);
        } else {
            console.log(message);
        }

		this.lastLogDate = moment().toDate();
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
		if (!this.logStream || this.lastLogDate && this.lastLogDate.getDay() !== moment().day()) {
			this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
		}
	}
}
