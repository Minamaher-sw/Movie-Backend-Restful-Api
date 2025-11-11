import { Test, TestingModule } from '@nestjs/testing';
import { GenersController } from './geners.controller';

describe('GenersController', () => {
  let controller: GenersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenersController],
    }).compile();

    controller = module.get<GenersController>(GenersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
