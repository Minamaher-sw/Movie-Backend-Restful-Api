/* eslint-disable prettier/prettier */

import { RatingEntity } from "../moduls/rating/entity/rating.entity";

export class RatingListResponse {
  success: boolean;
  message: string;
  total: number;
  pages: number;
  data: RatingEntity [];
}

export class RatingSingleResponse {
  success: boolean;
  message: string;
  data: RatingEntity;
}
