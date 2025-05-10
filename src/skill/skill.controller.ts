import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) { }

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @Patch(':id')
  update(@User('id') userId, @Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.delete(+id);
  }
}
