import * as jwt from 'jsonwebtoken';
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { isPASTokenDto, TokenDTO } from './token-data.dto';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private configService: ConfigService
    ) {}

    private async validateRequest(
        request: Request & { tokenData?: TokenDTO },
        tokenOwnerType?: 'restaurant' | 'courier'
    ) {
        const authHeader = request.headers.authorization || '';
        const tokenRegexp = /^Bearer (\S+)$/i;
        const [, token] = authHeader.match(tokenRegexp) || ['', ''];
        if (token) {
            const decodedToken = jwt.decode(token, this.configService.getOrThrow('JWT_SECRET'));
            if (decodedToken && isPASTokenDto(decodedToken) && decodedToken.role === tokenOwnerType) {
                request.tokenData = { ...decodedToken, id: +decodedToken.id } as TokenDTO;
                return true;
            }
        }
        return false;
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        const tokenOwnerType = this.reflector.get<TokenDTO['role'] | undefined>(TOKEN_OWNER_TYPE, context.getHandler());
        return this.validateRequest(request, tokenOwnerType);
    }
}

export const TOKEN_OWNER_TYPE = 'TOKEN_OWNER_TYPE';
export const RestaurantToken = () => {
    return SetMetadata(TOKEN_OWNER_TYPE, 'restaurant');
};
export const CourierToken = () => {
    return SetMetadata(TOKEN_OWNER_TYPE, 'courier');
};
