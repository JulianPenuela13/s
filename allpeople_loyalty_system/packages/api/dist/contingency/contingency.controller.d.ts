import { ContingencyService } from './contingency.service';
export declare class ContingencyController {
    private readonly contingencyService;
    constructor(contingencyService: ContingencyService);
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        processed: number;
        failed: number;
        errors: string[];
    }>;
}
