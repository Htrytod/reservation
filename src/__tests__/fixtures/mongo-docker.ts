import {GenericContainer, StartedTestContainer} from 'testcontainers';

async function startMongoDB() {

  const container = await new GenericContainer('mongo')
    .withName('mongodb_lb4_reservation_test')
    .withExposedPorts(27017)
    .start();
  process.env.RESERVATION_APP_MONGODB_SERVICE_HOST = container.getHost();
  process.env.RESERVATION_APP_MONGODB_SERVICE_PORT = container
    .getMappedPort(27017)
    .toString();
  return container;
}

let mongo: StartedTestContainer;

export const startMongoDocker = async function () {
  // Skip it for CI as there are services for mongodb
  if (process.env.CI) return;
  process.env.KUBERNETES_SERVICE_HOST = 'localhost';
  mongo = await startMongoDB();
}

export const stopMongoDocker = async function () {
  if (process.env.CI) return;
  if (mongo) await mongo.stop();
}

