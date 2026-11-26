import { Controller, Patch } from '@nestjs/common';
import { IdParam } from '../../common/decorators/id-param.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/types/user-role.js';
import { InvoiceResponseDto } from './dto/invoice-response.dto.js';
import { SubscriptionsService } from './subscriptions.service.js';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Patch(':id/pay')
  @Roles([UserRole.Admin])
  async pay(@IdParam() id: string): Promise<InvoiceResponseDto> {
    return new InvoiceResponseDto(await this.subscriptionsService.payInvoice(id));
  }
}
