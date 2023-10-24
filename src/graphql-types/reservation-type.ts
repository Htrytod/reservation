import {Entity, model, property} from "@loopback/repository";
import {field, ID, objectType} from "@loopback/graphql";

@objectType({description: 'Object representing reservation'})
@model({settings: {strict: false}})
export class Reservation extends Entity {
  @field(type => ID)
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4',
  })
  id: string;

  @property()
  userId: string;

  @field()
  guestName: string;

  @field()
  @property()
  contactInfo: string;

  @field()
  @property()
  expectedArrivalTime: Date;

  @field()
  @property()
  reservedTableSizeInfo: string;

  @field()
  @property()
  status: string;

  constructor(data?: Partial<Reservation>) {
    super(data);
  }
}

export enum ReservationStatus {
  RESERVED = "reserved",
  COMPLETED = "completed",
  CANCELED = "canceled",
}