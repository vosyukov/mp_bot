import {
    Update,
    Ctx,
    Start,
    Help,
    On,
    Hears,
    Command, InjectBot
} from 'nestjs-telegraf';
import {UserRegistrationService} from "../user/services/user-registration.service";
import { Telegraf } from 'telegraf';
type TelegrafContext = any

@Update()
export class TelegramController {
    constructor(private readonly userRegistrationService: UserRegistrationService, @InjectBot() private bot: Telegraf) {
    }
    @Start()
    async start(@Ctx() ctx: TelegrafContext) {
        const  {id, username, first_name, last_name, language_code} = ctx.message.from
        await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code)
        await ctx.reply(`Hy ${first_name}`);
    }

    @Command(['addkey'])
    async hears2(@Ctx() ctx: TelegrafContext) {

        const  {id} = ctx.message.from
        const  text = ctx.message.text
        const apiKey = text.replace('/addkey', '').trim()
        await ctx.reply('Hey there');

        await this.userRegistrationService.addWbApiKeyByTelegram(id,apiKey)
        await ctx.reply('Ключ добавлен');
    }

    @Help()
    async help(@Ctx() ctx: TelegrafContext) {
        await ctx.reply('Send me a sticker');
    }

    @On('document')
    async on(@Ctx() ctx: TelegrafContext) {
        console.log(ctx.update.message.document)
        console.log(await this.bot.telegram.getFileLink(ctx.update.message.document.file_id))
        await ctx.reply('👍');
    }

    @Hears('hi')
    async hears(@Ctx() ctx: TelegrafContext) {
        await ctx.reply('Hey there');
    }
}