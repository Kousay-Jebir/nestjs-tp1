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
import { User as ConnectedUser } from '../auth/decorators/user.decorator';
import { OwnerParam } from 'src/roles/owner-param.decorator';
import { OwnershipOrAdminGuard } from 'src/roles/ownership.guard';
import { Role } from 'src/user/enums/role.enum';
import { UserService } from 'src/user/user.service';

@Controller({ path: 'cv', version: '1' })
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Post('withuser')
  addWithUser(@Body() createCvDto: CreateCvDto, @ConnectedUser() user: any) {
    return this.cvService.createWithUser(createCvDto, user.userId);
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
    @ConnectedUser() user: any,
  ): Promise<Cv> {
    const cv = await this.cvService.findOne(+id);

    if (!cv?.user.id || cv.user.id !== user.userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce CV');
    }

    const userEntity = await this.userService.findOne(user.userId);
    if (!userEntity) {
      throw new NotFoundException(`User with id ${user.userId} not found`);
    }
    return this.cvService.updateWithUser(+id, updateCvDto, userEntity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @ConnectedUser() user: any) {
    const cv = await this.cvService.findOne(+id);

    if (!cv?.user.id || cv.user.id !== user.userId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce CV');
    }

    const userEntity = await this.userService.findOne(user.userId);
    if (!userEntity) {
      throw new NotFoundException(`User with id ${user.userId} not found`);
    }
    return this.cvService.deleteWithUser(+id, userEntity);
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
    @ConnectedUser() user: any,
  ) {
    try {
      const cv = await this.cvService.findOne(id);
      if (!cv) {
        throw new NotFoundException(`CV with id ${id} not found`);
      }

      // Comparez les valeurs après conversion en nombre pour être sûr
      if (
        Number(cv.user.id) !== Number(user.userId) &&
        user.role !== Role.ADMIN
      ) {
        throw new ForbiddenException('Vous ne pouvez pas modifier ce CV');
      }

      // Récupérer l'entité User complète comme dans la méthode update
      const userEntity = await this.userService.findOne(user.userId);
      if (!userEntity) {
        throw new NotFoundException(`User with id ${user.userId} not found`);
      }

      return await this.cvService.updatePhoto(id, file.filename, userEntity);
    } catch (error) {
      // Gestion des erreurs...
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
