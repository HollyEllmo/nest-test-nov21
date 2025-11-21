import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

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

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    correlationId: string,
  ): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.update(updateUserDto as any);
      await this.logAuditEvent(
        AuditAction.UserUpdated,
        user.id,
        correlationId,
        user.updatedAt,
      );
    }
    return user;
  }

  async remove(id: string, correlationId: string): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.destroy(); // Soft delete
      await this.logAuditEvent(
        AuditAction.UserDeleted,
        user.id,
        correlationId,
        new Date(),
      );
    }
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
