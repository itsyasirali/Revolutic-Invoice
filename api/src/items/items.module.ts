import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsCreateService } from './services/items-create.service';
import { ItemsUpdateService } from './services/items-update.service';
import { ItemsGetAllService } from './services/items-get-all.service';
import { ItemsDeleteService } from './services/items-delete.service';
import { ItemsBatchUpdateService } from './services/items-batch-update.service';
import { ItemsBatchDeleteService } from './services/items-batch-delete.service';

@Module({
    imports: [TypeOrmModule.forFeature([Item])],
    controllers: [ItemsController],
    providers: [
        ItemsCreateService,
        ItemsUpdateService,
        ItemsGetAllService,
        ItemsDeleteService,
        ItemsBatchUpdateService,
        ItemsBatchDeleteService,
    ],
    exports: [ItemsGetAllService], // Export if needed by other modules
})
export class ItemsModule { }
