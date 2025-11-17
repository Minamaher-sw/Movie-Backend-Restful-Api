/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CURRENT_USER_kEY } from "../../../utils/constants";

export const CurrentUser = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user = request[CURRENT_USER_kEY];
  return user;
});
