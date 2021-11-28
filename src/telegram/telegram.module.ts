import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {TelegramController} from "./telegram.controller";
import {UserModule} from "../user/user.module";

@Module({
    imports: [
        TelegrafModule.forRoot({
            token: '498961176:AAFiAjvnv1ulRSnH3zb-mnyLqADuKQ17uAo',
        }), UserModule
    ],
    providers: [
        TelegramController
    ]
})
export class TelegramModule {}
