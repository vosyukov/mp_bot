import {Module} from "@nestjs/common";
import {UserRegistrationService} from "./services/user-registration.service";
import {UserRepository} from "./repositories/user.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserFetcherService} from "./services/user-fetcher.service";


@Module({
    imports: [TypeOrmModule.forFeature([UserRepository])],
    providers: [UserRegistrationService, UserFetcherService],
    exports: [UserRegistrationService, UserFetcherService]
})
export class UserModule {}