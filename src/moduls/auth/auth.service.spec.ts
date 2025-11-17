/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { UserEntity } from "../user/entities/user.entity";
import { SubscriptionType, UserRole } from "../../utils/enum";
import { CreateUserDto } from "../user/dto/create-user.dto";

type payloadType = {
    userId: string;
    email: string;
    role: string;
}

let users: UserEntity[] = [
    {
        user_id: "a1f2d3c4-5678-4abc-9def-111122223333",
        firstName: "Mina",
        lastName: "Maher",
        phone: "+201112345678",
        email: "mina@example.com",
        password: "hashed_password_123",
        avatar: null,
        subscriptionType: SubscriptionType.BASIC,
        role: UserRole.USER,
        isVerified: false,
        verificationToken: "verify-123",
        createdAt: new Date("2025-01-12T10:23:11Z"),
        updatedAt: new Date("2025-01-12T10:23:11Z"),
        ratings: [],
        payments: [],
        subscriptions: [],
        userCoupons: [],
    },
    {
        user_id: "b2e3f4a5-7890-4ddd-8888-222233334444",
        firstName: "John",
        lastName: "Doe",
        phone: "+201000112233",
        email: "john.doe@gmail.com",
        password: "hashed_pass_456",
        avatar: "https://cdn.example.com/avatar/john.png",
        subscriptionType: SubscriptionType.FREE,
        role: UserRole.USER,
        isVerified: true,
        verificationToken: null,
        createdAt: new Date("2025-02-01T09:00:00Z"),
        updatedAt: new Date("2025-02-12T09:00:00Z"),
        ratings: [],
        payments: [],
        subscriptions: [],
        userCoupons: [],
    },
    {
        user_id: "c3d4e5f6-9999-4aaa-aaaa-333344445555",
        firstName: "Sarah",
        lastName: "Adel",
        phone: "+201223344556",
        email: "sarah.adel@example.com",
        password: "hashed_pass_789",
        avatar: null,
        subscriptionType: SubscriptionType.FREE,
        role: UserRole.USER,
        isVerified: false,
        verificationToken: "token-987654",
        createdAt: new Date("2025-03-15T12:10:45Z"),
        updatedAt: new Date("2025-03-15T12:10:45Z"),
        ratings: [],
        payments: [],
        subscriptions: [],
        userCoupons: [],
    }
]
describe("AuthService", () => {
    let service: AuthService;
    let userService: UserService;
    let mailService: MailService;
    let jwtService: JwtService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService,
                {
                    provide: UserService,
                    useValue: {
                        register: jest.fn((userdto: CreateUserDto) => Promise.resolve({
                            userId: "a1f2d3c4-5678-4abc-9def-111122223333",
                            email: userdto.email,
                            role: UserRole.USER
                        })),
                        getCurrentUser: jest.fn((userId: string) => {
                            return users.find(user => user.user_id === userId);
                        }),
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn((payload: payloadType) => Promise.resolve("mocked_jwt_token")),
                    }
                },
                {
                    provide: MailService,
                    useValue: {
                        sendVerificationEmail: jest.fn(() => Promise.resolve(true)),
                    }
                }
            ]

        }).compile();
        service = module.get<AuthService>(AuthService);
        mailService = module.get<MailService>(MailService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should auth service be defined", () => {
        expect(service).toBeDefined();
    });
    it("should mail service be defined", () => {
        expect(mailService).toBeDefined();
    });
    it("should user service be defined", () => {
        expect(userService).toBeDefined();
    });

    describe("register", () => {
        const createUserDto: CreateUserDto = {
            firstName: "Mina",
            lastName: "Maher",
            email: "mina.maher@example.com",
            password: "StrongPass123!",
            phone: "+201112345678",
            avatar: "https://example.com/images/mina.png",
            subscriptionType: SubscriptionType.FREE,
            role: UserRole.USER,
            verificationToken: "verify-abc-123"
        }
        it("should call userService register method", async () => {
            await service.register(createUserDto);
            expect(userService.register).toHaveBeenCalled();
            expect(userService.register).toHaveBeenCalledWith(createUserDto);
        });
        it("should call userService getCurrentUser method", async () => {
            await service.register(createUserDto);
            expect(userService.getCurrentUser).toHaveBeenCalled();
            expect(userService.getCurrentUser).toHaveBeenCalledWith("a1f2d3c4-5678-4abc-9def-111122223333");
        });

        it("should call mailService sendVerificationEmail method", async () => {
            await service.register(createUserDto);
            expect(mailService.sendVerificationEmail).toHaveBeenCalled();
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                users[0].email,
                users[0].firstName,
                users[0].verificationToken
            );
        });

        it("should call jwtService signAsync method", async () => {
            await service.register(createUserDto);
            expect(jwtService.signAsync).toHaveBeenCalled();
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                {
                    userId: users[0].user_id,
                    email: "mina.maher@example.com",
                    role: users[0].role
                }
            );
        });
    });
});