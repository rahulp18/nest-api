import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { ExpressRequestWithUser } from './interfaces/express-request-with-user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import { IsMineGuard } from 'src/common/gaurds/is-mine.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Public()
  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }
  @Public()
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  me(@Request() req: ExpressRequestWithUser) {
    return req.user;
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(IsMineGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(IsMineGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
