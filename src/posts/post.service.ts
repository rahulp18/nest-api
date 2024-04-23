import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const newPost = await this.prisma.post.create({
        data: {
          ...createPostDto,
        },
      });
      return newPost;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Author not found');
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }
  async getAllPosts(): Promise<Post[]> {
    const posts = await this.prisma.post.findMany();
    return posts;
  }
  async getPostsById(id: number): Promise<Post> {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id,
        },
      });
      return post;
    } catch (error) {
      // check if post not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post with id ${id} not found`);
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }
  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      await this.prisma.post.findUniqueOrThrow({
        where: {
          id,
        },
      });
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          ...updatePostDto,
        },
      });
      return updatedPost;
    } catch (error) {
      // check if post not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post with id ${id} not found`);
      }

      // check if email already registered and throw error
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }
  async deletePost(id: number): Promise<string> {
    try {
      const post = await this.prisma.post.findUniqueOrThrow({ where: { id } });
      await this.prisma.post.delete({
        where: { id },
      });
      return `Post with id ${post.id} deleted`;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post with id ${id} not found`);
      }

      // throw error if any
      throw new HttpException(error, 500);
    }
  }
}
