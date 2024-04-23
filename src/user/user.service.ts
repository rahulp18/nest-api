import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/core/services/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './interfaces/users-login.interface';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: await hash(createUserDto.password, 10),
          name: createUserDto.name,
        },
      });
      // remove password from response
      delete newUser.password;
      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw new HttpException(error, 500);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!(await compare(loginUserDto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload: UserPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });
      const updatedUser = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserDto,
          ...(updateUserDto.password && {
            password: await hash(updateUserDto.password, 10),
          }),
        },
      });
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      // check if user not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // check if email already registered and throw error
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }

  async remove(id: number) {
    try {
      // find user by id. If not found, throw error
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      // delete user using prisma client
      await this.prisma.user.delete({
        where: { id },
      });

      return `User with id ${user.id} deleted`;
    } catch (error) {
      // check if user not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }
}
