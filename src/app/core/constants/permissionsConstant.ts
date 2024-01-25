export const permissions = {
  MANAGE_USER: 'mentor_listing',
  MANAGE_SESSION: 'manage_session',
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
    actions.GET
  ],
};
export const manageUserAction = {
  USER_ACTIONS: [
    actions.GET,
    actions.DELETE
  ],
};
