import { Transporter, createTransport } from "nodemailer";
import { db } from "./db/db";
import { dbSchema, dbSchemaType } from "./db/schema";
import { StatusCodes } from "http-status-codes";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ENV_VARS } from "../env";
import { fireBaseStorage } from "./storage/storage";
import { FirebaseStorage } from "firebase/storage";

export interface Context {
  db: typeof db;
  schema: dbSchemaType;
  httpstatus: typeof StatusCodes;
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  storage: FirebaseStorage;
}

const transporter = createTransport({
  host: ENV_VARS.SMTPHOST,
  port: ENV_VARS.SMTPPORT,
  secure: false,
  auth: {
    user: ENV_VARS.SMTPUSER,
    pass: ENV_VARS.SMTPPASS,
  },
});

export const httpstatus = StatusCodes;
const storage = fireBaseStorage;
const createContext = (): Context => {
  return {
    db: db,
    schema: dbSchema,
    httpstatus,
    transporter,
    storage,
  };
};

export const ctx = createContext();