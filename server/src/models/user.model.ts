export interface UserModel {
  id: string;
  email: string;
  displayName: string;
}

export const mapUserRow = (_row: unknown): UserModel => {
  // TODO: Map database row to user model.
  return {
    id: "",
    email: "",
    displayName: ""
  };
};
