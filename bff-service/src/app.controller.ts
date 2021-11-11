import {
  All,
  CACHE_MANAGER,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async makeRecipientCall(
    req: Request,
    res: Response,
    recipient: string,
    recipientUrl: string,
  ) {
    const { originalUrl, method, body } = req;

    const [_, recipients, ...otherTokens] = originalUrl.split('/');

    const shouldUseCache =
      method === 'GET' && recipients === 'products' && !otherTokens.length;

    const cacheProducts = await this.cacheManager.get('CACHE_PRODUCTS');

    if (shouldUseCache && cacheProducts)
      return res.status(HttpStatus.OK).json(cacheProducts);

    try {
      const { data } = await this.appService.request({
        method,
        url: `${recipientUrl}${originalUrl}`,
        body,
      });
      if (shouldUseCache && !cacheProducts) {
        await this.cacheManager.set('CACHE_PRODUCTS', data, { ttl: 120 });
      }

      return res.status(HttpStatus.OK).json(data);
    } catch ({ message, response }) {
      if (response) {
        const { status, data } = response;
        res.status(status).json(data);
      } else {
        throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response): Promise<any> {
    const { originalUrl } = req;
    const recipient = originalUrl.split('/')[1];

    const recipientUrl = process.env[recipient];

    if (recipientUrl) {
      this.makeRecipientCall(req, res, recipient, recipientUrl);
    } else {
      throw new HttpException('Cannot process request', HttpStatus.BAD_GATEWAY);
    }
  }
}
