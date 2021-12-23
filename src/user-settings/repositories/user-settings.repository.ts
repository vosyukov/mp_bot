import { EntityRepository, Repository } from 'typeorm';
import { UserSettingsEntity } from '../entities/user-settings.entity';

@EntityRepository(UserSettingsEntity)
export class UserSettingsRepository extends Repository<UserSettingsEntity> {}
