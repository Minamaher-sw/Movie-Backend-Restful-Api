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
  FAMILY = 'FAMILY',
  STANDARD = 'STANDARD',
  STUDENT = 'STUDENT',
  LITE="LITE"
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
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

export enum StreamingQuality {
  SD = 'SD',
  HD = 'HD',
  FULL_HD = 'FULL_HD',
  UHD_4K = 'UHD_4K',
}