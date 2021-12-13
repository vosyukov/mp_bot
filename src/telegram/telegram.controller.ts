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
import { TARIFF_PLANS } from '../payment/payment.service';

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
let anyPeriodByVendorCode = false;

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
    this.stage = new Scenes.Stage<Context>([this.getMainMenuScene()], {
      default: SCENES.MAIN_MENU,
    });
    this.bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
    this.bot.use(this.stage.middleware());

    // @ts-ignore//
    this.bot.command('start', Scenes.Stage.enter(SCENES.MAIN_MENU));
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
      await ctx.reply('Скачайте и заполните себестоимость по своим товарам');
      await ctx.answerCbQuery();
    });

    stepHandler.action('updateCostPrice', async (ctx) => {
      uploadPrice = true;
      return ctx.reply('Отправьте файл с себестоимостью в ответном сообщении');
    });

    stepHandler.action('pay1', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, TARIFF_PLANS.TARRIFF_1);
      return ctx.editMessageText(
        '1',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
    });

    stepHandler.action('pay2', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, TARIFF_PLANS.TARRIFF_2);
      return ctx.editMessageText(
        '2',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
    });

    stepHandler.action('pay3', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, TARIFF_PLANS.TARRIFF_3);
      return ctx.editMessageText(
        '3',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
    });

    stepHandler.action('costPrice', async (ctx) => {
      return ctx.editMessageText(
        'Чтобы корректно рассчитать отчет, от Вас требуется один раз подгрузить данные по себестоимости отдельных артикулов. Для этого нажмите кнопку “Текущая себестоимость” я выгружу документ со всеми Вашими артикулами, остается только его заполнить и загрузить обратно, для загрузки нажмите “Загрузить/обновить себестоимость” и следуйте инструкции.\n',
        Markup.inlineKeyboard([
          [Markup.button.callback('💸 ️Текущая себестоимость', 'getCostPrice')],
          [Markup.button.callback('🔄️ Загрузить/обновить себестоимость', 'updateCostPrice')],
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
      const { text, menu } = await this.buildInlineMenu(id, 'MAIN_MENU');
      return ctx.editMessageText(text, menu);
    });

    stepHandler.action('addKey', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, 'ADD_API_KEY');
      return ctx.editMessageText(text, menu);
    });

    stepHandler.action('currentMonthByVendorCode', async (ctx) => {
      const { id } = ctx.from;

      const document = await this.telegramService.getSaleReportByVendorCodeForCurrentMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('previousMonthByVendorCode', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByVendorCodeForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('anyPeriodByVendorCode', async (ctx) => {
      await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      anyPeriodByVendorCode = true;
    });

    stepHandler.action('reportByVendorCode', async (ctx) => {
      const { id } = ctx.from;
      return ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonthByVendorCode')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonthByVendorCode')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriodByVendorCode')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
    });

    stepHandler.action('newKey', async (ctx) => {
      addApiKey = true;
      await ctx.reply('Отправте ваш ключ в ответном сообщении');
      await ctx.answerCbQuery();
    });

    stepHandler.action('dev', async (ctx) => {
      addApiKey = true;
      await ctx.reply('в разработке...');
      await ctx.answerCbQuery();
    });

    stepHandler.action('subscribeSettings', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, 'SUBSCRIBE_SETTINGS');
      return ctx.editMessageText(text, menu);
    });

    stepHandler.action('salesReport', async (ctx) => {
      return await ctx.editMessageText(
        'Вам доступны четыре вида финансовых отчетов. \n' +
          '1.Отчет с цифрами по каждому артикулу из категорий Ваших товаров. \n' +
          '2.Отчет сжатый до категории товаров. Вы видите какая категория сколько зарабатывает. \n' +
          '3.Отчет сжатый до общей информации по всем категориям. Вы увидите общее количество заказов, возвратов и их суммы. Мы посчитаем общую возвращенную себестоимость за весь реализованный товар, сумму которую необходимо оставить на налоги и Вашу чистую прибыль.\n' +
          '4.Отчет по отдельному артикулу. Если для Вас важно посмотреть как продается ваш товар. \n',
        Markup.inlineKeyboard([
          [Markup.button.callback('Отчет по категориям товаров', 'dev')],
          [Markup.button.callback('Отчет по артикулам', 'reportByVendorCode')],
          [Markup.button.callback('Отчет по конкретному артикулу', 'dev')],
          [Markup.button.callback('Сводный отчет', 'dev')],
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
        await ctx.reply('Файл успешно загружен. Можем начинать.');
        return ctx.wizard.next();
      }

      addApiKey = false;
      uploadPrice = false;
      anyPeriodByVendorCode = false;
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
      } else if (anyPeriodByVendorCode) {
        // @ts-ignore
        const [from, to] = ctx.message.text.trim().split('-');
        const { id } = ctx.message.from;

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        if (fromDate.isValid() && toDate.isValid()) {
          const document = await this.telegramService.getSaleReportByVendorCode(id, fromDate.toDate(), toDate.toDate());
          // @ts-ignore
          await ctx.telegram.sendDocument(id, document);
          return ctx.wizard.next();
        } else {
          await ctx.reply('Даты указаны неверно!');
          await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
          return ctx.wizard.next();
        }
      }

      addApiKey = false;
      uploadPrice = false;
      anyPeriodByVendorCode = false;

      return ctx.scene.enter(SCENES.MAIN_MENU);
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

        if (button === '🟣 Мой Wildberries') {
          const { text, menu } = await this.buildInlineMenu(id, 'MAIN_MENU');
          await ctx.reply(text, menu);
          return ctx.wizard.next();
        } else if (button === 'API Ключ') {
          const { text, menu } = await this.buildInlineMenu(id, 'ADD_API_KEY');
          await ctx.reply(text, menu);
          return ctx.wizard.next();
        } else if (button === '⚙ Настройки') {
          const { text, menu } = await this.buildInlineMenu(id, 'SETTINGS');
          await ctx.reply(text, menu);
          return ctx.wizard.next();
        }
        await ctx.reply(
          'Привет. Я умный бот расчета финансовых отчетов для лучшего понимания Вашего бизнеса и всех процессов.\n' +
            'Рассчитаю какая себестоимость вернулась за период, какую сумму нужно оставить на оплату налогов (согласно вашей системы налогообложения) и сколько составила чистая прибыль.\n' +
            'Вот так легко, за секунды. \n' +
            'Больше не надо тратить время для погружения в огромные отчеты и детализацию. Не переживай, вся информация строго конфиденциальна. \n',
          Markup.keyboard([
            ['🟣 Мой Wildberries'], // Row1 with 2 buttons
            ['⚙ Настройки'], // Row2 with 2 buttons
          ]).resize(),
        );

        // await ctx.wizard.next();
      },
      stepHandler,
    );

    return mainMenu;
  }

  public async buildInlineMenu(userTgId: number, menuId: string): Promise<{ text: string; menu: Markup.Markup<InlineKeyboardMarkup> }> {
    const user = await this.userService.findUserByTgId(userTgId);
    if (menuId === 'MAIN_MENU') {
      const menu = [];
      const shop = await this.shopServices.findShopByUserID(user.id);

      if (!shop) {
        menu.push([Markup.button.callback('🔑 Подключить АПИ ключ', 'newKey')]);
      } else {
        menu.push([Markup.button.callback('🔸 Отчет по продажам', 'salesReport')]);
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', 'costPrice')]);
      }
      if (user.subscriptionExpirationDate < moment().toDate()) {
        menu.push([Markup.button.callback('💳 Продлить подписку', 'ghj')]);
      }

      menu.push([Markup.button.callback('❔ О сервисе', 'aboutBot')]);

      return {
        text: 'Просматривайте информацию о своем магазине и получайте отчеты.',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === 'ADD_API_KEY') {
      const menu = [];

      const shop = await this.shopServices.findShopByUserID(user.id);

      menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return {
        text: `Ваш текущий API ключ ${shop?.token}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === 'SETTINGS') {
      const shop = await this.shopServices.findShopByUserID(user.id);

      const menu = [];

      if (shop) {
        menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      }

      menu.push([Markup.button.callback('💳 Продлить подписку', 'subscribeSettings')]);

      const countDays = moment(user.subscriptionExpirationDate).diff(moment(), 'days');
      return {
        text: `Ваша подписка истекает через ${countDays} дня(ей)\nВаш API ключ ${shop.token}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === 'SUBSCRIBE_SETTINGS') {
      const menu = [];

      menu.push([Markup.button.callback(`Продлить на 1 месяц за ${TARIFF_PLANS.TARRIFF_1} рублей`, 'pay1')]);
      menu.push([Markup.button.callback(`Продлить на 2 месяц за ${TARIFF_PLANS.TARRIFF_2} рублей`, 'pay2')]);
      menu.push([Markup.button.callback(`Продлить на 3 месяц за ${TARIFF_PLANS.TARRIFF_3} рублей`, 'pay3')]);
      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return {
        text: `Текст...`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    throw new Error(`Invalid menu ID: ${menuId}`);
  }
}
