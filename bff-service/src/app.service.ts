import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}
  async request({ method, url, body }) {
    const requestConfig = Object.assign(
      {
        method: method,
        url,
      },
      Object.keys(body || {}).length > 0 && { data: body },
    );

    return this.httpService.request(requestConfig).toPromise();
  }
}
