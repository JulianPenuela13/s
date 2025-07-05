import { Empresa } from '../empresas/empresa.entity';
export declare enum RuleType {
    PURCHASE_AMOUNT = "purchase_amount",
    CLIENT_TAG = "client_tag"
}
export declare enum ActionType {
    GRANT_POINTS = "grant_points",
    UNLOCK_REWARD = "unlock_reward"
}
export declare class Rule {
    id: string;
    name: string;
    type: RuleType;
    threshold: number;
    required_tag: string;
    action_type: ActionType;
    action_value: string;
    is_active: boolean;
    empresa_id: number;
    empresa: Empresa;
    created_at: Date;
}
