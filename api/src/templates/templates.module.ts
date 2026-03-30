import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { Template } from './template.entity';
import { TemplatesGetAllService } from './services/templates-get-all.service';
import { TemplatesGetOneService } from './services/templates-get-one.service';
import { TemplatesCreateService } from './services/templates-create.service';
import { TemplatesUpdateService } from './services/templates-update.service';
import { TemplatesDeleteService } from './services/templates-delete.service';
import { TemplatesSetDefaultService } from './services/templates-set-default.service';

@Module({
    imports: [TypeOrmModule.forFeature([Template])],
    controllers: [TemplatesController],
    providers: [
        TemplatesGetAllService,
        TemplatesGetOneService,
        TemplatesCreateService,
        TemplatesUpdateService,
        TemplatesDeleteService,
        TemplatesSetDefaultService,
    ],
    exports: [
        TemplatesGetAllService,
        TemplatesGetOneService,
    ],
})
export class TemplatesModule { }
