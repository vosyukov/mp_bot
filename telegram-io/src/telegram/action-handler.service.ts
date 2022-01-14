import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { LogTgEvent } from '../amplitude/amplitude.decorators';
import { MENU, PLANS, TgActions } from './telegram.controller';
import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import * as moment from 'moment';
import { TelegramService } from './telegram.service';

@Injectable()
export class ActionHandlerService {
  constructor(private readonly telegramService: TelegramService) {}

  @LogTgEvent()
  public async aboutBotAction(ctx): Promise<void> {
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
        menu.push([Markup.button.callback('💸 Cебестоимость товаров', 'costPrice')]);
        menu.push([Markup.button.callback('🔸 Отчет по прибыли', 'salesReport')]);
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

      menu.push([Markup.button.callback('Отчёт по товарам', 'reportByVendorCode')]);
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
