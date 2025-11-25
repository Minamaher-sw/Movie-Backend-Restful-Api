/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from "typeorm"
import { CouponEntity } from "../src/moduls/coupon/entity/coupon.entity"
import { GenreEntity } from "../src/moduls/geners/entity/genre.entity"
import { MoviePeopleEntity } from "../src/moduls/movie-people/entity/movie_people.entity"
import { MovieEntity } from "../src/moduls/movie/entity/movie.entity"
import { PaymentEntity } from "../src/moduls/payment/entity/payment.entity"
import { PeopleEntity } from "../src/moduls/people/entity/people.entity"
import { RatingEntity } from "../src/moduls/rating/entity/rating.entity"
import { SubscriptionPlanEntity } from "../src/moduls/subscription-plan/entity/subscription-plan.entity"
import { SubscriptionEntity } from "../src/moduls/subscription/entity/subscription.entity"
import { UserCouponsEntity } from "../src/moduls/user-coupon/entity/user_coupons.entity"
import { UserEntity } from "../src/moduls/user/entities/user.entity"
import { config } from "dotenv";
config({ path: ".env" });

function testConnection() {
    console.log("✅ MySQL Connected successfully!",process.env.DB_URI);
    console.log(process.env.DB_PASS)
}

testConnection();
export const dataSourceOptions:DataSourceOptions ={
    type:"mysql",
    url:process.env.DB_URI,
    synchronize:false,
    entities: [
                UserEntity,
                MovieEntity,
                GenreEntity,
                PeopleEntity,
                MoviePeopleEntity,
                SubscriptionEntity,
                PaymentEntity,
                CouponEntity,
                SubscriptionPlanEntity,
                UserCouponsEntity,
                RatingEntity,
            ],
    migrations:["dist/db/migrations/*.js"]
}

const dataSource = new DataSource(dataSourceOptions) ;
export default dataSource ;