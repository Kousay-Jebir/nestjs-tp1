import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ForbiddenException } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvFilterDto } from './dto/filter-cv.dto';
import { Cv } from './entities/cv.entity';
@Controller({path:'cv',version:'2'})
export class Cv2Controller {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }
  @Post('withuser')
  addWithUser(@Body() createCvDto : CreateCvDto,@Req() req : any){
    const userId = req.user.userId
    return this.cvService.createWithUser(createCvDto,userId)

  }

  @Get()
  async findAll(@Query() query : CvFilterDto):Promise<Cv[]> {
   
    return query.age || query.criteria ? await this.cvService.findByQuery(query):await this.cvService.findAll();

    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCvDto: UpdateCvDto,@Req() req : any) {
    const userId = req.user.userId
    const cv = await this.cvService.findOne(+id)
    
  return cv?.user.id==userId ? await this.cvService.update(+id, updateCvDto) : new ForbiddenException("Vous ne pouvez pas modifier ce CV");
    
  }

  @Delete(':id')
  async remove(@Param('id') id: string,@Req() req : any) {
    const userId = req.user.userId
    const cv = await this.cvService.findOne(+id)
    
  return cv?.user.id==userId ? this.cvService.delete(+id) : new ForbiddenException("Vous ne pouvez pas supprimer ce CV");

     
  }

}
