/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Update, Ctx, Start, Help, On, Hears, Command, InjectBot, Message } from 'nestjs-telegraf';
import { UserRegistrationService } from '../user/services/user-registration.service';
import { Markup, Telegraf, Context, session, Composer } from 'telegraf';
import { ProductPriceTemplateService } from '../product/services/product-price-template.service';
import { UserService } from '../user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
import { WbXlsxReportBuilder } from '../wb_stats/services/wb-xlsx-report-builder';
type TelegrafContext = any;
import * as moment from 'moment';
import { Scenes } from 'telegraf';
import { WbApiService } from '../wb-api/wb-api.service';
import { ShopServices } from '../shop/services/shop.services';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import { WbParserSalesReportService } from '../wb_stats/services/wb-parser-sales-report.service';
import { TelegramService } from './telegram.service';

const BUTTONS: Record<string, string> = {
  connectWB: '➕ Подключить WB аккаунт',
  back: '🔙 Назад',
  report: '📊 Отчеты по продажам',
  costPrice: '💸 Cебестоимость товаров',
  uploadCostPrice: 'Загрузить файл себестоимости',
  button_10: '🟢 За текущий месяц',
  button_11: '🟠 За прошедший месяц',
  button_12: '🟣 Выбрать период',
  button_13: 'Отчет по продажам (категории товаров)',
  button_14: '⚙️Настройки',
};

enum SCENES {
  CONNECT_WB = 'CONNECT_WB',
  MAIN_MENU = 'MAIN_MENU',
  REPORT = 'REPORT',
  REPORT3 = 'REPORT3',
  SET_COST_PRICE = 'SET_COST_PRICE',
  SET_COST_PRICE2 = 'SET_COST_PRICE2',
}

let uploadPrice = false;
let addApiKey = false;
let anyPeriodByProduct = false;

@Update()
export class TelegramController {
  // @ts-ignore
  private stage: Scenes.Stage;
  constructor(
    private readonly userRegistrationService: UserRegistrationService,
    private readonly productPriceTemplateService: ProductPriceTemplateService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly wbXlsxReportBuilder: WbXlsxReportBuilder,
    private readonly wbApiService: WbApiService,
    private readonly wbParserSalesReportService: WbParserSalesReportService,
    private readonly shopServices: ShopServices,
    private readonly telegramService: TelegramService,
    @InjectBot() private bot: Telegraf<TelegrafContext>,
  ) {
    // @ts-ignore
    this.stage = new Scenes.Stage<Context>([this.getMainMenuScene(), this.getReportScene()], {
      default: SCENES.MAIN_MENU,
    });
    this.bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
    this.bot.use(this.stage.middleware());

    // @ts-ignore//
    this.bot.command('start', Scenes.Stage.enter(SCENES.MAIN_MENU));
  }

  public async sleep(val = 5): Promise<void> {
    return new Promise((res) => {
      const id = setTimeout(() => {
        clearInterval(id);
        res();
      }, val * 100);
    });
  }

  public getMainMenuScene(): any {
    const stepHandler = new Composer<Scenes.WizardContext>();
    stepHandler.action('getCostPrice', async (ctx) => {
      const { id } = ctx.from;
      const user = await this.userService.findUserByTgId(id);
      const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

      await ctx.telegram.sendDocument(ctx.from.id, {
        source: buffer,
        filename: 'price.xlsx',
      });
      await ctx.answerCbQuery();
    });
    stepHandler.action('updateCostPrice', async (ctx) => {
      uploadPrice = true;
      return ctx.reply('Отправте файл с себестоимостью в ответном сообщении');
    });
    stepHandler.action('costPrice', async (ctx) => {
      return ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback('💸 ️ Текущая себестоимость', 'getCostPrice')],
          [Markup.button.callback('🔄️ Обновить себестоимость', 'updateCostPrice')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
    });
    stepHandler.action('aboutBot', async (ctx) => {
      const { id } = ctx.from;
      return ctx.editMessageText('Текст о боте...', Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'back')]));
    });
    stepHandler.action('back', async (ctx) => {
      const { id } = ctx.from;
      return ctx.editMessageText('ff', await this.buildInlineMenu(id, 'MAIN_MENU'));
    });
    stepHandler.action('addKey', async (ctx) => {
      const { id } = ctx.from;
      return ctx.editMessageText(
        'Ваш секретный ключ Wildberries\n' +
          'Просмотрите текущий или задайте новый ключ.\n' +
          '⚠️Обязательно используйте ключ (Х64) или прочитайте инструкцию⚠️',
        await this.buildInlineMenu(id, 'ADD_API_KEY'),
      );
    });

    stepHandler.action('currentMonthByProduct', async (ctx) => {
      const { id } = ctx.from;

      const document = await this.telegramService.getSaleReportByVendorCodeForCurrentMonth(id);
      // @ts-ignorereturn ctx.wizard.next();
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('previousMonthByProduct', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByVendorCodeForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('anyPeriodByProduct', async (ctx) => {
      await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      anyPeriodByProduct = true;
    });

    stepHandler.action('reportByProduct', async (ctx) => {
      const { id } = ctx.from;
      return ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriodByProduct')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
    });

    stepHandler.action('newKey', async (ctx) => {
      addApiKey = true;
      return ctx.reply('Отправте ваш ключ в ответном сообщении');
    });

    stepHandler.action('salesReport', async (ctx) => {
      return await ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback('Отчет по товарам', 'reportByProduct')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
    });

    stepHandler.on('document', async (ctx) => {
      if (uploadPrice) {
        const link = await ctx.telegram.getFileLink(ctx.update.message.document.file_id);
        console.log(link);

        const data = await this.httpService
          .get(link.href, { responseType: 'arraybuffer' })
          .pipe(map(({ data }) => data))
          .toPromise();

        const { id } = ctx.message.from;
        const user = await this.userService.findUserByTgId(id);
        await this.productPriceTemplateService.setPrice(user.id, data);
        await ctx.reply('👍');
        return ctx.wizard.next();
      }

      uploadPrice = false;
    });
    stepHandler.on('message', async (ctx) => {
      if (addApiKey) {
        // @ts-ignore
        const { text } = ctx.message;
        console.log(text);
        const isValid = await this.shopServices.isValidToken(text);

        if (isValid) {
          const { id } = ctx.message.from;
          const shop = await this.shopServices.addShop('name', text, id);
          this.wbParserSalesReportService.parseByShopId(shop.id);
          await ctx.reply('Ключ добавлен');
        } else {
          await ctx.reply(`Токен ${text} не валидный.\nВведите сгенерированый API токен`);
        }
      } else if (anyPeriodByProduct) {
        // @ts-ignore
        const [from, to] = ctx.message.text.trim().split('-');
        const { id } = ctx.message.from;

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        if (fromDate.isValid() && toDate.isValid()) {
          const document = await this.telegramService.getSaleReportByVendorCode(id, fromDate.toDate(), toDate.toDate());
          // @ts-ignore
          await ctx.telegram.sendDocument(id, document);
        } else {
          await ctx.reply('Даты указаны неверно!');
          await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
        }
      }

      addApiKey = false;
      uploadPrice = false;
      anyPeriodByProduct = false;

      return ctx.wizard.next();
    });

    stepHandler.use(async (ctx) => {
      console.log(ctx.message);
      // @ts-ignore
      const { text } = ctx.message;
      console.log(text);
      const isValid = await this.shopServices.isValidToken(text);

      if (isValid) {
        const { id } = ctx.message.from;
        const shop = await this.shopServices.addShop('name', text, id);
        this.wbParserSalesReportService.parseByShopId(shop.id);
        await ctx.reply('Ключ добавлен');
      } else {
        await ctx.reply(`Токен ${text} не валидный.\nВведите сгенерированый API токен`);
      }

      return ctx.wizard.next();
    });

    const mainMenu = new Scenes.WizardScene(
      SCENES.MAIN_MENU,
      async (ctx) => {
        if (!ctx.message?.from) {
          return ctx.scene.leave();
        }

        const { id, username, first_name, last_name, language_code } = ctx.message.from;
        await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code);

        // @ts-ignore
        const button = ctx.message.text;

        console.log(button);

        if (button === BUTTONS.connectWB) {
          return ctx.scene.enter(SCENES.CONNECT_WB);
        } else if (button === BUTTONS.report) {
          return ctx.scene.enter(SCENES.REPORT);
        } else if (button === BUTTONS.costPrice) {
          return ctx.scene.enter(SCENES.SET_COST_PRICE);
        } else if (button === BUTTONS.uploadCostPrice) {
          return ctx.scene.enter(SCENES.SET_COST_PRICE2);
        } else if (button === BUTTONS.button_13) {
          return ctx.scene.enter(SCENES.REPORT3);
        } else if (button === BUTTONS.button_14) {
          const url = await this.telegramService.createPayment(id);
          return ctx.reply('Доступ заблокирован оформите подписку на бота', Markup.inlineKeyboard([Markup.button.url('Оплатить', url)]));
        }
        await ctx.reply(
          'Мой Wildberries\n' + 'Просматривайте информацию о своем магазине и получайте отчеты.',
          await this.buildInlineMenu(id, 'MAIN_MENU'),
        );
        await ctx.wizard.next();
      },
      stepHandler,
    );

    return mainMenu;
  }

  public getReportScene(): any {
    let fromDate: Date;
    let toDate: Date;
    const stepHandler = new Composer<Scenes.WizardContext>();
    stepHandler.action('currentMonth', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByVendorCodeForCurrentMonth(id);
      // @ts-ignorereturn ctx.wizard.next();
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });
    stepHandler.action('previousMonth', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByVendorCodeForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });
    stepHandler.action('anyPeriod', async (ctx) => {
      console.log(ctx.message);
      await ctx.reply('d');
      await ctx.answerCbQuery();
      return;
    });
    stepHandler.action('reportByVendorCode', async (ctx) => {
      await ctx.editMessageText(
        '<b>Отчет по продажам (артикулgы)</b>\nТут вы можете...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonth')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonth')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriod')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
      await ctx.answerCbQuery();
    });
    stepHandler.action('reportByProduct', async (ctx) => {
      await ctx.editMessageText(
        '<b>Отчет по продажам (артиrrкулы)</b>\nТут вы можете...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonth')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonth')],
          // [Markup.button.text('previousMonth', false)],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriod')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
    });
    stepHandler.action('back', async (ctx) => {
      await ctx.editMessageText(
        '<b>Отчет по продажам</b>\nТут вы можете...',
        Markup.inlineKeyboard([
          [Markup.button.callback('Отчет по артикулам', 'reportByVendorCode')],
          [Markup.button.callback('Отчет по товарам', 'reportByProduct')],
        ]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.use(async (ctx) => {
      // @ts-ignore
      const [from, to] = ctx.message.text.trim().split('-');
      const { id } = ctx.message.from;

      const fromDate = moment(from, 'DD.MM.YYYY');
      const toDate = moment(to, 'DD.MM.YYYY');

      if (fromDate.isValid() && toDate.isValid()) {
        const document = await this.telegramService.getSaleReportByVendorCode(id, fromDate.toDate(), toDate.toDate());
        // @ts-ignore
        await ctx.telegram.sendDocument(id, document);
      } else {
        await ctx.reply('Даты указаны неверно!');
        await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      }
    });

    const scene = new Scenes.WizardScene(
      SCENES.REPORT,
      async (ctx) => {
        await ctx.reply(
          'Укажите тип отчета\n' + 'Текст с описанием типов отчетов',
          Markup.inlineKeyboard([
            [Markup.button.callback('🔸 Отчет по артикулам', 'reportByVendorCode')],
            [Markup.button.callback('📦 Отчет по товарам', 'reportByProduct')],
          ]),
        );

        return ctx.wizard.next();
      },

      stepHandler,
    );

    return scene;
  }

  public async buildInlineMenu(userTgId: number, menuId: string): Promise<Markup.Markup<InlineKeyboardMarkup>> {
    const user = await this.userService.findUserByTgId(userTgId);
    if (menuId === 'MAIN_MENU') {
      const menu = [];
      const shop = await this.shopServices.findShopByUserID(user.id);

      if (!shop) {
        menu.push([Markup.button.callback('🔑 Подключить АПИ ключ', 'addKey')]);
      } else {
        menu.push([Markup.button.callback('🔸 Отчет по продажам', 'salesReport')]);
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', 'costPrice')]);
      }
      if (user.subscriptionExpirationDate < moment().toDate()) {
        menu.push([Markup.button.callback('💳 Продлить подписку', 'ghj')]);
      }

      menu.push([Markup.button.callback('❔ О сервисе', 'aboutBot')]);

      return Markup.inlineKeyboard(menu);
    }

    if (menuId === 'ADD_API_KEY') {
      const menu = [];

      menu.push([Markup.button.callback('➕ Добавить ключ', 'newKey'), Markup.button.callback('❔ Инструкция', 'newKeyInstruction')]);

      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return Markup.inlineKeyboard(menu);
    }

    throw new Error(`Invalid menu ID: ${menuId}`);
  }
}
