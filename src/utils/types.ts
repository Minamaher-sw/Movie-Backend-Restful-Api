/* eslint-disable prettier/prettier */
import { UserRole } from "./enum";

export type AccessTokenType = {
  access_token: string;
};

export type JwtPayloadType = {
  userId: string;
  email: string;
  role: string;
};

export type JwtPayloadType2 = {
  userId: string;
  email: string;
  role: UserRole;
};