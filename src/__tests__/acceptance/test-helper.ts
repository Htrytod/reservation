import {ReservationApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {GraphQLServerOptions} from "@loopback/graphql";

export async function setupApplication(): Promise<AppWithClient> {
  const graphqlConfig: GraphQLServerOptions = {
    asMiddlewareOnly: true,
  };
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });
  const config = {
    rest: restConfig,
    graphql: graphqlConfig
  }

  const app = new ReservationApplication(config);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: ReservationApplication;
  client: Client;
}
