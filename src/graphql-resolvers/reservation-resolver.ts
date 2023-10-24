import {inject, service} from '@loopback/core';
import {
  arg,
  authorized,
  fieldResolver,
  GraphQLBindings,
  mutation,
  query,
  resolver,
  ResolverData,
  ResolverInterface,
  root,
} from '@loopback/graphql';
import {repository} from '@loopback/repository';
import {Reservation} from "../graphql-types";
import {ReservationRepository} from "../repositories";
import {ReservationService} from "../services";
import {
  CreateReservationInput,
  ReservationInput,
  UpdateReservationInput
} from "../graphql-types";
import {AuthenticationError} from "apollo-server-express";
import {UserRepository} from "../repositories";

@resolver(of => Reservation)
export class ReservationResolver implements ResolverInterface<Reservation> {
  constructor(
    @repository(ReservationRepository)
    private readonly reservationRepo: ReservationRepository,
    @repository(UserRepository)
    private readonly userRepo: UserRepository,
    @service(ReservationService)
    private readonly reservationService: ReservationService,
    @inject(GraphQLBindings.RESOLVER_DATA)
    private resolverData: ResolverData,
  ) {
  }

  @query(returns => Reservation, {nullable: true})
  @authorized('employee')
  async reservation(@arg('reservationId') reservationId: string): Promise<Reservation> {
    return this.reservationRepo.findById(reservationId);
  }

  @query(returns => [Reservation])
  @authorized('')
  async reservations(@arg('input') input: ReservationInput): Promise<Reservation[]> {
    if(!this.isEmployee()) {
      input.filter = input.filter ?? {};
      input.filter.userId = this.getUserId();
    }
    return this.reservationRepo.list(input);
  }

  @mutation(returns => Reservation)
  @authorized('guest')
  async addReservation(@arg('reservation') reservation: CreateReservationInput): Promise<Reservation> {
    reservation.userId = this.getUserId();
    return await this.reservationRepo.add(reservation);
  }

  @mutation(returns => Reservation)
  @authorized()
  async updateReservation(@arg('reservation') reservationInput: UpdateReservationInput): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(reservationInput.id);
    this.checkEmployeeOrOwner(reservation);
    return this.reservationService.update(reservation, reservationInput);
  }

  @mutation(returns => Reservation)
  @authorized()
  async cancelReservation(@arg('reservationId') reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(reservationId);
    this.checkEmployeeOrOwner(reservation);
    return this.reservationService.cancel(reservation);
  }

  @mutation(returns => Reservation)
  @authorized('employee')
  async completeReservation(@arg('reservationId') reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(reservationId);
    return this.reservationService.complete(reservation);
  }

  @fieldResolver()
  async guestName(@root() reservation: Reservation): Promise<string> {
    return this.userRepo.findById(reservation.userId).then(v => v.name);
  }

  private getUserId(): string | undefined {
    const {user} = (this.resolverData.context as any);
    return user?.id;
  }

  private isEmployee() {
    const {user} = (this.resolverData.context as any);
    return user?.roles?.findIndex((v: string) => v === 'employee') >= 0;
  }

  private checkEmployeeOrOwner(reservation: Reservation) {
    const {user} = (this.resolverData.context as any);
    const isEmployee = user?.roles?.findIndex((v: string) => v === 'employee') >= 0;
    if (!isEmployee) {
      const userId = user?.id;
      if(!userId) {
        throw new AuthenticationError('Unauthorized');
      }
      if(!(reservation.userId === userId)) {
        throw new AuthenticationError('Unauthorized');
      }
    }
  }
}
