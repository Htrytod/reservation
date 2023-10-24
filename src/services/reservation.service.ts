import {asService, injectable} from '@loopback/core';
import {Reservation, ReservationStatus} from '../graphql-types';
import {UpdateReservationInput} from "../graphql-types";
import {repository} from "@loopback/repository";
import {ReservationRepository} from "../repositories";
import {UserInputError} from "apollo-server-express";

@injectable(asService(ReservationService))
export class ReservationService {
  constructor(
    @repository(ReservationRepository)
    private readonly reservationRepo: ReservationRepository,
  ) {
  }

  async update(reservation: Reservation,reservationInput: UpdateReservationInput): Promise<Reservation> {
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new UserInputError("Only reservation with reserved status can be updated.");
    }
    reservation.contactInfo = reservationInput.contactInfo;
    reservation.expectedArrivalTime = reservationInput.expectedArrivalTime;
    reservation.reservedTableSizeInfo = reservationInput.reservedTableSizeInfo;
    await this.reservationRepo.update(reservation);
    return reservation;
  }

  async cancel(reservation: Reservation): Promise<Reservation> {
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new UserInputError("Only reservation with reserved status can be cancelled.");
    }
    reservation.status = ReservationStatus.CANCELED;
    await this.reservationRepo.update(reservation);
    return reservation;
  }

  async complete(reservation: Reservation): Promise<Reservation> {
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new UserInputError("Only reservation with reserved status can be completed.");
    }
    reservation.status = ReservationStatus.COMPLETED;
    await this.reservationRepo.update(reservation);
    return reservation;
  }


}
