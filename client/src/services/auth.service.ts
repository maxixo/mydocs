export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const login = async (_email: string, _password: string): Promise<AuthTokens> => {
  // TODO: call auth API and return tokens.
  return {
    accessToken: "",
    refreshToken: ""
  };
};

export const logout = async (): Promise<void> => {
  // TODO: call logout API and clear local session.
};
