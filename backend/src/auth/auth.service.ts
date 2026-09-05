import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name },
    });

    // Create default "Getting Started" board with sample tasks
    await this.createDefaultBoard(user.id);

    return this.buildAuthResponse(user);
  }

  private async createDefaultBoard(userId: string) {
    const board = await this.prisma.board.create({
      data: {
        title: 'Getting Started',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        columns: {
          create: [
            {
              title: 'TO DO',
              position: 0,
              tasks: {
                create: [
                  {
                    title: 'Welcome to TaskFlow Pro!',
                    description: 'Drag and drop tasks between columns to organize your work',
                    position: 0,
                  },
                  {
                    title: 'Create your first task',
                    description: 'Click "Add task" below to create a new task',
                    position: 1,
                  },
                ],
              },
            },
            {
              title: 'IN PROGRESS',
              position: 1,
              tasks: {
                create: [
                  {
                    title: 'Explore the board',
                    description: 'Try moving this task to another column',
                    position: 0,
                  },
                ],
              },
            },
            {
              title: 'DONE',
              position: 2,
              tasks: {
                create: [
                  {
                    title: 'Delete tasks you don\'t need',
                    description: 'Click the × button on any task to remove it',
                    position: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    return board;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    passwordHash: string;
  }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { accessToken: token, user: safeUser };
  }
}
