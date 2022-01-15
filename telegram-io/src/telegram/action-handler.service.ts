import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { LogTgEvent } from '../amplitude/amplitude.decorators';
import { MENU, PLANS, TgActions } from './telegram.controller';
import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import * as moment from 'moment';
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

let anyPeriodByVendorCode = false;
let anyPeriodByProduct = false;

@Injectable()
export class ActionHandlerService {
  constructor(private readonly telegramService: TelegramService) {}

  @LogTgEvent()
  public async showAboutBot(ctx): Promise<void> {
    await ctx.editMessageText(
      'Мы - команда поставщиков, которые создали сервис для быстрого расчета отчетов реализации. Понятные цифры, в которых разберется каждый.\n\n' +
        '➡️Вы предоставляете доступ к данным, подгружаете данные по себестоимости ваших товаров.\n' +
        '✅Мы на основе ваших данных и данных из детализации финансовых отчетов формируем и выгружаем справочную информацию, создаем простые и понятные отчеты.',
      Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'mainMenu')]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportMenu(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.SALES_REPORTS);
    await ctx.editMessageText(text, menu);
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showSettingsMenu(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.SETTINGS);
    await ctx.editMessageText(text, { ...menu, parse_mode: 'HTML' });
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showBonusInfo(ctx): Promise<void> {
    const { id } = ctx.from;
    await ctx.editMessageText(
      `Приглашайте друзей в сервис по вашей реферальной ссылке и вы получите 5 дней пользования сервисом при каждой оплате приглашенного пользователя https://t.me/wb_sales_pro_bot?start=${id}`,
      Markup.inlineKeyboard([Markup.button.callback('↩️ Назад', 'settings')]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showMainMenu(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
    await ctx.reply(text, menu);
  }

  @LogTgEvent()
  public async showMainSettingsMenu(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.SETTINGS);
    await ctx.reply(text, { ...menu, parse_mode: 'HTML' });
    return;
  }

  @LogTgEvent()
  public async showPay1Info(ctx): Promise<void> {
    const { id } = ctx.from;
    const url = await this.telegramService.createPayment(id, 'PLAN_1');
    await ctx.editMessageText(
      '\n' +
        'Вы выбрали подписку на 1 месяц за 490 руб. Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
      Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showPay2Info(ctx): Promise<void> {
    const { id } = ctx.from;
    const url = await this.telegramService.createPayment(id, 'PLAN_2');
    await ctx.editMessageText(
      'Вы выбрали подписку на 2 месяца за 800 руб. (Ваша выгода составит 180 руб.) Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
      Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showPay3Info(ctx): Promise<void> {
    const { id } = ctx.from;
    const url = await this.telegramService.createPayment(id, 'PLAN_3');
    await ctx.editMessageText(
      'Вы выбрали подписку на 3 месяца за 1200 руб. (Ваша выгода составит 270 руб.) Для оплаты сервиса нажмите “Перейти к оплате” и перейдите по ссылке в онлайн кассу. Выберите способы оплаты. Срок подписки автоматически обновится.',
      Markup.inlineKeyboard([[Markup.button.url('💸 Перейти к оплате', url)], [Markup.button.callback('↩️ Назад', 'subscribeSettings')]]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showTaxSettings(ctx): Promise<void> {
    await ctx.reply('Для расчета суммы отчислений, введите свою процентную ставку налогообложения');
    ctx.session.action = 'taxPercent';
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showSubscribeSettings(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.SUBSCRIBE_SETTINGS);

    await ctx.editMessageText(text, menu);
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async downloadCostPrise(ctx): Promise<void> {
    const { id } = ctx.from;

    const document = await this.telegramService.getPrice(id);

    await ctx.telegram.sendDocument(ctx.from.id, document, {
      caption: 'Скачайте и заполните себестоимость по своим товарам',
    });
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async uploadCostPrise(ctx): Promise<void> {
    ctx.session.action = 'uploadPrice';
    await ctx.reply('Отправьте файл с себестоимостью в ответном сообщении');
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showAddApiKey(ctx): Promise<void> {
    ctx.session.action = TgActions.ENTERING_API_KEY;

    await ctx.reply('Отправьте ваш API ключ в ответном сообщении');
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showCostPriceMenu(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.COST_PRICE);
    await ctx.editMessageText(text, menu);
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByVendorCodeMenu(ctx): Promise<void> {
    await ctx.editMessageText(
      'Отчет по каждому артикулу из категорий товаров. Выберете нужный период',
      Markup.inlineKeyboard([
        [Markup.button.callback(BUTTONS.button_10, TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_CURRENT_MONTH)],
        [Markup.button.callback(BUTTONS.button_11, TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_PREVOUS_MONTH)],
        [Markup.button.callback(BUTTONS.button_12, TgActions.SHOW_PROFIT_REPORT_BY_VENDOR_CODE_ANY_PERIOD)],
        [Markup.button.callback('↩️ Назад', TgActions.SHOW_PROFIT_REPORT_MENU)],
      ]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByVendorCodePreviousMonth(ctx): Promise<void> {
    const { id } = ctx.from;
    const document = await this.telegramService.getSaleReportByVendorCodeForPreviousMonth(id);

    await ctx.telegram.sendDocument(id, document, {
      caption: document.description,
    });
    await ctx.answerCbQuery();
    return;
  }

  @LogTgEvent()
  public async showProfitReportByVendorCodeCurrentMonth(ctx): Promise<void> {
    const { id } = ctx.from;

    const document = await this.telegramService.getSaleReportByVendorCodeForCurrentMonth(id);

    await ctx.telegram.sendDocument(id, document, {
      caption: document.description,
    });
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByVendorCodeAnyPeriod(ctx): Promise<void> {
    await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
    anyPeriodByVendorCode = true;
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByProductCodeMenu(ctx): Promise<void> {
    await ctx.editMessageText(
      'Отчет сжатый до категории товаров. Вы видите какая категория сколько зарабатывает. Выберете нужный период',
      Markup.inlineKeyboard([
        [Markup.button.callback(BUTTONS.button_10, TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_CURRENT_MONTH)],
        [Markup.button.callback(BUTTONS.button_11, TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_PREVOUS_MONTH)],
        [Markup.button.callback(BUTTONS.button_12, TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_ANY_PERIOD)],
        [Markup.button.callback('↩️ Назад', TgActions.SHOW_PROFIT_REPORT_MENU)],
      ]),
    );
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByProductPreviousMonth(ctx): Promise<void> {
    const { id } = ctx.from;
    const document = await this.telegramService.getSaleReportByProductForPreviousMonth(id);

    await ctx.telegram.sendDocument(id, document, {
      caption: document.description,
    });
    await ctx.answerCbQuery();
    return;
  }

  @LogTgEvent()
  public async showProfitReportByProductCurrentMonth(ctx): Promise<void> {
    const { id } = ctx.from;

    const document = await this.telegramService.getSaleReportByProductCurrentMonth(id);

    await ctx.telegram.sendDocument(id, document, {
      caption: document.description,
    });
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportByProductAnyPeriod(ctx): Promise<void> {
    await ctx.reply('Укажите желаемы период в формате 11.11.1111-11.11.1111');
    await ctx.answerCbQuery();
    anyPeriodByProduct = true;
  }

  @LogTgEvent()
  public async showProfitReportSummaryCodeMenu(ctx): Promise<void> {
    await ctx.editMessageText(
      'Отчет сжатый до общей информации по всем Вашим товарам. Выберете период: месяц или неделя',
      Markup.inlineKeyboard([
        [Markup.button.callback(BUTTONS.button_10, TgActions.SHOW_PROFIT_REPORT_SUMMARY_CURRENT_MONTH)],
        [Markup.button.callback(BUTTONS.button_11, TgActions.SHOW_PROFIT_REPORT_SUMMARY_PREVOUS_MONTH)],
        [Markup.button.callback(BUTTONS.button_12, TgActions.SHOW_PROFIT_REPORT_SUMMARY_ANY_PERIOD)],
        [Markup.button.callback('↩️ Назад', TgActions.SHOW_PROFIT_REPORT_MENU)],
      ]),
    );

    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportSummaryPreviousMonth(ctx): Promise<void> {
    ctx.session.action = 'enteringAdvertisingCosts';
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();
    ctx.session.data = { fromDate: fromDate, toDate: toDate };
    ctx.reply('Укажите расходы на рекламу');
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportSummaryCurrentMonth(ctx): Promise<void> {
    ctx.session.action = 'enteringAdvertisingCosts';
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();
    ctx.session.data = { fromDate: fromDate, toDate: toDate };
    ctx.reply('Укажите расходы на рекламу');
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showProfitReportSummaryAnyPeriod(ctx): Promise<void> {
    await ctx.reply('Укажите желаемый период в формате 11.11.1111-11.11.1111');
    await ctx.answerCbQuery();
    ctx.session.action = TgActions.ENTERING_DATE_FOR_SUMMARY_REPORT;
  }

  @LogTgEvent()
  public async showOnDev(ctx): Promise<void> {
    await ctx.reply('в разработке...');
    await ctx.answerCbQuery();
  }

  @LogTgEvent()
  public async showMainMenu2(ctx): Promise<void> {
    const { id } = ctx.from;
    const { text, menu } = await this.buildInlineMenu(id, MENU.MAIN_MENU);
    await ctx.editMessageText(text, menu);
    await ctx.answerCbQuery();
  }

  public async buildInlineMenu(userTgId: number, menuId: MENU): Promise<{ text: string; menu: Markup.Markup<InlineKeyboardMarkup> }> {
    const user = await this.telegramService.findUserByTgId(userTgId);
    const shop = await this.telegramService.findShopByUserTgId(userTgId);

    if (menuId === MENU.SUBSCRIBE_SETTINGS) {
      const menu = [];

      menu.push([Markup.button.callback(`На ${PLANS['PLAN_1'].month} месяц за ${PLANS['PLAN_1'].amount} рублей`, 'pay1')]);
      menu.push([Markup.button.callback(`На ${PLANS['PLAN_2'].month} месяца за ${PLANS['PLAN_2'].amount} рублей`, 'pay2')]);
      menu.push([Markup.button.callback(`На ${PLANS['PLAN_3'].month} месяца за ${PLANS['PLAN_3'].amount} рублей`, 'pay3')]);
      menu.push([Markup.button.callback('↩️ Назад', TgActions.SHOW_SETTINGS)]);

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
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', TgActions.SHOW_COST_PRICE_MENU)]);
        menu.push([Markup.button.callback('🔸 Отчет по прибыли', TgActions.SHOW_PROFIT_REPORT_MENU)]);
      } else {
        text = 'Для того что бы бот мог подготовить отчеты по продажам требуется подключить API ключ';
        menu.push([Markup.button.callback('🔑 Подключить API ключ', TgActions.SHOW_ADD_API_KEY)]);
        menu.push([
          Markup.button.url(
            '📖 Инструкция по созданию API ключа',
            'https://telegra.ph/Podrobnaya-instrukciya-po-sozdaniyu-API-klyucha-Wildberries-i-privyazke-ego-k-nashemu-botu-WB-Otchety-12-16',
          ),
        ]);
      }

      menu.push([Markup.button.callback('❔ О сервисе', TgActions.SHOW_ABOUT_BOT)]);
      menu.push([Markup.button.url('💬 Чат поддержки', 'https://t.me/+eWcHz7NUoW80ODhi')]);
      menu.push([Markup.button.callback('Настройки', TgActions.SHOW_SETTINGS)]);

      return {
        text: text,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.ADD_API_KEY) {
      const menu = [];

      menu.push([Markup.button.callback('➕ Изменить API ключ', TgActions.SHOW_ADD_API_KEY)]);
      menu.push([Markup.button.callback('↩️ Назад', TgActions.SHOW_MAIN_MENU2)]);

      return {
        text: `Ваш текущий API ключ ${shop?.token}`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SETTINGS) {
      const tax = await this.telegramService.getTaxPercent(userTgId);

      const menu = [];

      if (shop) {
        menu.push([Markup.button.callback('➕ Изменить API ключ', TgActions.SHOW_ADD_API_KEY)]);
      }

      menu.push([Markup.button.callback('💳 Продлить подписку', TgActions.SHOW_SUBSCRIBE_SETTINGS)]);
      menu.push([Markup.button.callback('Получить бонус', TgActions.SHOW_BONUS_INFO)]);
      menu.push([Markup.button.callback('Процент налогооблажения', TgActions.SHOW_TAX_SETTINGS)]);

      const countDays = moment(user.subscriptionExpirationDate).diff(moment(), 'days');

      return {
        text: `<b>Подписка</b> истекает через ${countDays} дня(ей)\nAPI ключ: <i>${shop?.token || '-'}</i>\nТекущий процент налогооблажения: ${tax}%`,
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.COST_PRICE) {
      const menu = [];

      menu.push([Markup.button.callback('💸 ️Текущая себестоимость', TgActions.DOWNLOAD_COST_PRICE)]);
      menu.push([Markup.button.callback('🔄️ Загрузить/обновить себестоимость', TgActions.UPLOAD_COST_PRICE)]);
      menu.push([Markup.button.callback('↩️ Назад', TgActions.SHOW_MAIN_MENU2)]);

      return {
        text: 'Чтобы корректно рассчитать отчет, от Вас требуется один раз подгрузить данные по себестоимости отдельных артикулов. Для этого нажмите кнопку “Текущая себестоимость” я выгружу документ со всеми Вашими артикулами, остается только его заполнить и загрузить обратно, для загрузки нажмите “Загрузить/обновить себестоимость” и следуйте инструкции.',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    if (menuId === MENU.SALES_REPORTS) {
      if (user.subscriptionExpirationDate < moment().toDate()) {
        const menu = [];
        menu.push([Markup.button.callback('💳 Продлить подписку', TgActions.SHOW_SUBSCRIBE_SETTINGS)]);
        return {
          text: 'У вас закончилась подписка на сервис',
          menu: Markup.inlineKeyboard(menu),
        };
      }

      const menu = [];

      menu.push([Markup.button.callback('Отчёт по товарам', TgActions.SHOW_PROFIT_REPORT_MENU)]);
      menu.push([Markup.button.callback('Отчет по категориям товаров', TgActions.SHOW_PROFIT_REPORT_BY_PRODUCT_MENU)]);
      menu.push([Markup.button.callback('Сводный отчет', TgActions.SHOW_PROFIT_REPORT_SUMMARY_MENU)]);
      menu.push([Markup.button.callback('Отчет по конкретному артикулу', TgActions.SHOW_ON_DEV)]);
      menu.push([Markup.button.callback('↩️ Назад', TgActions.SHOW_MAIN_MENU2)]);

      return {
        text: 'Вам доступны четыре вида финансовых отчетов. \n',
        menu: Markup.inlineKeyboard(menu),
      };
    }

    throw new Error(`Invalid menu ID: ${menuId}`);
  }
}
