import { Test, TestingModule } from '@nestjs/testing';
import { MsGraphController } from './ms-graph.controller';

describe('MsGraphController', () => {
  let controller: MsGraphController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MsGraphController],
    }).compile();

    controller = module.get<MsGraphController>(MsGraphController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
