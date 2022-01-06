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
}
