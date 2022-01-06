import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../user/services/user.service';
import { UserRegistrationService } from './services/user-registration.service';
import { UserEntity } from './entities/user.entity';

@Controller()
export class TgUserController {
  constructor(private readonly userService: UserService, private readonly userRegistrationService: UserRegistrationService) {}

  @MessagePattern('registration')
  public async registration(
    @Payload()
    data: {
      userTgId: number;
      username: string;
      firstName: string;
      lastName: string;
      languageCode: string;
      refId: number;
    },
  ): Promise<void> {
    const { userTgId, username, firstName, lastName, languageCode, refId } = data;

    await this.userRegistrationService.registrationByTelegram(userTgId, username, firstName, lastName, languageCode, refId);
  }

  @MessagePattern('findUserByTgId')
  public async findUserByTgId(
    @Payload()
    data: {
      userTgId: number;
    },
  ): Promise<UserEntity> {
    const { userTgId } = data;

    return await this.userService.findUserByTgId(userTgId);
  }

  @MessagePattern('getAllUsers')
  public async getAllUsers(): Promise<UserEntity[]> {
    return await this.userService.getAllUsers();
  }

  @MessagePattern('findAdminUserByTgId')
  public async findAdminUserByTgId(
    @Payload()
    data: {
      userTgId: number;
    },
  ): Promise<UserEntity | null> {
    const { userTgId } = data;
    const user = await this.userService.findUserByTgId(userTgId);
    return user.isAdmin ? user : null;
  }
}
