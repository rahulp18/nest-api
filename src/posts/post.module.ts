import { Module } from '@nestjs/common';
import { PostsController } from './post.controller';
import { PostsService } from './post.service';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
