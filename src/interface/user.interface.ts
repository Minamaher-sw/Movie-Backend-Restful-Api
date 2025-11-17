/* eslint-disable prettier/prettier */

import { UserEntity } from "../moduls/user/entities/user.entity";


export interface UserListResponse {
  success: boolean;
  message: string;
  count: number;
  users: UserEntity[];
}

export interface UserSingleResponse {
  success: boolean;
  message: string;
  user: UserEntity;
}
