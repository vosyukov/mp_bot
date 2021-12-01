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
  async addKey(@Ctx() ctx: TelegrafContext) {
    try {
      const { id, username, first_name, last_name, language_code } = ctx.message.from;
      await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code);

      const text = ctx.message.text;
      const apiKey = text.replace('/addkey', '').trim();
      await this.userRegistrationService.addWbApiKeyByTelegram(id, apiKey);
      await ctx.reply('Ключ добавлен');
    } catch (err) {
      console.error(err);
      await ctx.reply('Ошибка при добавлении ключа');
    }
  }

  @Command(['price'])
  async getPriceTemplate(@Ctx() ctx: TelegrafContext) {
    const { id, username, first_name, last_name, language_code } = ctx.message.from;
    await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code);

    const user = await this.userService.getUserByTgId(id);
    const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

    await ctx.telegram.sendDocument(ctx.from.id, {
      source: buffer,
      filename: 'price.xlsx',
    });
  }

  @Help()
  async help(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('...');
  }

  @On('document')
  async on(@Ctx() ctx: TelegrafContext) {
    const { id, username, first_name, last_name, language_code } = ctx.message.from;
    await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code);

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
