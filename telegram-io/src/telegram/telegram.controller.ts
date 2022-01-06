/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Update, InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf, Composer } from 'telegraf';

import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';

type TelegrafContext = any;
import * as moment from 'moment';
import { Scenes } from 'telegraf';

import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import { TelegramService } from './telegram.service';

import { UtilsService } from '../utils/utils.service';

const RedisSession = require('telegraf-session-redis');

export interface Plan {
  amount: number;
  month: number;
}

export const PLANS: Record<string, Plan> = {
  PLAN_1: { amount: 490, month: 1 },
  PLAN_2: { amount: 800, month: 2 },
  PLAN_3: { amount: 1200, month: 3 },
};

enum MENU {
  COST_PRICE,
  SUBSCRIBE_SETTINGS,
  SETTINGS,
  ADD_API_KEY,
  MAIN_MENU,
  SALES_REPORTS,
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

export enum TgActions {
  GET_COST_PRICE = '0',
  UPDATE_COST_PRICE = '1',
  ENTERING_DATE_FOR_SUMMARY_REPORT = '2',
  GENERATING_SUMMARY_REPORT = '3',
  ENTERING_API_KEY = '4',
}

enum SCENES {
  MAIN_MENU = 'MAIN_MENU',
}

let anyPeriodByVendorCode = false;
let anyPeriodByProduct = false;

let anyRas = false;
let rashod = 0;

@Update()
export class TelegramController {
  // @ts-ignore
  private stage: Scenes.Stage;

  constructor(
    private readonly httpService: HttpService,
    private readonly telegramService: TelegramService,
    private readonly utilsService: UtilsService,
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
    const stepHandler = new Composer<Scenes.WizardContext & { session?: { action: string; data: any } }>();

    stepHandler.action(TgActions.GET_COST_PRICE, async (ctx) => {
      const { id } = ctx.from;

      const document = await this.telegramService.getPrice(id);

      // @ts-ignore
      await ctx.telegram.sendDocument(ctx.from.id, document, {
        caption: 'Скачайте и заполните себестоимость по своим товарам',
      });
      await ctx.answerCbQuery();
    });

    stepHandler.action(TgActions.UPDATE_COST_PRICE, async (ctx) => {
      ctx.session.action = 'uploadPrice';
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
      await ctx.editMessageText(
        'Финансовые отчеты Wildberries в удобном формате\n' +
          'Предоставление доступа  - Вы предоставляете доступ к данным, загружаете данные по себестоимости Ваших товаров.\n' +
          'Формирование отчётов - Мы на основе Ваших данных и данных из детализации финансовых отчетов формируем и выгружаем справочную информацию, создаем понятные отчеты. \n' +
          'Финальная интеграция - Вам предоставляется Telegram-бот, с простым и понятным функционалом.\n' +
          '\n' +
          'Освободите время для поиска и продвижения товаров. Рутину мы возьмем на себя. За секунды предоставим готовые отчеты.\n',
        Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'mainMenu')]),
      );
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

    stepHandler.action('summaryCurrentMonthByProduct', async (ctx) => {
      ctx.session.action = 'enteringAdvertisingCosts';
      const fromDate = moment().startOf('month').toDate();
      const toDate = moment().endOf('month').toDate();
      ctx.session.data = { fromDate: fromDate, toDate: toDate };
      ctx.reply('Укажите расходы на рекламу');
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('summaryPreviousMonthByProduct', async (ctx) => {
      ctx.session.action = 'enteringAdvertisingCosts';
      const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
      const toDate = moment().subtract(1, 'months').endOf('month').toDate();
      ctx.session.data = { fromDate: fromDate, toDate: toDate };
      ctx.reply('Укажите расходы на рекламу');
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('anyRas', async (ctx) => {
      await ctx.reply('Укажите сумму расходов за указанный переиод');
      await ctx.answerCbQuery();
      anyRas = true;
    });

    stepHandler.action('summaryAnyPeriodByProduct', async (ctx) => {
      // @ts-ignore
      await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      await ctx.answerCbQuery();
      ctx.session.action = TgActions.ENTERING_DATE_FOR_SUMMARY_REPORT;
    });

    stepHandler.action('currentMonthByProduct', async (ctx) => {
      const { id } = ctx.from;

      const document = await this.telegramService.getSaleReportByProductCurrentMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document, {
        caption: document.description,
      });
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('previousMonthByProduct', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByProductForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document, {
        caption: document.description,
      });
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
      await ctx.telegram.sendDocument(id, document, {
        caption: document.description,
      });
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('previousMonthByVendorCode', async (ctx) => {
      const { id } = ctx.from;
      const document = await this.telegramService.getSaleReportByVendorCodeForPreviousMonth(id);
      // @ts-ignore
      await ctx.telegram.sendDocument(id, document, {
        caption: document.description,
      });
      await ctx.answerCbQuery();
      return;
    });

    stepHandler.action('anyPeriodByVendorCode', async (ctx) => {
      await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
      anyPeriodByVendorCode = true;
      await ctx.answerCbQuery();
    });

    stepHandler.action('taxPercent', async (ctx) => {
      await ctx.reply('Для расчета суммы отчислений, введите свою процентную ставку налогообложения');
      ctx.session.action = 'taxPercent';
      await ctx.answerCbQuery();
    });

    stepHandler.action('reportByVendorCode', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText(
        'Отчет по каждому артикулу из категорий товаров. Выберете нужный период',
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
        'Отчет сжатый до категории товаров. Вы видите какая категория сколько зарабатывает. Выберете нужный период',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'currentMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_11, 'previousMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_12, 'anyPeriodByProduct')],
          [Markup.button.callback('↩️ Назад', 'salesReport')],
        ]),
      );
      await ctx.answerCbQuery();
    });

    stepHandler.action('summaryReportByProduct', async (ctx) => {
      const { id } = ctx.from;
      await ctx.editMessageText(
        'Отчет сжатый до общей информации по всем Вашим товарам. Выберете период: месяц или неделя',
        Markup.inlineKeyboard([
          [Markup.button.callback(BUTTONS.button_10, 'summaryCurrentMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_11, 'summaryPreviousMonthByProduct')],
          [Markup.button.callback(BUTTONS.button_12, 'summaryAnyPeriodByProduct')],
          [Markup.button.callback('↩️ Назад', 'salesReport')],
        ]),
      );

      await ctx.answerCbQuery();
    });

    stepHandler.action('newKey', async (ctx) => {
      ctx.session.action = TgActions.ENTERING_API_KEY;

      await ctx.reply('Отправьте ваш API ключ в ответном сообщении');
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
      await ctx.editMessageText(text, { ...menu, parse_mode: 'HTML' });
      await ctx.answerCbQuery();
    });

    stepHandler.action('mainMenu', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.action('salesReport', async (ctx) => {
      const { id } = ctx.from;
      const { text, menu } = await this.buildInlineMenu(id, MENU.SALES_REPORTS);
      await ctx.editMessageText(text, menu);
      await ctx.answerCbQuery();
    });

    stepHandler.on('document', async (ctx) => {
      console.log(ctx.session.action);
      if (ctx.session.action === 'uploadPrice') {
        const link = await ctx.telegram.getFileLink(ctx.update.message.document.file_id);

        const data = await this.httpService
          .get(link.href, { responseType: 'arraybuffer' })
          .pipe(map(({ data }) => data))
          .toPromise();

        const { id } = ctx.message.from;

        await this.telegramService.setPrice(id, data);
        await ctx.reply('Файл успешно загружен. Можем начинать.');
      }

      ctx.session.action = '';
      return;
    });

    stepHandler.on('message', async (ctx) => {
      console.log(ctx.session.action);
      // @ts-ignore
      console.log('message', ctx.message.text);
      const { id } = ctx.message.from;
      // @ts-ignore

      // @ts-ignore
      const { text } = ctx.message;

      if (ctx.session.action === TgActions.ENTERING_API_KEY) {
        ctx.session.action = '';
        const isValid = await this.telegramService.isValidToken(text);

        if (isValid) {
          const shopId = await this.telegramService.addShop(id, 'name', text);
          // this.wbStatService.parseByShopId(shopId);
          await ctx.reply('Ключ успешно добавлен, сейчас мы начали загрузку информации по продажам с WB');
        } else {
          await ctx.reply(`Токен ${text} не валидный.`);
        }
      } else if (anyPeriodByVendorCode) {
        ctx.session.action = '';
        const [from, to] = text.trim().split('-');

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        if (fromDate.isValid() && toDate.isValid()) {
          const document = await this.telegramService.getSaleReportByVendorCode(id, fromDate.toDate(), toDate.toDate());
          // @ts-ignore
          await ctx.telegram.sendDocument(id, document, {
            caption: document.description,
          });
        }
      } else if (anyPeriodByProduct) {
        ctx.session.action = '';
        const [from, to] = text.trim().split('-');

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        if (fromDate.isValid() && toDate.isValid()) {
          const document = await this.telegramService.getSaleReportByProduct(id, fromDate.toDate(), toDate.toDate());
          // @ts-ignore
          await ctx.telegram.sendDocument(id, document, {
            caption: document.description,
          });
        } else {
          await ctx.reply('Даты указаны неверно1!');
        }
      } else if (ctx.session.action === TgActions.ENTERING_DATE_FOR_SUMMARY_REPORT) {
        ctx.session.action = '';
        const [from, to] = text.trim().split('-');

        const fromDate = moment(from, 'DD.MM.YYYY');
        const toDate = moment(to, 'DD.MM.YYYY');

        const isValidDates = fromDate.isValid() && toDate.isValid();

        if (isValidDates) {
          ctx.session.action = 'enteringAdvertisingCosts';
          ctx.session.data = { fromDate: fromDate.toDate(), toDate: toDate.toDate() };
          await ctx.reply('Укажите расходы на рекламу');
        } else {
          await ctx.reply('Даты указаны неверно!');
        }
      } else if (ctx.session.action === 'taxPercent') {
        ctx.session.action = '';
        const isNumber = this.utilsService.isIntNumber(text);

        if (!isNumber) {
          await ctx.reply('Вы указали неверное значение');
        } else {
          await this.telegramService.updateTaxPercent(id, Number(text));
          await ctx.reply(`Ваш процент налогообложения ${text}%`);
        }
      } else if (ctx.session.action === 'enteringAdvertisingCosts') {
        ctx.session.action = '';
        const isNumber = this.utilsService.isFloatNumber(text);
        if (!isNumber) {
          await ctx.reply('Расходы на рекламу указаны неверно');
        }
        ctx.session.action = 'enteringCostsReceivingGoods';
        ctx.session.data = { ...ctx.session.data, advertisingCosts: text };
        //
        await ctx.reply('Укажите расходы на приемку товара');
      } else if (ctx.session.action === 'enteringCostsReceivingGoods') {
        ctx.session.action = '';
        const isNumber = this.utilsService.isFloatNumber(text);
        if (!isNumber) {
          await ctx.reply('Значение расходов на приемку товара указано неверно');
        }
        ctx.session.action = TgActions.GENERATING_SUMMARY_REPORT;
        ctx.session.data = { ...ctx.session.data, receivingGoodCosts: text };
        await ctx.reply('Укажите расходы на хранение товара');
      } else if (ctx.session.action === TgActions.GENERATING_SUMMARY_REPORT) {
        ctx.session.action = '';
        const isNumber = this.utilsService.isFloatNumber(text);
        if (!isNumber) {
          await ctx.reply('Значение указано неверно');
        }
        const { fromDate, toDate } = ctx.session.data;

        const options = {
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
          advertisingCosts: this.utilsService.priceToScaled(ctx.session.data.advertisingCosts),
          receivingGoodCosts: this.utilsService.priceToScaled(ctx.session.data.receivingGoodCosts),
          storageCosts: this.utilsService.priceToScaled(text),
        };

        const document = await this.telegramService.getSalesSummaryReportByProduct(id, options);
        // @ts-ignore
        await ctx.telegram.sendDocument(id, document, {
          caption: document.description,
        });
      } else if (anyRas) {
        ctx.session.action = '';
        const isNumber = this.utilsService.isIntNumber(text);

        if (!isNumber) {
          await ctx.reply('Вы указали неверное значение');
        } else {
          rashod = Number(text);

          await ctx.reply('Расходы за указанный период' + text);
        }
      } else if (text === '🟣 Мой Wildberries') {
        const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
        await ctx.reply(text, menu);
        return;
      } else if (text === '⚙ Настройки') {
        const { text, menu } = await this.buildInlineMenu(id, MENU.SETTINGS);
        await ctx.reply(text, { ...menu, parse_mode: 'HTML' });
        return;
      } else if (text === '/start') {
        const { id, username, first_name, last_name, language_code } = ctx.message.from;
        // @ts-ignore
        const refId = parseInt(ctx?.message?.text?.split('/start')[1]?.trim()) || null;

        console.log(refId);

        await this.telegramService.registration(id, username, first_name, last_name, language_code, refId);
        await ctx.reply(
          '🟣 Мой Wildberries',
          Markup.keyboard([
            ['🟣 Мой Wildberries'], // Row1 with 2 buttons
            ['⚙ Настройки'], // Row2 with 2 buttons
          ]).resize(),
        );
      } else if (text === '/menu') {
        await ctx.reply(
          '🟣 Мой Wildberries',
          Markup.keyboard([
            ['🟣 Мой Wildberries'], // Row1 with 2 buttons
            ['⚙ Настройки'], // Row2 with 2 buttons
          ]).resize(),
        );
      }

      anyRas = false;
      anyPeriodByVendorCode = false;
      anyPeriodByProduct = false;
      return;
    });

    // @ts-ignore
    const mainMenu = new Scenes.WizardScene(SCENES.MAIN_MENU, stepHandler);

    return mainMenu;
  }

  public async buildInlineMenu(userTgId: number, menuId: MENU): Promise<{ text: string; menu: Markup.Markup<InlineKeyboardMarkup> }> {
    const user = await this.telegramService.findUserByTgId(userTgId);
    const shop = await this.telegramService.findShopByUserTgId(userTgId);

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

    if (menuId === MENU.MAIN_MENU) {
      const menu = [];
      let text = '';
      if (shop) {
        text = 'Просматривайте информацию о своем магазине и получайте отчеты.';
        menu.push([Markup.button.callback('🔸 Отчет по продажам', 'salesReport')]);
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', 'costPrice')]);
      } else {
        text = 'Для того что бы бот мог подготовить отчеты по продажам требуется подключить API ключ';
        menu.push([Markup.button.callback('🔑 Подключить API ключ', 'newKey')]);
        menu.push([
          Markup.button.url(
            '📖 Инструкция по созданию API ключа',
            'https://telegra.ph/Podrobnaya-instrukciya-po-sozdaniyu-API-klyucha-Wildberries-i-privyazke-ego-k-nashemu-botu-WB-Otchety-12-16',
          ),
        ]);
      }

      menu.push([Markup.button.callback('❔ О сервисе', 'aboutBot')]);
      menu.push([Markup.button.url('💬 Чат поддержки', 'https://t.me/+eWcHz7NUoW80ODhi')]);

      return {
        text: text,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.ADD_API_KEY) {
      const menu = [];

      menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return {
        text: `Ваш текущий API ключ ${shop?.token}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SETTINGS) {
      const tax = await this.telegramService.getTaxPercent(userTgId);

      const menu = [];

      if (shop) {
        menu.push([Markup.button.callback('➕ Изменить API ключ', 'newKey')]);
      }

      menu.push([Markup.button.callback('💳 Продлить подписку', 'subscribeSettings')]);
      menu.push([Markup.button.callback('Получить бонус', 'bonus')]);
      menu.push([Markup.button.callback('Процент налогооблажения', 'taxPercent')]);

      const countDays = moment(user.subscriptionExpirationDate).diff(moment(), 'days');

      return {
        text: `<b>Подписка</b> истекает через ${countDays} дня(ей)\nAPI ключ: <i>${shop?.token || '-'}</i>\nТекущий процент налогооблажения: ${tax}%`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.COST_PRICE) {
      const menu = [];

      menu.push([Markup.button.callback('💸 ️Текущая себестоимость', TgActions.GET_COST_PRICE)]);
      menu.push([Markup.button.callback('🔄️ Загрузить/обновить себестоимость', TgActions.UPDATE_COST_PRICE)]);
      menu.push([Markup.button.callback('↩️ Назад', 'mainMenu')]);

      return {
        text: 'Чтобы корректно рассчитать отчет, от Вас требуется один раз подгрузить данные по себестоимости отдельных артикулов. Для этого нажмите кнопку “Текущая себестоимость” я выгружу документ со всеми Вашими артикулами, остается только его заполнить и загрузить обратно, для загрузки нажмите “Загрузить/обновить себестоимость” и следуйте инструкции.',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SALES_REPORTS) {
      if (user.subscriptionExpirationDate < moment().toDate()) {
        const menu = [];
        menu.push([Markup.button.callback('💳 Продлить подписку', 'subscribeSettings')]);
        return {
          text: 'У вас закончилась подписка на сервис',
          menu: Markup.inlineKeyboard(menu),
        };
      }

      const menu = [];

      menu.push([Markup.button.callback('Отчёт по артикулам товаров', 'reportByVendorCode')]);
      menu.push([Markup.button.callback('Отчет по категориям товаров', 'reportByProduct')]);
      menu.push([Markup.button.callback('Сводный отчет', 'summaryReportByProduct')]);
      menu.push([Markup.button.callback('Отчет по конкретному артикулу', 'dev')]);
      menu.push([Markup.button.callback('↩️ Назад', 'back')]);

      return {
        text: 'Вам доступны четыре вида финансовых отчетов. \n',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    throw new Error(`Invalid menu ID: ${menuId}`);
  }
}
