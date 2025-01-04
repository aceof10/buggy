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
/* END */

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
  DUPLICATE,
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
/* END */

/**
 * PRIORITY constants
 */
export const LOW = "low";
export const MEDIUM = "medium";
export const HIGH = "high";

export const PRIORITY_LIST = [LOW, MEDIUM, HIGH];
/* END */

/**
 * ERROR constants
 */
// Auth errors
export const UNAUTHORIZED = "Unauthorized access. Please log in to continue.";
export const FORBIDDEN = "You are not permitted to perform this action.";

// Token errors
export const HEADER_MALFORMED = "Malformed authorization header.";
export const TOKEN_EXPIRED = "Session expired. Please log in to continue.";
export const TOKEN_INVALID = "Invalid session. Please log in to continue.";

// Validation errors
export const MISSING_FIELDS = "Required fields are missing.";
export const INVALID_INPUT = "Invalid input provided.";

// Database errors
export const CONNECTION_FAILED = "Failed to connect to the database.";
export const QUERY_FAILED = "Database query failed.";
export const RECORD_NOT_FOUND = "Requested record not found in the database.";

// General errors
export const INTERNAL_SERVER_ERROR = "Internal server error.";
export const RESOURCE_NOT_FOUND = "Requested resource not found.";
export const BAD_REQUEST = "Invalid request.";
export const SERVICE_UNAVAILABLE = "Service is currently unavailable.";

// User errors
export const USER_NOT_FOUND = "User not found.";
export const USER_EXISTS = "User already exists.";
export const INVALID_ROLE = "Provided role is invalid.";

// Project errors
export const PROJECT_NOT_FOUND = "Project not found.";
export const INVALID_PROJECT_STATUS = "Invalid project status provided.";

// Bug errors
export const BUG_NOT_FOUND = "Bug not found.";
export const INVALID_BUG_STATUS = "Invalid bug status provided.";
/* END */
