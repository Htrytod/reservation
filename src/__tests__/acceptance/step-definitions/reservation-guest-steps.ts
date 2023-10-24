import {Given, Then, When} from '@cucumber/cucumber'
import {Client, expect} from "@loopback/testlab";
import {Reservation, ReservationStatus} from "../../../graphql-types";


When(/^I add a reservation:(.*),(.*),(.*)$/, async function (
  contactInfo: string, expectedArrivalTime: string, reservedTableSizeInfo: string) {
  const client = (this.client) as Client;

  await addReservation(this, client, contactInfo, expectedArrivalTime, reservedTableSizeInfo);

  this.input = {
    contactInfo,
    expectedArrivalTime,
    reservedTableSizeInfo,
  }
});

Then(/^I find the reservation$/, async function () {
  const client = (this.client) as Client;

  const list: Reservation[] = (await client.get(`/reservations/list/${this.userId}`)
    .set('Authorization', 'Bearer ' + this.token)
    .query({
      input: {
        offset: 0,
        limit: 100,
      }
    })
    .expect(200)).body;

  expect(list.map(v => {
    return {
      contactInfo: v.contactInfo,
      expectedArrivalTime: v.expectedArrivalTime,
      reservedTableSizeInfo: v.reservedTableSizeInfo,
    }
  })).to.containEql(this.input)
});


Given(/^I have added a reservation$/, async function () {
  const client = (this.client) as Client;
  this.reservation = await addReservation(this, client, '13011111111', '2023-10-24T12:00:00.000Z', '2');
});

Then(/^I update my reservation$/, async function () {
  const client = (this.client) as Client;

  await client.put(`/reservations/${this.userId}`)
    .set('Authorization', 'Bearer ' + this.token)
    .send({
      id: this.reservation.id,
      contactInfo: '13011111111',
      expectedArrivalTime: '2023-10-24T12:00:00.000Z',
      reservedTableSizeInfo: '3',
    })
    .expect(200);
});

Then(/^I cancel my reservation$/, async function () {
  const client = (this.client) as Client;

  await client.put(`/reservations/cancel/${this.userId}/${this.reservation.id}`)
    .set('Authorization', 'Bearer ' + this.token)
    .send()
    .expect(200);
});


Given(/^guest have added a reservation$/, async function () {
  const client = (this.client) as Client;
  this.reservation = await guestAddReservation(this, client, '13011111111', '2023-10-24T12:00:00.000Z', '2');
});

Then(/^I update the reservation$/, async function () {
  const client = (this.client) as Client;

  await client.put(`/reservations`)
    .set('Authorization', 'Bearer ' + this.token)
    .send({
      id: this.reservation.id,
      contactInfo: '13011111111',
      expectedArrivalTime: '2023-10-24T12:00:00.000Z',
      reservedTableSizeInfo: '3',
    })
    .expect(200);
});

Then(/^I make the reservation as (.*)$/, async function (status: string) {
  const client = (this.client) as Client;

  if(status === ReservationStatus.COMPLETED) {
    await client.put(`/reservations/complete/${this.reservation.id}`)
      .set('Authorization', 'Bearer ' + this.token)
      .send()
      .expect(200);
  } else if(status === ReservationStatus.CANCELED) {
    await client.put(`/reservations/cancel/${this.reservation.id}`)
      .set('Authorization', 'Bearer ' + this.token)
      .send()
      .expect(200);
  }
});

Given(/^guest have added some reservations$/, async function () {
  const client = (this.client) as Client;
  this.reservation1 = await guestAddReservation(this, client, '13022222222', '2023-10-24T12:00:00.000Z', '2');
  this.reservation2 = await guestAddReservation(this, client, '13033333333', '2023-10-24T12:00:00.000Z', '4');
});

Then(/^I browse the reservations$/, async function () {
  const client = (this.client) as Client;
  const list: Reservation[] = (await client.get(`/reservations/list`)
    .set('Authorization', 'Bearer ' + this.token)
    .query({
      input: {
        offset: 0,
        limit: 100,
      }
    })
    .expect(200)).body;
  expect(list).to.containEql(this.reservation1);
  expect(list).to.containEql(this.reservation2);
});

Then(/^I check the reservation detail$/, async function () {
  const client = (this.client) as Client;
  const reservation: Reservation = (await client.get(`/reservations/${this.reservation.id}`)
    .set('Authorization', 'Bearer ' + this.token)
    .send()
    .expect(200)).body;
  expect(reservation).to.eql(this.reservation);
});

async function addReservation(
  world: any,
  client: Client,
  contactInfo: string,
  expectedArrivalTime: string,
  reservedTableSizeInfo: string): Promise<Reservation> {
  return (await client.post(`/reservations/${world.userId}`)
    .set('Authorization', 'Bearer ' + world.token)
    .send({
      contactInfo,
      expectedArrivalTime,
      reservedTableSizeInfo
    })
    .expect(200)).body;
}

async function guestAddReservation(
  world: any,
  client: Client,
  contactInfo: string,
  expectedArrivalTime: string,
  reservedTableSizeInfo: string
) {
  return (await client.post(`/reservations/${world.guestUserId}`)
    .set('Authorization', 'Bearer ' + world.guestToken)
    .send({
      contactInfo,
      expectedArrivalTime,
      reservedTableSizeInfo
    })
    .expect(200)).body;
}
