import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!!!qsldjflkqwjeklrjqlkwerjlkqwejrlk';
  }
  sayHello(): string {
    return "hi";
  }
}
