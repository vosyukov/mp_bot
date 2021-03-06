import { Test } from '@nestjs/testing';

import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let utilsService: UtilsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    utilsService = module.get(UtilsService);
  });

  describe('df', () => {
    it('ef', () => {
      expect(utilsService.scaledToPrice(111)).toBe('1.11');
    });

    it('ef2', () => {
      expect(utilsService.scaledToPrice(1)).toBe('0.01');
    });

    it('ef3', () => {
      expect(utilsService.scaledToPrice(0)).toBe('0.00');
    });
  });

  describe('priceToScaled', () => {
    it('must convert 8', () => {
      expect(utilsService.priceToScaled('8')).toBe(800);
    });

    it('must convert 0', () => {
      expect(utilsService.priceToScaled('0')).toBe(0);
    });

    it('must convert undefined value', () => {
      expect(utilsService.priceToScaled(undefined)).toBe(0);
    });

    it('must convert 1', () => {
      expect(utilsService.priceToScaled('1')).toBe(100);
    });

    it('must convert 1.11', () => {
      expect(utilsService.priceToScaled('1.11')).toBe(111);
    });

    it('must convert 1.111', () => {
      expect(utilsService.priceToScaled('1.111')).toBe(111);
    });

    it('must convert 1.1', () => {
      expect(utilsService.priceToScaled('1.1')).toBe(110);
    });

    it('must convert 111', () => {
      expect(utilsService.priceToScaled('111')).toBe(11100);
    });

    it('must convert -465.77', () => {
      expect(utilsService.priceToScaled('-465.77')).toBe(-46577);
    });

    it('must convert -465,77', () => {
      expect(utilsService.priceToScaled('-465,77')).toBe(-46577);
    });

    it('must convert -4   465,77', () => {
      expect(utilsService.priceToScaled('-4   465,77')).toBe(-446577);
    });

    it('must convert 3 45', () => {
      expect(utilsService.priceToScaled('3 45')).toBe(34500);
    });

    it('must convert 3,45', () => {
      expect(utilsService.priceToScaled('3,45')).toBe(345);
    });
  });
});
