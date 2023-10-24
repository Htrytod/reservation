import {AfterAll, Before, BeforeAll, setDefaultTimeout} from '@cucumber/cucumber';
import {ReservationApplication} from "../../../application";
import {Client} from "@loopback/testlab";
import {setupApplication} from "../test-helper";
import * as Process from "process";
import {Credentials, JWTService, UserManagementService} from "../../../services";
import {TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {NewUserRequest} from "../../../controllers";
import {User} from "../../../graphql-types/user-type";
import {startMongoDocker, stopMongoDocker} from "../../fixtures/mongo-docker";

export const GuestEmail = "guest-test@example.com";
export const EmployeeEmail = "employee-test@example.com";

const DEFAULT_TIMEOUT = 100000;
setDefaultTimeout(DEFAULT_TIMEOUT);

let app: ReservationApplication;
let client: Client;
let guestUser: User;
let employeeUser: User;
let guestToken: string;
let employeeToken: string;

Before({ tags: '@ignore' }, async function () {
  return 'skipped';
});

Before({ tags: '@debug' }, async function () {
  this.debug = true;
});

Before(async function () {
  this.app = app;
  this.client = client;
})

Before({ tags: '@guestLoggedIn'}, async function () {
  // jwt token
  this.token = guestToken;
  this.userId = guestUser.id;
})

Before({ tags: '@employeeLoggedIn'}, async function () {
  // jwt token
  this.token = employeeToken;
  this.userId = employeeUser.id;
  this.guestToken = guestToken;
  this.guestUserId = guestUser.id;
})

BeforeAll(async function () {
  await startMongoDocker();

  ({app, client} = await setupApplication());
  await registerUsers();
});

AfterAll(async function () {
  await app.stop();
  await stopMongoDocker();

  // FIXME: cannot stop automated because of mongodb monitor
  // const log = require('why-is-node-running') // should be your first require
  // setTimeout(function () {
  //   log() // logs out active handles that are keeping node running
  // }, 4000)
  setTimeout(function () {
    Process.exit(0)
  }, 1000);
});

async function registerUsers() {
  const userService = await app.get(UserServiceBindings.USER_SERVICE) as UserManagementService;

  const guestNewUserRequest = new NewUserRequest();
  guestNewUserRequest.email = GuestEmail;
  guestNewUserRequest.name = 'guest';
  guestNewUserRequest.password = 'password';
  guestUser = await userService.signUp(guestNewUserRequest);

  const employeeNewUserRequest = new NewUserRequest();
  employeeNewUserRequest.email = EmployeeEmail;
  employeeNewUserRequest.name = 'employee';
  employeeNewUserRequest.password = 'password';
  employeeUser = await userService.signUpEmployee(employeeNewUserRequest);

  const jwtService =  await app.get(TokenServiceBindings.TOKEN_SERVICE) as JWTService;

  guestToken = await getUserToken(userService, jwtService, {
    email: GuestEmail,
    password: 'password'
  });

  employeeToken = await getUserToken(userService, jwtService, {
    email: EmployeeEmail,
    password: 'password'
  })
}

async function getUserToken(userService: UserManagementService, jwtService: JWTService, credentials: Credentials): Promise<string> {
  const user = await userService.verifyCredentials(credentials);
  const userProfile = await userService.convertToUserProfile(user);
  return jwtService.generateToken(userProfile);
}
