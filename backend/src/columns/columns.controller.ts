import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ColumnsService } from './columns.service';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post('boards/:boardId/columns')
  create(
    @CurrentUser() user: CurrentUser,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(user, boardId, dto.title);
  }

  @Patch('columns/:id')
  update(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(user, id, dto.title);
  }

  @Delete('columns/:id')
  remove(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.columnsService.remove(user, id);
  }
}
