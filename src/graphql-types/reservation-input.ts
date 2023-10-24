import {field, inputType, Int} from '@loopback/graphql';
import {Reservation} from "./reservation-type";
import {model, property} from "@loopback/repository";

@inputType()
export class ReservationFilter {
    @field({nullable: true})
    @property()
    fromTime?: Date;
    @field({nullable: true})
    @property()
    toTime?: Date;
    @field({nullable: true})
    @property()
    status?: string;
    @field({nullable: true})
    @property()
    userId?: string;
}

@model()
@inputType()
export class ReservationInput {
    @field({nullable: true})
    @property()
    filter?: ReservationFilter;
    @field(type => Int)
    @property()
    offset: number = 0;
    @field(type => Int)
    @property()
    limit: number = 10;
}

@model()
@inputType()
export class CreateReservationInput implements Partial<Reservation> {
    @field()
    @property()
    contactInfo: string;
    @field()
    @property()
    expectedArrivalTime: Date;
    @field()
    @property()
    reservedTableSizeInfo: string;
    userId?: string;
}

@model()
@inputType()
export class UpdateReservationInput implements Partial<Reservation> {
    @field()
    @property()
    id: string;
    @field()
    @property()
    contactInfo: string;
    @field()
    @property()
    expectedArrivalTime: Date;
    @field()
    @property()
    reservedTableSizeInfo: string;
}
