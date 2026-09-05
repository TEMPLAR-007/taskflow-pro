import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardsService } from './boards.service';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateBoardDto, UpdateBoardDto, ShareBoardDto } from './dto/board.dto';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUser, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(user, dto.title);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUser) {
    return this.boardsService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.boardsService.findOne(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(user, id, dto.title);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.boardsService.remove(user, id);
  }

  @Post(':id/share')
  share(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: ShareBoardDto) {
    return this.boardsService.share(user, id, dto.email);
  }
}
