import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000'],
        credentials: true,
    });


    // Global validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Slooze Food API')
        .setDescription('Food ordering application API with RBAC and country-based isolation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available on http://localhost:${port}/api`);
}
bootstrap();