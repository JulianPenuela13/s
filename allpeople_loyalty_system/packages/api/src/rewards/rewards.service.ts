// packages/api/src/rewards/rewards.service.ts
// packages/api/src/rewards/rewards.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Reward, RewardType } from './reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { AuditService, Actor } from '../audit/audit.service';
import { LoyaltyStrategy } from '../loyalty-engine/loyalty-strategy.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepository: Repository<Reward>,
    @InjectRepository(LoyaltyStrategy)
    private strategyRepository: Repository<LoyaltyStrategy>,
    private auditService: AuditService,
  ) {}

  async create(createRewardDto: CreateRewardDto, actor: Actor): Promise<Reward> {
    if (!actor.empresaId) {
      throw new UnauthorizedException('El actor debe tener una empresa asociada.');
    }
    
    const reward = this.rewardsRepository.create({
      ...createRewardDto,
      empresa_id: actor.empresaId,
    });
    
    const savedReward = await this.rewardsRepository.save(reward);

    await this.auditService.logAction(actor, 'REWARD_CREATE', { rewardId: savedReward.id, rewardName: savedReward.name });

    return savedReward;
  }

  async findAll(user: Actor, context?: string): Promise<Reward[]> {
    const empresaId = user.empresaId;

    if (context === 'redemption') {
      const pointsStrategy = await this.strategyRepository.findOne({ 
        where: { key: 'points', is_active: true, empresa_id: empresaId }
      });

      if (!pointsStrategy) {
        return [];
      }

      return this.rewardsRepository.find({
        where: { type: RewardType.STANDARD, cost_in_points: MoreThan(0), is_active: true, empresa_id: empresaId },
        order: { name: 'ASC' },
      });
    }

    return this.rewardsRepository.find({ 
      where: { empresa_id: empresaId },
      order: { name: 'ASC' } 
    });
  }

  async findOne(id: string, user: Actor): Promise<Reward> {
    const reward = await this.rewardsRepository.findOne({
      where: { id: id, empresa_id: user.empresaId },
    });

    if (!reward) {
      throw new NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
    }
    return reward;
  }

  async update(id: string, updateRewardDto: UpdateRewardDto, actor: Actor): Promise<Reward> {
    const rewardToUpdate = await this.findOne(id, actor);

    if (Object.keys(updateRewardDto).length === 0) {
      return rewardToUpdate;
    }
    
    await this.rewardsRepository.update(id, updateRewardDto);

    await this.auditService.logAction(actor, 'REWARD_UPDATE', {
      rewardId: rewardToUpdate.id,
      rewardName: rewardToUpdate.name,
      changes: updateRewardDto,
    });
    
    return this.findOne(id, actor);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const rewardToRemove = await this.findOne(id, actor);

    const result = await this.rewardsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Recompensa con ID "${id}" no encontrada.`);
    }

    await this.auditService.logAction(actor, 'REWARD_DELETE', { rewardId: rewardToRemove.id, rewardName: rewardToRemove.name });
  }

  async decrementStock(id: string, empresaId: number): Promise<void> {
    await this.rewardsRepository.decrement({ id: id, empresa_id: empresaId }, 'stock', 1);
  }
}