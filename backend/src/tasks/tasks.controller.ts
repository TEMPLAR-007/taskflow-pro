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
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('columns/:columnId/tasks')
  create(
    @CurrentUser() user: CurrentUser,
    @Param('columnId') columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user, columnId, dto.title, dto.description);
  }

  @Patch('tasks/:id')
  update(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(user, id, dto.title, dto.description);
  }

  @Delete('tasks/:id')
  remove(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.tasksService.remove(user, id);
  }

  @Patch('tasks/:id/move')
  move(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasksService.move(user, id, dto.columnId, dto.position);
  }
}
