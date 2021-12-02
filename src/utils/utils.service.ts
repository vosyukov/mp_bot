import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  public priceToScaled(price = ''): number {
    const [part1, part2] = String(price).split('.');
    return parseInt(part1 + (part2 || '00'), 10);
  }

  public scaledToPrice(price = 0): string {
    const [part1, part2] = (price / 100).toString().split('.');

    return part1 + '.' + (part2 || '00');
  }
}
