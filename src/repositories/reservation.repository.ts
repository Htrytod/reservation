
import {
    BindingScope,
    ContextTags,
    inject,
    injectable,
    lifeCycleObserver,
} from '@loopback/core';
import {DefaultCrudRepository, juggler, RepositoryBindings} from '@loopback/repository';
import {Reservation, ReservationStatus, CreateReservationInput, ReservationInput} from "../graphql-types";
import {plainToClass} from 'class-transformer';
import {Where, WhereBuilder} from '@loopback/filter';

@injectable({
    scope: BindingScope.SINGLETON,
    tags: {[ContextTags.NAMESPACE]: RepositoryBindings.REPOSITORIES},
})
@lifeCycleObserver('repository')
export class ReservationRepository
    extends DefaultCrudRepository<Reservation, typeof Reservation.prototype.id, {}>
{
    constructor(@inject('datasources.mongo') dataSource: juggler.DataSource) {
        super(Reservation, dataSource);
    }

    async add(data: CreateReservationInput) {
        const reservation = ReservationRepository.createReservation(data);
        return this.create(reservation);
    }

    async list(input: ReservationInput): Promise<Reservation[]> {
        const {filter, offset, limit} = input;
        const shouldApplyTimeFilter = filter?.fromTime !== undefined || filter?.toTime !== undefined;
        const shouldApplyStatusFilter = filter?.status !== undefined;
        const shouldApplyUserIdFilter = filter?.userId !== undefined;
        let where: Where<Reservation> | undefined = undefined;
        if (shouldApplyTimeFilter || shouldApplyStatusFilter) {
            const wb = new WhereBuilder<Reservation>();
            if (shouldApplyTimeFilter) {
                wb.and({expectedArrivalTime: {gte: filter?.fromTime ?? undefined, lte: filter?.toTime ?? undefined}});
            }
            if (shouldApplyStatusFilter) {
                wb.and({status: filter?.status});
            }
            if (shouldApplyUserIdFilter) {
                wb.and({userId: filter?.userId});
            }
            where = wb.build();
        }
        return this.find({where, offset, limit});
    }

    private static createReservation(reservationData: Partial<Reservation>): Reservation {
        const reservation = plainToClass(Reservation, reservationData);
        reservation.status = ReservationStatus.RESERVED;
        return reservation;
    }
}
