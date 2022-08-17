import { Test, TestingModule } from '@nestjs/testing';
import { FrontTestController } from './front-test.controller';

describe('FrontTestController', () => {
  let controller: FrontTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrontTestController],
    }).compile();

    controller = module.get<FrontTestController>(FrontTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
