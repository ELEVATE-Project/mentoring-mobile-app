export const permissions = {
  MANAGE_USER: 'org-admin',
  MANAGE_SESSION: 'manage-sessions',
};
export const actions = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  PUT: "PUT",
};
export const manageSessionAction = {
  SESSION_ACTIONS: []
};
export const manageUserAction = {
  USER_ACTIONS: [],
};
export const permissionModule = {
  MODULES: [
    {
      module: permissions.MANAGE_USER
    },
    {
      module: permissions.MANAGE_SESSION
    }
  ]
}
