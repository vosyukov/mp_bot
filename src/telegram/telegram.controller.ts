/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Update, InjectBot } from 'nestjs-telegraf';
import { UserRegistrationService } from '../user/services/user-registration.service';
import { Markup, Telegraf, Composer } from 'telegraf';
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
import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import { WbParserSalesReportService } from '../wb_stats/services/wb-parser-sales-report.service';
import { TelegramService } from './telegram.service';
import { PLANS } from '../payment/payment.service';
const RedisSession = require('telegraf-session-redis');

enum MENU {
  COST_PRICE,
  SUBSCRIBE_SETTINGS,
  SETTINGS,
  ADD_API_KEY,
  MAIN_MENU,
}

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
  MAIN_MENU = 'MAIN_MENU',
}

let uploadPrice = false;
let addApiKey = false;
let anyPeriodByVendorCode = false;
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
    const store: any = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    };

    if (process.env.REDIS_PASSWORD) {
      store.password = process.env.REDIS_PASSWORD;
    }
    const session = new RedisSession({ store });

    this.stage = new Scenes.Stage([this.getMainMenuScene()], {
      default: SCENES.MAIN_MENU,
    });

    this.bot.use(session); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
    this.bot.use(this.stage.middleware());
  }

  public getMainMenuScene(): any {
    const stepHandler = new Composer<Scenes.WizardContext>();

    stepHandler.action('getCostPrice', async (ctx) => {
      const { id } = ctx.from;
      const user = await this.userService.findUserByTgId(id);
      const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

      await ctx.telegram.sendDocument(
        ctx.from.id,
        {
          source: buffer,
          filename: 'price.xlsx',
        },
        {
          caption: 'Скачайте и заполните себестоимость по своим товарам',
        },
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('updateCostPrice', async (ctx) => {
      uploadPrice = true;
      await ctx.reply('Отправьте файл с себестоимостью в ответном сообщении');
      await ctx.answerCbQuery();
    });

    stepHandler.action('pay1', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, 'PLAN_1');
      await ctx.editMessageText(
        '\n' +
          'Вы выбрали подписку на 1 месяц за 490 руб. Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('pay2', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, 'PLAN_2');
      await ctx.editMessageText(
        'Вы выбрали подписку на 2 месяца за 800 руб. (Ваша выгода составит 180 руб.) Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('pay3', async (ctx) => {
      const { id } = ctx.from;
      const url = await this.telegramService.createPayment(id, 'PLAN_3');
      await ctx.editMessageText(
        'Вы выбрали подписку на 3 месяца за 1200 руб. (Ваша выгода составит 270 руб.) Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
        Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('costPrice', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.COST_PRICE);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('aboutBot', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText('Текст о боте...', Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'mainMenu')]));
      await ctx.answerCbQuery();
    });

    stepHandler.action('bonus', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText(
        `Приглашайте друзей в сервис по вашей реферальной ссылке и вы получите 5 дней пользования сервисом при каждой оплате приглашенного пользователя https://t.me/wb_sales_pro_bot?start=${id}`,
        Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'settings')]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('back', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('addKey', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.ADD_API_KEY);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('currentMonthByProduct', async (ctx) => {
      const { id } = ctx.from;

      const document = await this.telegramService.getSaleReportByProductCurrentMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('previousMonthByProduct', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByProductForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document);
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('anyPeriodByProduct', async (ctx) => {
      await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      await ctx.answerCbQuery();
      anyPeriodByProduct = true;
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
      await ctx.answerCbQuery();
    });

    stepHandler.action('reportByVendorCode', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonthByVendorCode')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonthByVendorCode')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriodByVendorCode')],
          [Markup.button.callback('↩️ Назад', 'salesReport')],
        ]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('reportByProduct', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText(
        'Текст...',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriodByProduct')],
          [Markup.button.callback('↩️ Назад', 'salesReport')],
        ]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('newKey', async (ctx) => {
      addApiKey = true;
      await ctx.reply(
        'Инструкция для получения ключа https://telegra.ph/Podrobnaya-instrukciya-po-sozdaniyu-API-klyucha-Wildberries-i-privyazke-ego-k-nashemu-botu-WB-Otchety-12-16',
      );
      await ctx.reply('Отправте ваш ключ в ответном сообщении');
      await ctx.answerCbQuery();
    });

    stepHandler.action('dev', async (ctx) => {
      await ctx.reply('в разработке...');
      await ctx.answerCbQuery();
    });

    stepHandler.action('subscribeSettings', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.SUBSCRIBE_SETTINGS);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('settings', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.SETTINGS);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('mainMenu', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('salesReport', async (ctx) => {
      await ctx.editMessageText(
        'Вам доступны четыре вида финансовых отчетов. \n' +
          '1.Отчет с цифрами по каждому артикулу из категорий Ваших товаров. \n' +
          '2.Отчет сжатый до категории товаров. Вы видите какая категория сколько зарабатывает. \n' +
          '3.Отчет сжатый до общей информации по всем категориям. Вы увидите общее количество заказов, возвратов и их суммы. Мы посчитаем общую возвращенную себестоимость за весь реализованный товар, сумму которую необходимо оставить на налоги и Вашу чистую прибыль.\n' +
          '4.Отчет по отдельному артикулу. Если для Вас важно посмотреть как продается ваш товар. \n',
        Markup.inlineKeyboard([
          [Markup.button.callback('Отчет по категориям товаров', 'reportByProduct')],
          [Markup.button.callback('Отчет по артикулам', 'reportByVendorCode')],
          // [Markup.button.callback('Отчет по конкретному артикулу', 'dev')],
          // [Markup.button.callback('Сводный отчет', 'dev')],
          [Markup.button.callback('↩️ Назад', 'back')],
        ]),
      );
      await ctx.answerCbQuery();
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
        await ctx.answerCbQuery();
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

        const isValid = await this.shopServices.isValidToken(text);

        if (isValid) {
          const { id } = ctx.message.from;
          const shop = await this.shopServices.addShop('name', text, id);
          this.wbParserSalesReportService.parseByShopId(shop.id);
          await ctx.reply('Ключ добавлен');
        } else {
          await ctx.reply(`Токен ${text} не валидный.`);
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
          await ctx.telegram.sendDocument(id, document, {
            caption: `Отчет по артикулам за период ${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}`,
          });
        }
      } else if (anyPeriodByProduct) {
        // @ts-ignore
        const [from, to] = ctx.message.text.trim().split('-');
        const { id } = ctx.message.from;

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        if (fromDate.isValid() && toDate.isValid()) {
          const document = await this.telegramService.getSaleReportByProduct(id, fromDate.toDate(), toDate.toDate());
          // @ts-ignore
          await ctx.telegram.sendDocument(id, document, {
            caption: `Отчет по артикулам за период ${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}`,
          });
        } else {
          await ctx.reply('Даты указаны неверно!');
        }
      }

      addApiKey = false;
      uploadPrice = false;
      anyPeriodByVendorCode = false;
      anyPeriodByProduct = false;

      return ctx.scene.enter(SCENES.MAIN_MENU);
    });

    const mainMenu = new Scenes.WizardScene(
      SCENES.MAIN_MENU,
      async (ctx) => {
        // console.log(ctx);
        if (!ctx.message?.from) {
          return ctx.scene.leave();
        }

        const { id, username, first_name, last_name, language_code } = ctx.message.from;
        // @ts-ignore
        const refId = parseInt(ctx?.message?.text?.split('/start')[1]?.trim()) || null;

        console.log(refId);

        await this.userRegistrationService.registrationByTelegram(id, username, first_name, last_name, language_code, refId);

        // @ts-ignore
        const button = ctx.message.text;

        if (button === '🟣 Мой Wildberries') {
          const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
          await ctx.reply(text, menu);
          return ctx.wizard.next();
        } else if (button === '⚙ Настройки') {
          const { text, menu } = await this.buildInlineMenu(id, MENU.SETTINGS);
          await ctx.reply(text, menu);
          return ctx.wizard.next();
        }

        await ctx.reply(
          '🟣 Мой Wildberries',
          Markup.keyboard([
            ['🟣 Мой Wildberries'], // Row1 with 2 buttons
            ['⚙ Настройки'], // Row2 with 2 buttons
          ]).resize(),
        );
      },
      stepHandler,
    );

    return mainMenu;
  }

  public async buildInlineMenu(userTgId: number, menuId: MENU): Promise<{ text: string; menu: Markup.Markup<InlineKeyboardMarkup> }> {
    const user = await this.userService.findUserByTgId(userTgId);

    if (user.subscriptionExpirationDate < moment().toDate()) {
      const menu = [];
      menu.push([Markup.button.callback('💳 Продлить подписку', 'subscribeSettings')]);
      return {
        text: 'У вас закончилась подписка на сервис',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.MAIN_MENU) {
      const menu = [];
      const shop = await this.shopServices.findShopByUserID(user.id);

      if (!shop) {
        menu.push([Markup.button.callback('🔑 Подключить АПИ ключ', 'newKey')]);
      } else {
        menu.push([Markup.button.callback('🔸 Отчет по продажам', 'salesReport')]);
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', 'costPrice')]);
      }

      menu.push([Markup.button.callback('❔ О сервисе', 'aboutBot')]);

      return {
        text: 'Просматривайте информацию о своем магазине и получайте отчеты.',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.ADD_API_KEY) {
      const menu = [];

      const shop = await this.shopServices.findShopByUserID(user.id);

      menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return {
        text: `Ваш текущий API ключ ${shop?.token}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SETTINGS) {
      const shop = await this.shopServices.findShopByUserID(user.id);

      const menu = [];

      if (shop) {
        menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      }

      menu.push([Markup.button.callback('💳 Продлить подписку', 'subscribeSettings')]);
      menu.push([Markup.button.callback('Получить бонус', 'bonus')]);

      const countDays = moment(user.subscriptionExpirationDate).diff(moment(), 'days');

      return {
        text: `Подписка истекает через ${countDays} дня(ей)\nAPI ключ: ${shop?.token || '-'}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SUBSCRIBE_SETTINGS) {
      const menu = [];

      menu.push([Markup.button.callback(`На ${PLANS['PLAN_1'].month} месяц за ${PLANS['PLAN_1'].amount} рублей`, 'pay1')]);
      menu.push([Markup.button.callback(`На ${PLANS['PLAN_2'].month} месяца за ${PLANS['PLAN_2'].amount} рублей`, 'pay2')]);
      menu.push([Markup.button.callback(`На ${PLANS['PLAN_3'].month} месяца за ${PLANS['PLAN_3'].amount} рублей`, 'pay3')]);
      menu.push([Markup.button.callback('↩️ Назад', 'settings')]);

      return {
        text: `Выберите вариант подписки:`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.COST_PRICE) {
      const menu = [];

      menu.push([Markup.button.callback('💸 ️Текущая себестоимость', 'getCostPrice')]);
      menu.push([Markup.button.callback('🔄️ Загрузить/обновить себестоимость', 'updateCostPrice')]);
      menu.push([Markup.button.callback('↩️ Назад', 'mainMenu')]);

      return {
        text: 'Чтобы корректно рассчитать отчет, от Вас требуется один раз подгрузить данные по себестоимости отдельных артикулов. Для этого нажмите кнопку “Текущая себестоимость” я выгружу документ со всеми Вашими артикулами, остается только его заполнить и загрузить обратно, для загрузки нажмите “Загрузить/обновить себестоимость” и следуйте инструкции.',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    throw new Error(`Invalid menu ID: ${menuId}`);
  }
}
