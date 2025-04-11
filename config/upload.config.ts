import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export const uploadConfig = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (req: any, file, callback) => {
      const cvId = req.params.id;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `cv_${cvId}_${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    req: Request,
    file: MulterFile,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(
        new HttpException(
          'Only jpg, jpeg and png files are allowed!',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
};
