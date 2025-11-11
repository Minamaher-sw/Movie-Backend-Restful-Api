/* eslint-disable prettier/prettier */
export enum PeopleRole {
  ACTOR = 'ACTOR',
  DIRECTOR = 'DIRECTOR',
  WRITER = 'WRITER',
  PRODUCER = 'PRODUCER',
}
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum SubscriptionType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  WALLET = 'WALLET',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}