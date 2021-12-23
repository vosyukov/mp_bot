import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  public priceToScaled(price = ''): number {
    // eslint-disable-next-line prefer-const
    let [part1, part2] = String(price).split('.');
    if (!part2) {
      part2 = '00';
    } else if (part2.length === 1) {
      part2 = part2 + '0';
    }
    return parseInt(part1 + part2, 10);
  }

  public scaledToPrice(price = 0): string {
    const [part1, part2] = (price / 100).toString().split('.');

    return part1 + '.' + (part2 || '00');
  }

  public isIntNumber(value: string): boolean {
    return !isNaN(parseInt(value));
  }
}
