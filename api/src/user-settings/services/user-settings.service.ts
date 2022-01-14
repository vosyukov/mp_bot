import { Injectable } from '@nestjs/common';
import { UserSettingsRepository } from '../repositories/user-settings.repository';

@Injectable()
export class UserSettingsService {
  constructor(private readonly userSettingsRepository: UserSettingsRepository) {}

  public async updateTaxPercent(userId: string, value: number): Promise<void> {
    await this.userSettingsRepository.save({ userId: userId, taxPercent: value });
  }

  public async getTaxPercent(userId: string): Promise<number> {
    const result = await this.userSettingsRepository.findOne({ userId });
    return result?.taxPercent || 6;
  }

  public async updateNewOrdersNotification(userId: string, value: boolean): Promise<void> {
    await this.userSettingsRepository.save({ userId: userId, isEnabledNewOrderNotification: value });
  }

  public async isEnabledNewOrdersNotification(userId: string): Promise<boolean> {
    const result = await this.userSettingsRepository.findOne({ userId });
    return result.isEnabledNewOrderNotification;
  }
}
