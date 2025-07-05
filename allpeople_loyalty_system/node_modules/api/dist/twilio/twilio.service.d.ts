export declare class TwilioService {
    private readonly logger;
    private client;
    constructor();
    sendWhatsappMessage(to: string, body: string): Promise<void>;
}
