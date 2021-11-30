import { Update, Ctx, Start, Help, On, Hears, Command, InjectBot } from 'nestjs-telegraf';
import { UserRegistrationService } from '../user/services/user-registration.service';
import { Telegraf } from 'telegraf';
import { ProductPriceTemplateService } from '../product/services/product-price-template.service';
import { UserService } from '../user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
type TelegrafContext = any;

@Update()
export class TelegramController {
  constructor(
    private readonly userRegistrationService: UserRegistrationService,
    private readonly productPriceTemplateService: ProductPriceTemplateService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    const { id, username, first_name, last_name, language_code } = ctx.message.from;
    await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code);
    await ctx.reply(`Hy ${first_name}`);
  }

  @Command(['addkey'])
  async hears2(@Ctx() ctx: TelegrafContext) {
    const { id } = ctx.message.from;
    const text = ctx.message.text;
    const apiKey = text.replace('/addkey', '').trim();

    try {
      await this.userRegistrationService.addWbApiKeyByTelegram(id, apiKey);
      await ctx.reply('Ключ добавлен');
    } catch (err) {
      console.error(err);
      await ctx.reply(err.message);
    }
  }

  @Command(['price'])
  async getPriceTemplate(@Ctx() ctx: TelegrafContext) {
    const { id } = ctx.message.from;

    const user = await this.userService.getUserByTgId(id);
    const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

    await ctx.telegram.sendDocument(ctx.from.id, {
      source: buffer,
      filename: 'price.xlsx',
    });
  }

  @Help()
  async help(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Send me a sticker');
  }

  @On('document')
  async on(@Ctx() ctx: TelegrafContext) {
    console.log(ctx.update.message.document);
    const link = await ctx.telegram.getFileLink(ctx.update.message.document.file_id);

    const data = await this.httpService
      .get(link.href, { responseType: 'arraybuffer' })
      .pipe(map(({ data }) => data))
      .toPromise();

    await this.productPriceTemplateService.setPrice(data);
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Hey there');
  }
}
