export declare enum WhatsappProvider {
    TWILIO = "twilio",
    WPPCONNECT = "wppconnect",
    NONE = "none"
}
export declare class Empresa {
    id: number;
    nombre_empresa: string;
    plan_suscripcion: string;
    estado_suscripcion: string;
    whatsapp_provider: WhatsappProvider;
    wpp_session_name: string | null;
    twilio_phone_number: string | null;
    fecha_creacion: Date;
}
