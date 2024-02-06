export const permissions = {
  MANAGE_USER: 'manage_user',
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
  SESSION_ACTIONS: [
    actions.GET,
    actions.POST,
    actions.PUT,
    actions.PATCH,
    actions.DELETE
  ],
};
export const manageUserAction = {
  USER_ACTIONS: [
    actions.POST,
    actions.DELETE
  ],
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
