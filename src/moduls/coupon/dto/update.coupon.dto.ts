/* eslint-disable prettier/prettier */
import { CreateCouponDto } from "./create.coupon.dot";
import { PartialType } from "@nestjs/mapped-types";
export class UpdateCouponDto extends PartialType(CreateCouponDto) {}