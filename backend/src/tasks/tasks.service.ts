import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../common/current-user.decorator';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async assertBoardAccess(boardId: string, userId: string) {
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this board');
    }
  }

  private async getColumnBoardId(columnId: string) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return column.boardId;
  }

  private async getTaskColumn(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async getNextPosition(columnId: string) {
    const max = await this.prisma.task.aggregate({
      where: { columnId },
      _max: { position: true },
    });
    return (max._max.position ?? 0) + 1;
  }

  async create(user: CurrentUser, columnId: string, title: string, description?: string) {
    const boardId = await this.getColumnBoardId(columnId);
    await this.assertBoardAccess(boardId, user.id);
    const position = await this.getNextPosition(columnId);
    return this.prisma.task.create({
      data: { columnId, title, description, position },
    });
  }

  async update(user: CurrentUser, taskId: string, title?: string, description?: string) {
    const task = await this.getTaskColumn(taskId);
    const boardId = await this.getColumnBoardId(task.columnId);
    await this.assertBoardAccess(boardId, user.id);
    return this.prisma.task.update({
      where: { id: taskId },
      data: { title, description },
    });
  }

  async remove(user: CurrentUser, taskId: string) {
    const task = await this.getTaskColumn(taskId);
    const boardId = await this.getColumnBoardId(task.columnId);
    await this.assertBoardAccess(boardId, user.id);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { success: true };
  }

  async move(
    user: CurrentUser,
    taskId: string,
    targetColumnId: string,
    position: number,
  ) {
    const task = await this.getTaskColumn(taskId);
    const sourceBoardId = await this.getColumnBoardId(task.columnId);
    const targetBoardId = await this.getColumnBoardId(targetColumnId);

    await this.assertBoardAccess(sourceBoardId, user.id);
    await this.assertBoardAccess(targetBoardId, user.id);

    const tasksInTarget = await this.prisma.task.findMany({
      where: { columnId: targetColumnId },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });

    const ordered = tasksInTarget.filter((t) => t.id !== taskId);
    const clampedPosition = Math.max(0, Math.min(position, ordered.length));

    const before = ordered[clampedPosition - 1]?.position ?? null;
    const after = ordered[clampedPosition]?.position ?? null;

    let newPosition: number;
    if (before === null && after === null) {
      newPosition = 1;
    } else if (before === null) {
      newPosition = (after as number) / 2;
    } else if (after === null) {
      newPosition = (before as number) + 1;
    } else {
      newPosition = ((before as number) + (after as number)) / 2;
    }

    const collision = await this.prisma.task.findFirst({
      where: { columnId: targetColumnId, position: newPosition, id: { not: taskId } },
    });

    if (collision) {
      return this.prisma.$transaction(async (tx) => {
        const allTasks = await tx.task.findMany({
          where: { columnId: targetColumnId, id: { not: taskId } },
          orderBy: { position: 'asc' },
        });
        for (let i = 0; i < allTasks.length; i++) {
          await tx.task.update({
            where: { id: allTasks[i].id },
            data: { position: (i + 1) * 1000 },
          });
        }
        const beforeIdx = clampedPosition - 1;
        const afterIdx = clampedPosition;
        const beforeNorm =
          beforeIdx >= 0 ? allTasks[beforeIdx]?.position ?? 1000 : 0;
        const afterNorm =
          afterIdx < allTasks.length ? allTasks[afterIdx]?.position ?? 1000 : null;
        const insertPos =
          afterNorm === null ? beforeNorm + 1000 : (beforeNorm + afterNorm) / 2;

        return tx.task.update({
          where: { id: taskId },
          data: { columnId: targetColumnId, position: insertPos },
        });
      });
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { columnId: targetColumnId, position: newPosition },
    });
  }
}
