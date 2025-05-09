import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ForbiddenException,
  FileTypeValidator,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvFilterDto } from './dto/filter-cv.dto';
import { Cv } from './entities/cv.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadConfig } from 'config/upload.config';
import path from 'path';
import { RequestWithUser } from './interfaces/requestWithUser.type';
import * as fs from 'fs';

@Controller({ path: 'cv', version: '2' })
export class Cv2Controller {
  constructor(private readonly cvService: CvService) { }

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }
  @Post('withuser')
  addWithUser(@Body() createCvDto: CreateCvDto, @Req() req: RequestWithUser) {
    const userId: number = req.user.userId;
    return this.cvService.createWithUser(createCvDto, userId);
  }

  @Get()
  async findAll(@Query() query: CvFilterDto): Promise<Cv[]> {
    return query.age || query.criteria
      ? await this.cvService.findByQuery(query)
      : await this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: RequestWithUser,
  ): Promise<Cv> {
    const userId: number = req.user.userId;
    const cv = await this.cvService.findOne(id);

    if (!cv?.user.id || cv.user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce CV');
    }

    return this.cvService.update(id, updateCvDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId: number = req.user.userId;
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
      // Delete uploaded file if service operation fails
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
