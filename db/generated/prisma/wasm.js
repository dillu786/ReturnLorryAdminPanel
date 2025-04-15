
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.BookingsScalarFieldEnum = {
  Id: 'Id',
  UserId: 'UserId',
  PickUpLocation: 'PickUpLocation',
  DropLocation: 'DropLocation',
  Product: 'Product',
  Distance: 'Distance',
  Status: 'Status',
  PaymentMode: 'PaymentMode',
  BookingTime: 'BookingTime',
  DriverId: 'DriverId',
  Fare: 'Fare',
  VehicleId: 'VehicleId',
  StartTime: 'StartTime',
  CreatedDateTime: 'CreatedDateTime',
  UpdatedDateTime: 'UpdatedDateTime'
};

exports.Prisma.DriverScalarFieldEnum = {
  Id: 'Id',
  Name: 'Name',
  Gender: 'Gender',
  Password: 'Password',
  MobileNumber: 'MobileNumber',
  DOB: 'DOB',
  DrivingLicenceNumber: 'DrivingLicenceNumber',
  DrivingLicenceFrontImage: 'DrivingLicenceFrontImage',
  DrivingLicenceBackImage: 'DrivingLicenceBackImage',
  DriverImage: 'DriverImage',
  Email: 'Email',
  AdhaarCardNumber: 'AdhaarCardNumber',
  FrontSideAdhaarImage: 'FrontSideAdhaarImage',
  BackSideAdhaarImage: 'BackSideAdhaarImage',
  PanNumber: 'PanNumber',
  PanImage: 'PanImage',
  LastLoggedIn: 'LastLoggedIn',
  CreatedDate: 'CreatedDate',
  IsOnline: 'IsOnline'
};

exports.Prisma.DriverVehicleScalarFieldEnum = {
  Id: 'Id',
  DriverId: 'DriverId',
  VehicleId: 'VehicleId'
};

exports.Prisma.DriverWalletScalarFieldEnum = {
  Id: 'Id',
  DriverId: 'DriverId',
  Amount: 'Amount',
  LastUpdated: 'LastUpdated'
};

exports.Prisma.FareNegotiationScalarFieldEnum = {
  Id: 'Id',
  BookingId: 'BookingId',
  DriverId: 'DriverId',
  OwnerId: 'OwnerId',
  NegotiatedFare: 'NegotiatedFare',
  NegotiatedTime: 'NegotiatedTime'
};

exports.Prisma.OwnerScalarFieldEnum = {
  Id: 'Id',
  Name: 'Name',
  Password: 'Password',
  MobileNumber: 'MobileNumber',
  DOB: 'DOB',
  Email: 'Email',
  Gender: 'Gender',
  AdhaarCardNumber: 'AdhaarCardNumber',
  FrontSideAdhaarImage: 'FrontSideAdhaarImage',
  BackSideAdhaarImage: 'BackSideAdhaarImage',
  PanNumber: 'PanNumber',
  PanImage: 'PanImage',
  LastLoggedIn: 'LastLoggedIn',
  CreatedDate: 'CreatedDate'
};

exports.Prisma.OwnerDriverScalarFieldEnum = {
  Id: 'Id',
  OwnerId: 'OwnerId',
  DriverId: 'DriverId'
};

exports.Prisma.OwnerVehicleScalarFieldEnum = {
  Id: 'Id',
  OwnerId: 'OwnerId',
  VehicleId: 'VehicleId'
};

exports.Prisma.OwnerWalletScalarFieldEnum = {
  Id: 'Id',
  OwnerId: 'OwnerId',
  Amount: 'Amount',
  LastUpdated: 'LastUpdated'
};

exports.Prisma.UserScalarFieldEnum = {
  Id: 'Id',
  MobileNumber: 'MobileNumber',
  CreatedDate: 'CreatedDate',
  LastLoggedIn: 'LastLoggedIn',
  Gender: 'Gender',
  Name: 'Name'
};

exports.Prisma.UserWalletScalarFieldEnum = {
  Id: 'Id',
  UserId: 'UserId',
  Amount: 'Amount'
};

exports.Prisma.VehicleScalarFieldEnum = {
  Id: 'Id',
  Model: 'Model',
  Year: 'Year',
  Category: 'Category',
  VehicleImage: 'VehicleImage',
  VehicleInsuranceImage: 'VehicleInsuranceImage',
  PermitImage: 'PermitImage',
  VehicleNumber: 'VehicleNumber'
};

exports.Prisma.OtpsScalarFieldEnum = {
  CreatedAt: 'CreatedAt',
  ExpiresAt: 'ExpiresAt',
  Id: 'Id',
  MobileNumber: 'MobileNumber',
  Otp: 'Otp'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  fullName: 'fullName',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLogin: 'lastLogin'
};

exports.Prisma.Permission_audit_logsScalarFieldEnum = {
  id: 'id',
  actionType: 'actionType',
  details: 'details',
  actionTimestamp: 'actionTimestamp',
  adminId: 'adminId',
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.Permission_categoriesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  icon: 'icon',
  displayOrder: 'displayOrder'
};

exports.Prisma.PermissionsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description',
  categoryId: 'categoryId'
};

exports.Prisma.Role_permissionsScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.RolesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isSystemRole: 'isSystemRole',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.User_rolesScalarFieldEnum = {
  id: 'id',
  assignedAt: 'assignedAt',
  adminId: 'adminId',
  roleId: 'roleId',
  assignedById: 'assignedById'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.BookingStatus = exports.$Enums.BookingStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  Ongoing: 'Ongoing',
  Completed: 'Completed'
};

exports.PaymentMode = exports.$Enums.PaymentMode = {
  CASH: 'CASH',
  ONLINE: 'ONLINE'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

exports.AuditActionType = exports.$Enums.AuditActionType = {
  GRANT: 'GRANT',
  REVOKE: 'REVOKE',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE'
};

exports.Prisma.ModelName = {
  Bookings: 'Bookings',
  Driver: 'Driver',
  DriverVehicle: 'DriverVehicle',
  DriverWallet: 'DriverWallet',
  FareNegotiation: 'FareNegotiation',
  Owner: 'Owner',
  OwnerDriver: 'OwnerDriver',
  OwnerVehicle: 'OwnerVehicle',
  OwnerWallet: 'OwnerWallet',
  User: 'User',
  UserWallet: 'UserWallet',
  Vehicle: 'Vehicle',
  otps: 'otps',
  admin: 'admin',
  permission_audit_logs: 'permission_audit_logs',
  permission_categories: 'permission_categories',
  permissions: 'permissions',
  role_permissions: 'role_permissions',
  roles: 'roles',
  user_roles: 'user_roles'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
