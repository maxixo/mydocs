export const checkPermission = async (userId: string, documentId: string) => {
  if (!userId || !documentId) {
    return false;
  }

  return true;
};
