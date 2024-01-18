export const permissions = {
  MANAGE_USER: 'mentor-listing',
  MANAGE_SESSION: 'manage-sessions',
};
export const actions = {
  GET: 'GET',
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  UPDATE: 'UPDATE',
  ALL: 'ALL',
};
export const manageSessionAction = {
  MANAGE_ACTIONS: [
    actions.ALL,
    actions.CREATE,
    actions.GET,
    actions.EDIT,
    actions.UPDATE,
  ],
};
