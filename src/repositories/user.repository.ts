import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  juggler,
  repository,
  RepositoryBindings
} from "@loopback/repository";
import {
  BindingScope,
  ContextTags,
  Getter,
  inject,
  injectable,
  lifeCycleObserver,
  LifeCycleObserver
} from "@loopback/core";
import {
  UserCredentials,
  UserCredentialsRepository,
  UserRelations,
  UserServiceBindings
} from "@loopback/authentication-jwt";
import {User} from "../graphql-types/user-type";
import {WhereBuilder} from "@loopback/filter";
import {genSalt, hash} from "bcryptjs";
import _ from "lodash";

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.NAMESPACE]: RepositoryBindings.REPOSITORIES},
})
@lifeCycleObserver('repository')
export class UserRepository
  extends DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  implements LifeCycleObserver {
  public readonly userCredentials: HasOneRepositoryFactory<UserCredentials,
    typeof User.prototype.id>;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
      dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter as any,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
  }

  async start() {
    // FIXME: only for easy test
    const admin = {
      email: 'administrator@example.com',
      name: 'admin',
      password: 'password',
      roles: ['admin']
    }
    const guest = {
      email: 'guest@example.com',
      name: 'guest',
      password: 'password',
      role: ['guest']
    }
    const employee = {
      email: 'employee@example.com',
      name: 'employee',
      password: 'password',
      role: ['employee']
    }
    const adminUser = await this.findOne({
      where: new WhereBuilder<User>().and(
        {email: admin.email}
      ).build()
    })
    const guestUser = await this.findOne({
      where: new WhereBuilder<User>().and(
        {email: guest.email}
      ).build()
    })
    const employeeUser = await this.findOne({
      where: new WhereBuilder<User>().and(
        {email: employee.email}
      ).build()
    })
    if (!adminUser) {
      const password = await hash("password", await genSalt());
      const savedUser = await this.create(
        _.omit(admin, ['password']),
      );
      await this.userCredentials(savedUser.id).create({password});
    }
    if(!guestUser) {
      const password = await hash("password", await genSalt());
      const savedUser = await this.create(
        _.omit(guest, ['password']),
      );
      await this.userCredentials(savedUser.id).create({password});
    }
    if(!employeeUser) {
      const password = await hash("password", await genSalt());
      const savedUser = await this.create(
        _.omit(employee, ['password']),
      );
      await this.userCredentials(savedUser.id).create({password});
    }
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    return this.userCredentials(userId)
      .get()
      .catch(err => {
        if (err.code === 'ENTITY_NOT_FOUND') return undefined;
        throw err;
      });
  }
}