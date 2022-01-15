/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Update, InjectBot, Start, Ctx, On } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';

import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';

type TelegrafContext = any;
import * as moment from 'moment';

import { TelegramService } from './telegram.service';

import { UtilsService } from '../utils/utils.service';

import { ActionHandlerService } from './action-handler.service';
import { LoggingInterceptor } from '../logger/logger.interceptor';
import { UseInterceptors } from '@nestjs/common';

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

export enum MENU {
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
  DOWNLOAD_COST_PRICE = '0',
  UPLOAD_COST_PRICE = '1',
  ENTERING_DATE_FOR_SUMMARY_REPORT = '2',
  GENERATING_SUMMARY_REPORT = '3',
  ENTERING_API_KEY = '4',
  ENTERING_MESSAGE_FOR_ALL_USERS = '5',
  SHOW_ABOUT_BOT = '6',
  SHOW_BONUS_INFO = '7',
  SHOW_PAY_1 = '8',
  SHOW_PAY_2 = '9',
  SHOW_PAY_3 = '10',
  SHOW_TAX_SETTINGS = '11',
  SHOW_SUBSCRIBE_SETTINGS = '12',
  SHOW_SETTINGS = '13',
  SHOW_PROFIT_REPORT_MENU = '14',
  SHOW_ADD_API_KEY = '15',
  SHOW_COST_PRICE_MENU = '16',
  SHOW_PROFIT_REPORT_BY_VENDOR_MENU = '17',
  SHOW_PROFIT_REPORT_BY_VENDOR_CODE_PREVOUS_MONTH = '18',
  SHOW_PROFIT_REPORT_BY_VENDOR_CODE_CURRENT_MONTH = '19',
  SHOW_PROFIT_REPORT_BY_VENDOR_CODE_ANY_PERIOD = '20',
  SHOW_PROFIT_REPORT_BY_PRODUCT_PREVOUS_MONTH = '21',
  SHOW_PROFIT_REPORT_BY_PRODUCT_CURRENT_MONTH = '22',
  SHOW_PROFIT_REPORT_BY_PRODUCT_ANY_PERIOD = '23',
  SHOW_PROFIT_REPORT_BY_PRODUCT_MENU = '24',
  SHOW_PROFIT_REPORT_SUMMARY_PREVOUS_MONTH = '25',
  SHOW_PROFIT_REPORT_SUMMARY_CURRENT_MONTH = '22',
  SHOW_PROFIT_REPORT_SUMMARY_ANY_PERIOD = '27',
  SHOW_PROFIT_REPORT_SUMMARY_MENU = '28',
  SHOW_ON_DEV = '29',
  SHOW_MAIN_MENU2 = '30',
}

let anyPeriodByVendorCode = false;
let anyPeriodByProduct = false;

@Update()
export class TelegramController {
  constructor(
    private readonly httpService: HttpService,
    private readonly telegramService: TelegramService,
    private readonly utilsService: UtilsService,
    private readonly actionHandlerService: ActionHandlerService,
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

    this.bot.use(session);
  }

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    const { id, username, first_name, last_name, language_code } = ctx.message.from;

    const refId = parseInt(ctx?.message?.text?.split('/start')[1]?.trim()) || null;

    await this.telegramService.registration(id, username, first_name, last_name, language_code, refId);
    return await ctx.reply('🟣 Мой Wildberries', Markup.keyboard([['🟣 Мой Wildberries']]).resize());
  }

  @On('callback_query')
  async onCallbackQueryCtx(ctx: TelegrafContext): Promise<void> {
    const { data: action } = ctx.update.callback_query;

    if (action === TgActions.SHOW_ABOUT_BOT) {
      await this.actionHandlerService.showAboutBot(ctx);
    } else if (action === TgActions.SHOW_BONUS_INFO) {
      await this.actionHandlerService.showBonusInfo(ctx);
    } else if (action === TgActions.SHOW_PAY_1) {
      await this.actionHandlerService.showPay1Info(ctx);
    } else if (action === TgActions.SHOW_PAY_2) {
      await this.actionHandlerService.showPay2Info(ctx);
    } else if (action === TgActions.SHOW_PAY_3) {
      await this.actionHandlerService.showPay3Info(ctx);
    } else if (action === TgActions.SHOW_TAX_SETTINGS) {
      await this.actionHandlerService.showTaxSettings(ctx);
    } else if (action === TgActions.SHOW_SUBSCRIBE_SETTINGS) {
      await this.actionHandlerService.showSubscribeSettings(ctx);
    } else if (action === TgActions.SHOW_SETTINGS) {
      await this.actionHandlerService.showSettingsMenu(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_MENU) {
      await this.actionHandlerService.showProfitReportMenu(ctx);
    } else if (action === TgActions.DOWNLOAD_COST_PRICE) {
      await this.actionHandlerService.downloadCostPrise(ctx);
    } else if (action === TgActions.UPLOAD_COST_PRICE) {
      await this.actionHandlerService.uploadCostPrise(ctx);
    } else if (action === TgActions.SHOW_ADD_API_KEY) {
      await this.actionHandlerService.showAddApiKey(ctx);
    } else if (action === TgActions.SHOW_COST_PRICE_MENU) {
      await this.actionHandlerService.showCostPriceMenu(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_PREVOUS_MONTH) {
      await this.actionHandlerService.showProfitReportByVendorCodePreviousMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_MENU) {
      await this.actionHandlerService.showProfitReportByVendorCodeMenu(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_CURRENT_MONTH) {
      await this.actionHandlerService.showProfitReportByVendorCodeCurrentMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_ANY_PERIOD) {
      await this.actionHandlerService.showProfitReportByVendorCodeAnyPeriod(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_MENU) {
      await this.actionHandlerService.showProfitReportByProductCodeMenu(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_ANY_PERIOD) {
      await this.actionHandlerService.showProfitReportByProductAnyPeriod(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_CURRENT_MONTH) {
      await this.actionHandlerService.showProfitReportByProductCurrentMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_PREVOUS_MONTH) {
      await this.actionHandlerService.showProfitReportByProductPreviousMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_MENU) {
      await this.actionHandlerService.showProfitReportByProductCodeMenu(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_SUMMARY_ANY_PERIOD) {
      await this.actionHandlerService.showProfitReportSummaryAnyPeriod(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_SUMMARY_CURRENT_MONTH) {
      await this.actionHandlerService.showProfitReportSummaryCurrentMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_SUMMARY_PREVOUS_MONTH) {
      await this.actionHandlerService.showProfitReportSummaryPreviousMonth(ctx);
    } else if (action === TgActions.SHOW_PROFIT_REPORT_SUMMARY_MENU) {
      await this.actionHandlerService.showProfitReportSummaryCodeMenu(ctx);
    }
  }

  @UseInterceptors(LoggingInterceptor)
  @On('document')
  async onDocument(@Ctx() ctx: TelegrafContext): Promise<void> {
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
  }

  @UseInterceptors(LoggingInterceptor)
  @On('message')
  async onMessage(@Ctx() ctx: TelegrafContext): Promise<void> {
    const { id } = ctx.message.from;
    const { text } = ctx.message;

    if (text === '🟣 Мой Wildberries') {
      await this.actionHandlerService.showMainMenu(ctx);
    } else if (ctx.session.action === TgActions.ENTERING_API_KEY) {
      ctx.session.action = '';
      const isValid = await this.telegramService.isValidToken(text);

      if (isValid) {
        const shopId = await this.telegramService.addShop(id, 'name', text);
        this.telegramService.parseDataByShopId(shopId);
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
    } else if (ctx.session.action === TgActions.ENTERING_MESSAGE_FOR_ALL_USERS) {
      ctx.session.action = '';
      if (text === 'отмена') {
        await ctx.reply('Отправка сообщения отменена');
      } else {
        await this.telegramService.sendMessageAllUsers(id, text);
      }
    } else if (ctx.session.action === TgActions.SHOW_TAX_SETTINGS) {
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
    } else if (text === '/menu') {
      await ctx.reply(
        '🟣 Мой Wildberries',
        Markup.keyboard([
          ['🟣 Мой Wildberries'], // Row1 with 2 buttons
        ]).resize(),
      );
    } else if (text === '/s') {
      ctx.session.action = TgActions.ENTERING_MESSAGE_FOR_ALL_USERS;
      await ctx.reply('Отправьте сообщение для рассылки пользователям (для отмены отправьте "отмена")');
    }

    anyPeriodByVendorCode = false;
    anyPeriodByProduct = false;
    return;
  }
}
