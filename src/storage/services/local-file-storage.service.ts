import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'multer';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  FileStorageInterface,
  FileUploadResult,
  SupportedFileTypes,
} from '../interfaces/file-storage.interface';

@Injectable()
export class LocalFileStorageService
  implements FileStorageInterface, OnModuleInit
{
  private readonly uploadPath: string;
  private readonly baseUrl: string;
  private readonly maxFileSize: number;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath =
      this.configService.get<string>('UPLOAD_PATH') || './uploads';
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    this.maxFileSize =
      this.configService.get<number>('MAX_FILE_SIZE') || 10485760;
  }

  async onModuleInit(): Promise<void> {
    // This guarantees the directory exists before handling requests.
    await fs.mkdir(this.uploadPath, { recursive: true });
  }

  async uploadFile(
    file: Express.Multer.File,
    destination?: string,
  ): Promise<FileUploadResult> {
    await this.validateFile(file);

    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const uploadDir = destination
      ? path.join(this.uploadPath, destination)
      : this.uploadPath;
    const filePath = path.join(uploadDir, filename);

    // Ensure destination directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      url: this.getFileUrl(filename, destination),
    };
  }

  async deleteFile(filename: string, destination?: string): Promise<void> {
    const uploadDir = destination
      ? path.join(this.uploadPath, destination)
      : this.uploadPath;
    const filePath = path.join(uploadDir, filename);

    await fs.rm(filePath, { force: true });
  }

  getFileUrl(filename: string, destination?: string): string {
    return new URL(
      destination
        ? `uploads/${destination}/${filename}`
        : `uploads/${filename}`,
      this.baseUrl,
    ).toString();
  }

  async validateFile(file: Express.Multer.File): Promise<boolean> {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check file type
    const supportedTypes = Object.values(SupportedFileTypes);
    if (!supportedTypes.includes(file.mimetype as SupportedFileTypes)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not supported`,
      );
    }

    // Additional validation for specific file types
    await this.validateSpecificFileType(file);

    return true;
  }

  private async validateSpecificFileType(
    file: Express.Multer.File,
  ): Promise<void> {
    // Image validation
    if (file.mimetype.startsWith('image/')) {
      // We will add image-specific validation here later (dimensions, etc.)
      return Promise.resolve();
    }

    // Video validation
    if (file.mimetype.startsWith('video/')) {
      // We will add video-specific validation here later (duration, codec, etc.)
      return Promise.resolve();
    }

    // Document validation
    if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
      // We will add document-specific validation here later
      return Promise.resolve();
    }
  }
}
