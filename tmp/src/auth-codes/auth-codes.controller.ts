import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthCodesService } from './auth-codes.service';
import { CreateAuthCodeDto } from './dto/create-auth-code.dto';
import { ConfirmAuthCodeDto } from './dto/confirm-auth-code.dto';
import { RegisterAuthCodeDto } from './dto/register-auth-codes-dto';

@Controller('auth-codes')
export class AuthCodesController {
    constructor(private readonly authCodesService: AuthCodesService) {}

    @Post()
    create(@Body() createAuthCodeDto: CreateAuthCodeDto) {
        return this.authCodesService.create(createAuthCodeDto);
    }

    @Put('confirm')
    confirm(@Body() createAuthCodeDto: ConfirmAuthCodeDto) {
        console.log('confirm auth code', createAuthCodeDto);
        return this.authCodesService.confirm(createAuthCodeDto);
    }

    @Put('register')
    register(@Body() createAuthCodeDto: RegisterAuthCodeDto) {
        return this.authCodesService.register(createAuthCodeDto);
    }
}
