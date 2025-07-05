"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRewardDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_reward_dto_1 = require("./create-reward.dto");
class UpdateRewardDto extends (0, mapped_types_1.PartialType)(create_reward_dto_1.CreateRewardDto) {
}
exports.UpdateRewardDto = UpdateRewardDto;
//# sourceMappingURL=update-reward.dto.js.map