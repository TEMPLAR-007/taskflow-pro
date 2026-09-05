import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../common/current-user.decorator';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  private async assertBoardAccess(boardId: string, userId: string) {
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this board');
    }
    return member;
  }

  private async getBoardIdForColumn(columnId: string) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return column.boardId;
  }

  async getNextPosition(boardId: string) {
    const max = await this.prisma.column.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    return (max._max.position ?? 0) + 1;
  }

  async create(user: CurrentUser, boardId: string, title: string) {
    await this.assertBoardAccess(boardId, user.id);
    const position = await this.getNextPosition(boardId);
    return this.prisma.column.create({ data: { boardId, title, position } });
  }

  async update(user: CurrentUser, columnId: string, title: string) {
    const boardId = await this.getBoardIdForColumn(columnId);
    await this.assertBoardAccess(boardId, user.id);
    return this.prisma.column.update({ where: { id: columnId }, data: { title } });
  }

  async remove(user: CurrentUser, columnId: string) {
    const boardId = await this.getBoardIdForColumn(columnId);
    await this.assertBoardAccess(boardId, user.id);
    await this.prisma.column.delete({ where: { id: columnId } });
    return { success: true };
  }
}
