export const authenticateUser = async (_email: string, _password: string) => {
  // TODO: Validate credentials and issue JWTs.
  return { accessToken: "", refreshToken: "" };
};

export const verifyToken = async (_token: string) => {
  // TODO: Verify JWT and return user context.
  return null;
};
