export type AdminCreationRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refreshToken: string;
};

export type AdminUpdateRequest = {
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  email: string;
};

export type ChangeAdminEmailRequest = {
  email: string;
  newEmail: string;
};

export type ChangeAdminPasswordRequest = {
  email: string;
  newPassword: string;
};
