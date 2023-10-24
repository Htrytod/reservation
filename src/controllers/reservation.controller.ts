import {service} from "@loopback/core";
import {get, getModelSchemaRef, param, getFilterSchemaFor, post, requestBody, put} from "@loopback/rest";
import {authorize} from "@loopback/authorization";
import {basicAuthorization, ReservationService} from "../services";
import {repository, Filter} from "@loopback/repository";
import {ReservationRepository} from "../repositories";
import {Reservation, CreateReservationInput, ReservationInput, UpdateReservationInput} from "../graphql-types";
import {OPERATION_SECURITY_SPEC} from "../utils";
import {authenticate} from "@loopback/authentication";
import {AuthenticationError} from "apollo-server-express";

export class ReservationController {
  constructor(
    @repository(ReservationRepository)
    private readonly reservationRepo: ReservationRepository,
    @service(ReservationService)
    private readonly reservationService: ReservationService,
  ) {
  }

  @get('/reservations/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['employee'], voters: [basicAuthorization]})
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Reservation)) filter?: Filter<Reservation>,
  ): Promise<Reservation> {
    return this.reservationRepo.findById(id, filter);
  }

  @get('/reservations/list', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['employee'], voters: [basicAuthorization]})
  async list(
    @param.query.object('input',) input: ReservationInput,
    @param.query.object('filter', getFilterSchemaFor(Reservation)) filter?: Filter<Reservation>,
  ) {
    return this.reservationRepo.list(input)
  }

  @get('/reservations/list/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['guest'], voters: [basicAuthorization]})
  async listByGuest(
    @param.path.string('userId') userId: string,
    @param.query.object('input',) input: ReservationInput,
    @param.query.object('filter', getFilterSchemaFor(Reservation)) filter?: Filter<Reservation>,
  ) {
    input.filter = input.filter ?? {};
    input.filter.userId = userId;
    return this.reservationRepo.list(input)
  }

  @post('/reservations/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['guest'], voters: [basicAuthorization]})
  async add(
    @param.path.string('userId') userId: string,
    @requestBody({
      description: 'reservation',
      content: {'application/json': {schema: getModelSchemaRef(CreateReservationInput)}}
    })
      reservation: CreateReservationInput,
  ) {
    reservation.userId = userId;
    return await this.reservationRepo.add(reservation);
  }

  @put('/reservations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['employee'], voters: [basicAuthorization]})
  async update(
    @requestBody({
      description: 'reservation',
      content: {'application/json': {schema: getModelSchemaRef(UpdateReservationInput)}}
    }) reservationInput: UpdateReservationInput,
  ) {
    const reservation = await this.reservationRepo.findById(reservationInput.id);
    return this.reservationService.update(reservation, reservationInput);
  }

  @put('/reservations/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['guest'], voters: [basicAuthorization]})
  async updateByGuest(
    @param.path.string('userId') userId: string,
    @requestBody({
      description: 'reservation',
      content: {'application/json': {schema: getModelSchemaRef(UpdateReservationInput)}}
    }) reservationInput: UpdateReservationInput,
  ) {
    const reservation = await this.reservationRepo.findById(reservationInput.id);
    if (!(reservation.userId === userId)) {
      throw new AuthenticationError('Unauthorized');
    }
    return this.reservationService.update(reservation, reservationInput);
  }

  @put('/reservations/cancel/{reservationId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['employee'], voters: [basicAuthorization]})
  async cancel(
    @param.path.string('reservationId') reservationId: string
  ) {
    const reservation = await this.reservationRepo.findById(reservationId);
    return this.reservationService.cancel(reservation);
  }

  @put('/reservations/cancel/{userId}/{reservationId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['guest'], voters: [basicAuthorization]})
  async cancelByGuest(
    @param.path.string('userId') userId: string,
    @param.path.string('reservationId') reservationId: string
  ) {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!(reservation.userId === userId)) {
      throw new AuthenticationError('Unauthorized');
    }
    return this.reservationService.cancel(reservation);
  }

  @put('/reservations/complete/{reservationId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Reservation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reservation),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['employee'], voters: [basicAuthorization]})
  async complete(
    @param.path.string('reservationId') reservationId: string
  ) {
    const reservation = await this.reservationRepo.findById(reservationId);
    return this.reservationService.complete(reservation);
  }
}


