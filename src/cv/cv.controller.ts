import {
  FileTypeValidator,
  ForbiddenException,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvFilterDto } from './dto/filter-cv.dto';
import { Cv } from './entities/cv.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadConfig } from 'config/upload.config';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { ConnectedUser } from '../auth/decorators/user.decorator';

import { OwnerParam } from 'src/roles/owner-param.decorator';
import { AdminGuard } from 'src/auth/admin.guard';
import { OwnershipOrAdminGuard } from 'src/roles/ownership.guard';
import { Role } from 'src/user/enums/role.enum';
import { User } from 'src/user/entities/user.entity';

@Controller({ path: 'cv', version: '1' })
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Post('withuser')
  addWithUser(
    @Body() createCvDto: CreateCvDto,
    @ConnectedUser('userId') userId: number,
  ) {
    return this.cvService.createWithUser(createCvDto, userId);
  }

  @Get()
  async findAll(
    @Query() query: CvFilterDto,
    @ConnectedUser() user: any,
  ): Promise<Cv[]> {
    return query.age || query.criteria
      ? await this.cvService.findByQuery(query)
      : await this.cvService.findAll(
          { offset: query?.offset, limit: query?.limit },
          user,
        );
  }

  @UseGuards(JwtAuthGuard, OwnershipOrAdminGuard)
  @OwnerParam('id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
    @ConnectedUser('userId') userId: number,
  ): Promise<Cv> {
    const cv = await this.cvService.findOne(+id);

    if (!cv?.user.id || cv.user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce CV');
    }

    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ConnectedUser('userId') userId: number,
  ) {
    const cv = await this.cvService.findOne(+id);

    return cv?.user.id == userId
      ? this.cvService.delete(+id)
      : new ForbiddenException('Vous ne pouvez pas supprimer ce CV');
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  async uploadPhoto(
    @Param('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png)$' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const cv = await this.cvService.findOne(id);
      if (!cv) {
        throw new NotFoundException(`CV with id ${id} not found`);
      }

      return await this.cvService.updatePhoto(id, file.filename);
    } catch (error) {
      if (file?.filename) {
        const filePath = path.join(
          process.cwd(),
          'public',
          'uploads',
          file.filename,
        );
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      throw error;
    }
  }
}
