import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClientGrpc } from '@nestjs/microservices';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

interface AuditService {
  logAction(data: any): any;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private auditService: AuditService;

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @Inject('AUDIT_SERVICE') private auditClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.auditService = this.auditClient.getService<AuditService>('AuditService');
  }

  async create(createUserDto: CreateUserDto, correlationId: string): Promise<User> {
    const user = await this.userModel.create(createUserDto as any);
    
    // Send audit event (stub for now)
    // TODO: Implement proper audit logging after audit service is ready
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto, correlationId: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.update(updateUserDto as any);
      
      // Send audit event (stub)
      // TODO: Implement audit logging
    }
    return user;
  }

  async remove(id: string, correlationId: string): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.destroy(); // Soft delete
      
      // Send audit event (stub)
      // TODO: Implement audit logging
    }
  }
}
