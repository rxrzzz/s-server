import { SQLWrapper, and, asc, desc, eq, ilike } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  ListCustomerRequest,
  RegisterCustomerRequest,
  Search,
  UpdateCustomerEmailRequest,
  UpdateCustomerRequest,
} from "../types/customer.types";

const customerTable = ctx.schema.customer;

export const customerValues = {
  firstName: customerTable.firstName,
  lastName: customerTable.lastName,
  email: customerTable.email,
  id: customerTable.id,
  address: customerTable.address,
  phoneNo: customerTable.phoneNo,
  zip: customerTable.zip,
  createdAt: customerTable.createdAt,
};

const createCustomer = async (customerRequest: RegisterCustomerRequest) => {
  const [customer] = await ctx.db
    .insert(customerTable)
    .values(customerRequest)
    .returning(customerValues);
  return customer;
};

const getCustomerDetails = async (email: string) => {
  const [customerDetails] = await ctx.db
    .select(customerValues)
    .from(customerTable)
    .where(eq(customerTable.email, email));
  return customerDetails;
};

const getCustomerWithBookingAndPaymentDetails = async (email: string) => {
  const customerDetails = await ctx.db.query.customer.findFirst({
    where: eq(customerTable.email, email),
    with: {
      bookings: true,
      payments: true,
    },
  });
  return customerDetails;
};

const customerListSearch = (search: Search): SQLWrapper[] => {
  let filterQueries = [];
  for (let i of search) {
    switch (i.key) {
      case "firstName":
      case "lastName":
      case "email":
        filterQueries.push(
          ilike(customerTable[i.key], `%${i.value.toString()}%`)
        );
        break;
    }
  }
  return filterQueries;
};

const listCustomer = async ({
  limit,
  orderBy,
  pageNo,
  searchBy,
  ascOrDesc,
}: ListCustomerRequest) => {
  let customers;
  const query = ctx.db.select(customerValues).from(customerTable);
  if (searchBy) {
    const filterQueries = customerListSearch(searchBy);
    customers = await query.where(and(...filterQueries));
  } else {
    customers = await query;
  }
  const customerList = await query;
  customers = await query
    .limit(limit)
    .offset((pageNo - 1) * limit)
    .orderBy(
      ascOrDesc === "asc"
        ? asc(customerTable[`${orderBy}`])
        : desc(customerTable[`${orderBy}`])
    );
  return { customers, noOfCustomers: customerList.length };
};

const deleteCustomer = async (email: string) => {
  const [customerDeleted] = await ctx.db
    .delete(customerTable)
    .where(eq(customerValues.email, email))
    .returning(customerValues);
  return customerDeleted;
};

const updateCustomer = async (customerRequest: UpdateCustomerRequest) => {
  const { email, ...request } = customerRequest;
  const [customerUpdated] = await ctx.db
    .update(customerTable)
    .set(request)
    .where(eq(customerTable.email, email))
    .returning(customerValues);
  return customerUpdated;
};

const updateCustomerEmail = async (
  customerRequest: UpdateCustomerEmailRequest
) => {
  const [customerUpdated] = await ctx.db
    .update(customerTable)
    .set({ email: customerRequest.newEmail })
    .where(eq(customerTable.email, customerRequest.email))
    .returning(customerValues);
  return customerUpdated;
};

const getLastFiveCustomers = async () => {
  const customers = await ctx.db
    .select(customerValues)
    .from(customerTable)
    .orderBy(desc(customerTable.createdAt))
    .limit(5);
  return customers;
};

export const customerRepository = {
  createCustomer,
  listCustomer,
  deleteCustomer,
  updateCustomer,
  updateCustomerEmail,
  getCustomerWithBookingAndPaymentDetails,
  getCustomerDetails,
  getLastFiveCustomers,
};
