import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller('front-test')
export class FrontTestController {
  @Get()
  async test(@Req() req, @Res() res) {
    return 'hello world';
  }
}
