/* eslint-disable prettier/prettier */

import { RatingEntity } from "src/moduls/rating/entity/rating.entity";

export class RatingListResponse {
  success: boolean;
  message: string;
  count: number;
  data: RatingEntity [];
}

export class RatingSingleResponse {
  success: boolean;
  message: string;
  data: RatingEntity;
}
