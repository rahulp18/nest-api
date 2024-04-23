import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { ExpressRequestWithUser } from 'src/user/interfaces/express-request-with-user.interface';
import { PostsService } from './post.service';
import { Post as CPost } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';
import { IsMineGuard } from 'src/common/gaurds/is-mine.guard';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  // inject post services
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: ExpressRequestWithUser,
  ): Promise<CPost> {
    createPostDto.authorId = req.user.sub;
    return this.postsService.createPost(createPostDto);
  }
  @Public()
  @Get()
  getAllPosts(): Promise<CPost[]> {
    return this.postsService.getAllPosts();
  }
  @Public()
  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number): Promise<CPost> {
    return this.postsService.getPostsById(id);
  }
  @Patch(':id')
  @UseGuards(IsMineGuard) // <--- 💡 Prevent user from updating other user's posts
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<CPost> {
    return this.postsService.updatePost(+id, updatePostDto);
  }
  @Delete(':id')
  @UseGuards(IsMineGuard)
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.postsService.deletePost(+id);
  }
}
