import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(): Promise<any>;
    getDynamicTables(): Promise<{
        title: string;
        data: any[];
    }[]>;
}
