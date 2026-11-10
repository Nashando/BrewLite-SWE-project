import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminController } from './admin.controller';
import { AdminReportsService } from './admin-reports.service';

@Module({ controllers: [AdminController], providers: [AdminCatalogService, AdminReportsService, RolesGuard] })
export class AdminModule {}
