import { Test, TestingModule } from '@nestjs/testing';
import { GenersService } from './geners.service';

describe('GenersService', () => {
  let service: GenersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenersService],
    }).compile();

    service = module.get<GenersService>(GenersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
