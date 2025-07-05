import { ContingencyService } from './contingency.service';
export declare class ContingencyController {
    private readonly contingencyService;
    constructor(contingencyService: ContingencyService);
    uploadContingencyFile(file: Express.Multer.File, req: any): Promise<{
        message: string;
    }>;
}
