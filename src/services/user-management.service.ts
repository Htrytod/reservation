import {UserService} from "@loopback/authentication";
import {repository} from "@loopback/repository";
import {UserRepository} from "../repositories";
import {HttpErrors} from "@loopback/rest";
import {compare, genSalt, hash} from "bcryptjs";
import {securityId, UserProfile} from "@loopback/security";
import {User} from "../graphql-types/user-type";
import {NewUserRequest} from "../controllers";
import _ from "lodash";

/**
 * A pre-defined type for user credentials. It assumes a user logs in using the email and password. You can modify it if your app has different credential fields
 */
export type Credentials = {
  email: string;
  password: string;
};

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      name: user.name,
      id: user.id,
      email: user.email,
      roles: user.roles,
    } as any;
  }

  async signUp(newUserRequest: NewUserRequest): Promise<User> {
    return this.signUpWithRoles(newUserRequest, ['guest']);
  }

  async signUpEmployee(newUserRequest: NewUserRequest): Promise<User> {
    return this.signUpWithRoles(newUserRequest, ['employee']);
  }

  private async signUpWithRoles(newUserRequest: NewUserRequest, roles: string[]): Promise<User> {
    const password = await hash(newUserRequest.password, await genSalt());
    newUserRequest.roles = roles;
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, ['password']),
    );
    await this.userRepository.userCredentials(savedUser.id).create({password});
    return savedUser;
  }
}