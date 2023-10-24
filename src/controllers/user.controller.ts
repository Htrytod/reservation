import {authenticate, TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  get,
  HttpErrors,
  post,
  requestBody,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {WhereBuilder} from "@loopback/filter";
import {User} from "../graphql-types/user-type";
import {Credentials, UserManagementService, basicAuthorization} from "../services";
import {UserRepository} from "../repositories";
import {authorize} from "@loopback/authorization";

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

const NewUserSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'name', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
}

export const NewUserRequestBody = {
  description: 'The input of signup function',
  required: true,
  content: {
    'application/json': {schema: NewUserSchema},
  },
};

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserManagementService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
      currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody(NewUserRequestBody) newUserRequest: NewUserRequest,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: new WhereBuilder<User>().and(
        {email: newUserRequest.email}
      ).build()
    })
    if (user) {
      throw HttpErrors.BadRequest(
        `The user already exists.`
      )
    }
    return this.userService.signUp(newUserRequest);
  }


  @post('/signupEmployee', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  async signupEmployee(
    @requestBody(NewUserRequestBody) newUserRequest: NewUserRequest,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: new WhereBuilder<User>().and(
        {email: newUserRequest.email}
      ).build()
    })
    if (user) {
      throw HttpErrors.BadRequest(
        `The user already exists.`
      )
    }
    return this.userService.signUpEmployee(newUserRequest)
  }

}
