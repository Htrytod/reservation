import {field, ID, objectType} from "@loopback/graphql";
import {Entity, hasOne, model, property} from "@loopback/repository";
import {UserCredentials} from "@loopback/authentication-jwt";

@objectType({description: 'Object representing user'})
@model({settings: {strict: false}})
export class User extends Entity {
  @field(type => ID)
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4',
  })
  id: string;

  @field()
  @property()
  email: string;

  @field()
  @property()
  name: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  constructor(data?: Partial<User>) {
    super(data);
  }
}
