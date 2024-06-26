import { SQLWrapper, and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { ctx } from "../ctx";
import { Booking, CreateBookingRequest, ListBookingRequest, Search, UpdateBookingRequest } from "../types/booking.types";
const bookingTable = ctx.schema.booking;
const customerTable = ctx.schema.customer;
const roomTable = ctx.schema.room;

const bookingValues = {
  id: bookingTable.id,
  customerEmail: bookingTable.customerEmail,
  startDate: bookingTable.startDate,
  endDate: bookingTable.endDate,
  status: bookingTable.status,
  createdAt: bookingTable.createdAt,
  roomNo: bookingTable.roomNo,
  amount: bookingTable.amount,
};

const createBooking = async ({
  customerEmail,
  endDate,
  roomNo,
  startDate,
  amount,
}: CreateBookingRequest) => {
  const [booking] = await ctx.db
    .insert(bookingTable)
    .values({ customerEmail, endDate, startDate, amount, roomNo })
    .returning(bookingValues);
  return booking;
};

const updateBooking = async (request: UpdateBookingRequest) => {
  const { id, ...requestBody } = request;
  const [booking] = await ctx.db
    .update(bookingTable)
    .set(requestBody)
    .where(eq(bookingTable.id, id))
    .returning(bookingValues);
  return booking;
};

const getExpiredBookings = async () => {
  const date = new Date();
  const bookings = await ctx.db
    .select()
    .from(bookingTable)
    .where(lte(bookingTable.endDate, date.toISOString()));
  return bookings;
};

function getBookingsForEachMonth(bookings: Booking[]) {
  const monthArray = [];
  const monthCounts: { [key: string]: number } = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  for (const booking of bookings) {
    const bookingDate = new Date(booking.createdAt!);
    const monthName = bookingDate.toLocaleString("default", { month: "short" });
    monthCounts[monthName]++;
  }

  for (let i = 0; i < Object.keys(monthCounts).length; i++) {
    monthArray.push({
      name: Object.keys(monthCounts)[i],
      value: Object.values(monthCounts)[i],
    });
  }

  return monthArray;
}
const getBookingsForAdminDashboard = async () => {
  let date = new Date(Date.now());
  date.setFullYear(date.getFullYear() - 1);
  const bookings = await ctx.db
    .select(bookingValues)
    .from(bookingTable)
    .where(gte(bookingTable.createdAt, date.toISOString()));
  const bookingsPerMonth = getBookingsForEachMonth(bookings);
  return bookingsPerMonth;
};

const getBookingDetails = async (bookingID: string) => {
  const booking = await ctx.db.query.booking.findFirst({
    where: eq(bookingTable.id, bookingID),
    with: {
      customers: {
        columns: {
          email: true,
          firstName: true,
          lastName: true,
          id: true,
        },
      },
      room: true,
    },
  });
  return booking;
};

const deleteBooking = async (bookingID: string) => {
  const bookingDeleted = await ctx.db
    .delete(bookingTable)
    .where(eq(bookingTable.id, bookingID))
    .returning(bookingValues);
  return bookingDeleted;
};

const buildBookingSearchQuery = (search: Search) => {
  const filterQueries: SQLWrapper[] = [];
  for (const { key, value } of search) {
    switch (key) {
      case "startDate":
        filterQueries.push(gte(bookingTable.startDate, value.toString()));
        break;
      case "endDate":
        filterQueries.push(lte(bookingTable.endDate, value.toString()));
        break;
      case "customerEmail":
        filterQueries.push(eq(bookingTable.customerEmail, value.toString()));
        break;
      case "status":
        filterQueries.push(
          eq(
            bookingTable.status,
            value as "pending" | "active" | "cancelled" | "done"
          )
        );
        break;
      default:
        filterQueries.push(eq(bookingTable[key], value.toString()));
        break;
    }
  }

  return and(...filterQueries);
};

const listBookings = async ({
  limit,
  pageNo,
  orderBy,
  ascOrDesc,
  searchBy,
}: ListBookingRequest) => {
  let query;
  query = ctx.db
    .select({ ...bookingValues, customerEmail: customerTable.email })
    .from(bookingTable)
    .leftJoin(
      customerTable,
      eq(customerTable.email, bookingTable.customerEmail)
    );
  if (searchBy) {
    const filterCondition = buildBookingSearchQuery(searchBy);
    if (filterCondition) {
      query = query.where(filterCondition);
    }
  }
  if (orderBy) {
    const orderColumn = bookingTable[orderBy];
    query = query.orderBy(
      ascOrDesc === "asc" ? asc(orderColumn) : desc(orderColumn)
    );
  }

  const noOfBookings = (await query).length;
  const bookings = await query.limit(limit).offset((pageNo - 1) * limit);

  return { noOfBookings, bookings };
};

const updateBookingStatusesToDone = async (bookingsToUpdate: Booking[]) => {
  await ctx.db.transaction(async (tx) => {
    for (let i = 0; i < bookingsToUpdate.length; i++) {
      await Promise.all([
        await tx.update(bookingTable).set({ status: "done" }),
        await tx
          .update(roomTable)
          .set({ status: "available" })
          .where(eq(roomTable.roomNo, bookingsToUpdate[i].roomNo)),
      ]);
    }
  });
};

export const bookingRepository = {
  deleteBooking,
  updateBooking,
  createBooking,
  getBookingDetails,
  listBookings,
  getExpiredBookings,
  getBookingsForAdminDashboard,
  updateBookingStatusesToDone,
};
