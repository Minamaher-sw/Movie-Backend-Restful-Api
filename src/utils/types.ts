/* eslint-disable prettier/prettier */
export type AccessTokenType = {
  access_token: string;
};

export type JwtPayloadType = {
  userId: string;
  email: string;
  role: string;
};