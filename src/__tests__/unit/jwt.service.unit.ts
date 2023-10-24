import {JWTService} from "../../services";
import {expect} from "@loopback/testlab";
import {randomUUID} from "crypto";
import {securityId, UserProfile} from "@loopback/security";


describe('JWTService unit tests', () => {

  it('generate and verify token', async () => {
    // create jwt service
    const jwtService = new JWTService("jwtSecret", "21600");
    const id = randomUUID();
    const userProfile: UserProfile = {
      [securityId]: id,
      id,
      name: 'Lin',
      roles: ['role1', 'role2']
    } as UserProfile;
    // 1. generate token
    const token = await jwtService.generateToken(userProfile)
    expect(token).not.null();
    // 2. verify token
    const userProfileVerified = await jwtService.verifyToken(token);
    expect(userProfileVerified).to.eql(userProfile)
  })

})
