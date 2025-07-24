import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  declare email: string;

  @ApiProperty({ example: 'John Doe' })
  declare name: string;

  @ApiProperty({ example: 'SecurePass123!' })
  declare password: string;
}
