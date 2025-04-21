import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check – confirms the server is running' })
  @ApiOkResponse({
    description: 'Server responded successfully',
    schema: {
      example: { message: 'server is running' },
    },
  })
  getHello() {
    return this.appService.healthCheck();
  }
}
