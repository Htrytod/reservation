import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {GraphQLBindings, GraphQLComponent} from '@loopback/graphql';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {MongoDataSource} from "./datasources";
import {AuthenticationComponent} from "@loopback/authentication";
import {JWTAuthenticationComponent, TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {AuthorizationComponent} from "@loopback/authorization";
import {UserManagementService, JWTService} from "./services";
import {AuthenticationError} from 'apollo-server-express';

export {ApplicationConfig};

export class ReservationApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);
    // Bind datasource
    this.dataSource(MongoDataSource, UserServiceBindings.DATASOURCE_NAME);

    this.component(GraphQLComponent);
    const server = this.getSync(GraphQLBindings.GRAPHQL_SERVER);

    this.expressMiddleware('middleware.express.GraphQL', server.expressApp);

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserManagementService);

    // It's possible to register a graphql auth checker
    this.bind(GraphQLBindings.GRAPHQL_AUTH_CHECKER).to(
        async (resolverData, roles) => {
          // Use resolverData and roles for authorization
          const jwtService = this.getSync<JWTService>(TokenServiceBindings.TOKEN_SERVICE);
          const token = (resolverData.context as any).req.headers['authorization'];
          if(!token) {
            throw new AuthenticationError('Unauthorized')
          }
          const userProfile = await jwtService.verifyToken(token);
          (resolverData.context as any).user = userProfile;
          if(!roles || roles.length == 0) {
            return true;
          }
          for (let role of roles) {
            if(userProfile?.roles.findIndex((r: string) => r === role) < 0) {
              throw new AuthenticationError(`Unauthorized`);
            }
          }
          return true;
        },
    );

    // It's possible to register a graphql context resolver
    this.bind(GraphQLBindings.GRAPHQL_CONTEXT_RESOLVER).to(context => {
      return {...context};
    });

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
