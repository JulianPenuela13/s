import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(req: any): Promise<any>;
    getDynamicTables(req: any): Promise<{
        title: string;
        data: any[];
    }[]>;
}
