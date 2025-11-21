import {
  Injectable,
  Inject,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryUsersDto, SORT_DIRECTIONS } from './dto/query-users.dto';

interface AuditService {
  logAction(
    data: {
      action: string;
      entity_type: number;
      entity_id: string;
      request_id: string;
      timestamp: string;
    },
    metadata?: Metadata,
  ): any;
}

enum AuditAction {
  UserCreated = 'user_created',
  UserUpdated = 'user_updated',
  UserDeleted = 'user_deleted',
}

const AUDIT_ENTITY_USER = 1;

@Injectable()
export class UsersService implements OnModuleInit {
  private auditService: AuditService;

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @Inject('AUDIT_SERVICE') private auditClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.auditService =
      this.auditClient.getService<AuditService>('AuditService');
  }

  async create(
    createUserDto: CreateUserDto,
    correlationId: string,
  ): Promise<User> {
    const user = await this.userModel.create(createUserDto as any);
    await this.logAuditEvent(
      AuditAction.UserCreated,
      user.id,
      correlationId,
      user.createdAt,
    );
    return user;
  }

  async findAll(
    query: QueryUsersDto,
  ): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_dir = 'asc',
      name,
      email,
      created_from,
      created_to,
    } = query;

    const normalizedLimit = Math.min(limit, 100);
    const offset = (page - 1) * normalizedLimit;

    const sortFieldMap = {
      name: 'name',
      email: 'email',
      created_at: 'createdAt',
    } as const;
    const sortField = sortFieldMap[sort_by] || 'createdAt';
    const sortDirection = SORT_DIRECTIONS.includes(sort_dir) ? sort_dir : 'asc';

    const where: any = {};
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email}%` };
    }
    if (created_from || created_to) {
      where.createdAt = {};
      if (created_from) {
        where.createdAt[Op.gte] = new Date(created_from);
      }
      if (created_to) {
        where.createdAt[Op.lte] = new Date(created_to);
      }
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      order: [
        [sortField, sortDirection.toUpperCase()],
        ['id', sortDirection.toUpperCase()],
      ],
      limit: normalizedLimit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      limit: normalizedLimit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    correlationId: string,
  ): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.update(updateUserDto as any);
    await this.logAuditEvent(
      AuditAction.UserUpdated,
      user.id,
      correlationId,
      user.updatedAt,
    );
    return user;
  }

  async remove(id: string, correlationId: string): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.destroy(); // Soft delete
    await this.logAuditEvent(
      AuditAction.UserDeleted,
      user.id,
      correlationId,
      new Date(),
    );
  }

  private async logAuditEvent(
    action: AuditAction,
    entityId: string,
    correlationId: string,
    timestamp: Date,
  ): Promise<void> {
    const requestId = correlationId || uuidv4();
    const metadata = new Metadata();
    metadata.add('x-request-id', requestId);

    try {
      await firstValueFrom(
        this.auditService.logAction(
          {
            action,
            entity_type: AUDIT_ENTITY_USER,
            entity_id: entityId,
            request_id: requestId,
            timestamp: timestamp.toISOString(),
          },
          metadata,
        ),
      );
    } catch (error) {
      // Do not block user flow on audit failures; log context for later analysis
      console.warn('Failed to send audit log', {
        action,
        entityId,
        correlationId,
        error,
      });
    }
  }
}
