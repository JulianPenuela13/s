import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    runExpirationCheck(): Promise<{
        message: string;
    }>;
}
