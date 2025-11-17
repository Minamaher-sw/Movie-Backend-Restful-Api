/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { userInfo } from 'os';
import { map, Observable, tap } from 'rxjs';
import { UserEntity } from '../../../moduls/user/entities/user.entity';

@Injectable()
export class RespExcludeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("RespExcludeInterceptor executed" , context.getHandler().name);
    return next.handle().pipe(map((res) => {
      if (Array.isArray(res.data)) {
        res.data = res.data.map((item: UserEntity) => {
          console.log("RespExcludeInterceptor item before exclude" , item);
          const { password , role, ...rest } = item;
          return {
            success: res.success,
            message: res.message,
            data: rest,
          };
        });
      } else {
        console.log("RespExcludeInterceptor item before exclude" , res);
        const { password, role , ...rest } = res.data;
        return {
          success: res.success,
          message: res.message,
          data: rest,
        };
      }
      return {
        success: res.success,
        message: res.message,
        data: res.data,
      };
    }));
  }
}
