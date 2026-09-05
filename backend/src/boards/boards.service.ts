import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../common/current-user.decorator';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  private async assertAccess(boardId: string, userId: string) {
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this board');
    }
    return member;
  }

  private async findBoardOrThrow(boardId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async create(user: CurrentUser, title: string) {
    const board = await this.prisma.board.create({
      data: {
        title,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: 'OWNER' },
        },
      },
      include: { members: true },
    });
    return board;
  }

  async findAll(user: CurrentUser) {
    return this.prisma.board.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: CurrentUser, boardId: string) {
    await this.assertAccess(boardId, user.id);
    return this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  async update(user: CurrentUser, boardId: string, title: string) {
    const board = await this.findBoardOrThrow(boardId);
    if (board.ownerId !== user.id) {
      throw new ForbiddenException('Only the board owner can edit this board');
    }
    return this.prisma.board.update({ where: { id: boardId }, data: { title } });
  }

  async remove(user: CurrentUser, boardId: string) {
    const board = await this.findBoardOrThrow(boardId);
    if (board.ownerId !== user.id) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }
    await this.prisma.board.delete({ where: { id: boardId } });
    return { success: true };
  }

  async share(user: CurrentUser, boardId: string, email: string) {
    const board = await this.findBoardOrThrow(boardId);
    if (board.ownerId !== user.id) {
      throw new ForbiddenException('Only the board owner can share this board');
    }
    const target = await this.prisma.user.findUnique({ where: { email } });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: target.id } },
    });
    if (existing) {
      throw new ConflictException('User already has access to this board');
    }
    return this.prisma.boardMember.create({
      data: { boardId, userId: target.id, role: 'MEMBER' },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }
}
