import { Module } from '@nestjs/common';
import { ImgDownloaderService } from './img-downloader.service';
import { AcfunCommandService } from './acfun-command.service';
import { CoreModule } from '@mavbot/core';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [CoreModule, HttpModule],
	providers: [ImgDownloaderService, AcfunCommandService],
	exports: [AcfunCommandService],
})
export class AcfunModule {}
