/**
 * ROLES constants
 */
export const USER = "user";
export const DEVELOPER = "developer";
export const TESTER = "tester";
export const ADMIN = "admin";

export const ROLES_LIST = [USER, DEVELOPER, TESTER, ADMIN];
export const ROLES_AUTHORIZED_FOR_PROJECT_ASSIGNMENT = [
  DEVELOPER,
  TESTER,
  ADMIN,
];

/**
 * STATUS constants
 */
export const NEW = "new";
export const OPEN = "open";
export const DUPLICATE = "duplicate";
export const NOT_REPRODUCIBLE = "not_reproducible";
export const NOT_A_BUG = "not_a_bug";
export const IN_PROGRESS = "in_progress";
export const ON_HOLD = "on_hold";
export const RESOLVED = "resolved";
export const CLOSED = "closed";
export const CANCELLED = "cancelled";
export const REOPENED = "reopened";

export const PROJECT_STATUS_LIST = [
  NEW,
  OPEN,
  ON_HOLD,
  CLOSED,
  CANCELLED,
  REOPENED,
];

export const BUG_STATUS_LIST = [
  NEW,
  OPEN,
  DUPLICATE,
  NOT_REPRODUCIBLE,
  NOT_A_BUG,
  IN_PROGRESS,
  ON_HOLD,
  RESOLVED,
  CLOSED,
  REOPENED,
];

/**
 * PRIORITY constants
 */
export const LOW = "low";
export const MEDIUM = "medium";
export const HIGH = "high";

export const PRIORITY_LIST = [LOW, MEDIUM, HIGH];
