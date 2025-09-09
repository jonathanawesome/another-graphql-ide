import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql'

import {
  dateTimeScalar,
  emailScalar,
  jsonScalar,
  urlScalar,
} from './scalar-stubs'

// TypeScript Interfaces
interface IUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  bio?: string
  isActive?: boolean
  emailVerified?: boolean
  lastLoginAt?: string
  preferences?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

interface IOrganization {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logoUrl?: string
  tier: string
  isActive?: boolean
  settings?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

interface IProject {
  id: string
  name: string
  description?: string
  code: string
  status: string
  budget?: number
  spentBudget?: number
  startDate?: string
  endDate?: string
  completionPercentage?: number
  isPublic?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  organizationId?: string
}

interface ITask {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  estimatedHours?: number
  actualHours?: number
  dueDate?: string
  completedAt?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  projectId?: string
}

interface IDocument {
  id: string
  name: string
  description?: string
  fileUrl: string
  mimeType: string
  sizeBytes: number
  version: number
  createdAt?: string
  updatedAt?: string
  tags?: string[]
}

interface IComment {
  id: string
  content: string
  createdAt?: string
  updatedAt?: string
  editedAt?: string
}

interface INotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  readAt?: string
  createdAt: string
  relatedObjectId?: string
  relatedObjectType?: string
}

interface IBillingInfo {
  id: string
  paymentMethod?: string
  billingEmail: string
  billingAddress?: Record<string, unknown>
  taxId?: string
  nextBillingDate?: string
  currentBalance?: number
}

interface IInvoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  dueDate: string
  paidAt?: string
  createdAt: string
}

interface IInvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface ICreateUserInput {
  email: string
  firstName: string
  lastName: string
  role?: string
  organizationId?: string
}

interface ICreateProjectInput {
  name: string
  description?: string
  organizationId: string
  managerId?: string
  status?: string
  budget?: number
  startDate?: string
  endDate?: string
}

interface ICreateTaskInput {
  title: string
  description?: string
  projectId: string
  assigneeId?: string
  priority?: string
  status?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
}

type SearchResultType = IUser | IProject | ITask | IDocument

// Enums
const UserRole = new GraphQLEnumType({
  name: 'UserRole',
  description: 'Roles that can be assigned to users within an organization',
  values: {
    OWNER: { description: 'Organization owner with full permissions' },
    ADMIN: { description: 'Administrator with elevated permissions' },
    MANAGER: { description: 'Manager with team oversight capabilities' },
    MEMBER: { description: 'Regular member with standard permissions' },
    VIEWER: { description: 'Read-only access to resources' },
    GUEST: { description: 'Limited guest access' },
  },
})

const OrganizationTier = new GraphQLEnumType({
  name: 'OrganizationTier',
  description: 'Subscription tier for organizations',
  values: {
    FREE: { description: 'Free tier with basic features' },
    STARTER: { description: 'Starter tier for small teams' },
    PROFESSIONAL: { description: 'Professional tier with advanced features' },
    ENTERPRISE: {
      description: 'Enterprise tier with full features and support',
    },
  },
})

const ProjectStatus = new GraphQLEnumType({
  name: 'ProjectStatus',
  description: 'Current status of a project',
  values: {
    PLANNING: { description: 'In planning phase' },
    IN_PROGRESS: { description: 'Actively being worked on' },
    REVIEW: { description: 'Under review' },
    ON_HOLD: { description: 'Temporarily paused' },
    COMPLETED: { description: 'Successfully completed' },
    CANCELLED: { description: 'Cancelled' },
    ARCHIVED: { description: 'Archived for historical reference' },
  },
})

const TaskPriority = new GraphQLEnumType({
  name: 'TaskPriority',
  description: 'Priority level for tasks',
  values: {
    CRITICAL: {
      description: 'Critical priority - immediate attention required',
    },
    HIGH: { description: 'High priority' },
    MEDIUM: { description: 'Medium priority' },
    LOW: { description: 'Low priority' },
  },
})

const TaskStatus = new GraphQLEnumType({
  name: 'TaskStatus',
  description: 'Current status of a task',
  values: {
    TODO: { description: 'Not started' },
    IN_PROGRESS: { description: 'Currently being worked on' },
    IN_REVIEW: { description: 'Under review' },
    BLOCKED: { description: 'Blocked by dependencies' },
    DONE: { description: 'Completed' },
  },
})

const AuditEventType = new GraphQLEnumType({
  name: 'AuditEventType',
  description: 'Types of audit events',
  values: {
    USER_LOGIN: {},
    USER_LOGOUT: {},
    USER_CREATED: {},
    USER_UPDATED: {},
    USER_DELETED: {},
    PROJECT_CREATED: {},
    PROJECT_UPDATED: {},
    PROJECT_DELETED: {},
    PERMISSION_GRANTED: {},
    PERMISSION_REVOKED: {},
    DATA_EXPORTED: {},
    SETTINGS_CHANGED: {},
  },
})

const NotificationType = new GraphQLEnumType({
  name: 'NotificationType',
  description: 'Types of notifications',
  values: {
    INFO: { description: 'Informational notification' },
    SUCCESS: { description: 'Success notification' },
    WARNING: { description: 'Warning notification' },
    ERROR: { description: 'Error notification' },
    MENTION: { description: 'User was mentioned' },
    ASSIGNMENT: { description: 'Task or project assignment' },
  },
})

// Interfaces
const Node: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'Node',
  description: 'An object with an ID',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the object',
    },
  }),
})

const Timestamped: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'Timestamped',
  description: 'An object with timestamp fields',
  fields: () => ({
    createdAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      description: 'When the object was created',
    },
    updatedAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      description: 'When the object was last updated',
    },
  }),
})

// Input Types
const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    email: { type: new GraphQLNonNull(emailScalar) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: UserRole },
    organizationId: { type: GraphQLID },
  },
})

const UpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: emailScalar },
    avatarUrl: { type: urlScalar },
    bio: { type: GraphQLString },
    preferences: { type: jsonScalar },
  },
})

const CreateProjectInput = new GraphQLInputObjectType({
  name: 'CreateProjectInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    organizationId: { type: new GraphQLNonNull(GraphQLID) },
    managerId: { type: GraphQLID },
    status: { type: ProjectStatus },
    budget: { type: GraphQLFloat },
    startDate: { type: dateTimeScalar },
    endDate: { type: dateTimeScalar },
  },
})

const CreateTaskInput = new GraphQLInputObjectType({
  name: 'CreateTaskInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    projectId: { type: new GraphQLNonNull(GraphQLID) },
    assigneeId: { type: GraphQLID },
    priority: { type: TaskPriority },
    status: { type: TaskStatus },
    dueDate: { type: dateTimeScalar },
    estimatedHours: { type: GraphQLFloat },
    tags: { type: new GraphQLList(GraphQLString) },
  },
})

const PaginationInput = new GraphQLInputObjectType({
  name: 'PaginationInput',
  fields: {
    limit: { type: GraphQLInt, defaultValue: 10 },
    offset: { type: GraphQLInt, defaultValue: 0 },
    cursor: { type: GraphQLString },
  },
})

const FilterInput = new GraphQLInputObjectType({
  name: 'FilterInput',
  fields: {
    search: { type: GraphQLString },
    startDate: { type: dateTimeScalar },
    endDate: { type: dateTimeScalar },
    status: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
  },
})

// Object Types
const Organization: GraphQLObjectType = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization that contains users and projects',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    website: { type: urlScalar },
    logoUrl: { type: urlScalar },
    tier: { type: new GraphQLNonNull(OrganizationTier) },
    isActive: { type: new GraphQLNonNull(GraphQLBoolean) },
    settings: { type: jsonScalar },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    owner: {
      type: User,
      resolve: (): IUser => ({
        id: '1',
        email: 'owner@company.com',
        firstName: 'John',
        lastName: 'Doe',
      }),
    },
    members: {
      type: new GraphQLList(User),
      args: {
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: (): IUser[] => [
        {
          id: '2',
          email: 'alice@company.com',
          firstName: 'Alice',
          lastName: 'Smith',
        },
        {
          id: '3',
          email: 'bob@company.com',
          firstName: 'Bob',
          lastName: 'Johnson',
        },
      ],
    },
    projects: {
      type: new GraphQLList(Project),
      args: {
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    billingInfo: {
      type: BillingInfo,
      resolve: (): IBillingInfo => ({
        id: '1',
        paymentMethod: 'Credit Card',
        billingEmail: 'billing@company.com',
      }),
    },
    stats: {
      type: OrganizationStats,
      resolve: () => ({
        totalMembers: 25,
        activeProjects: 8,
        completedProjects: 42,
        totalTasks: 1337,
      }),
    },
  }),
})

const OrganizationStats = new GraphQLObjectType({
  name: 'OrganizationStats',
  description: 'Statistics for an organization',
  fields: {
    totalMembers: { type: new GraphQLNonNull(GraphQLInt) },
    activeProjects: { type: new GraphQLNonNull(GraphQLInt) },
    completedProjects: { type: new GraphQLNonNull(GraphQLInt) },
    totalTasks: { type: new GraphQLNonNull(GraphQLInt) },
    storageUsedGB: { type: GraphQLFloat },
    apiCallsThisMonth: { type: GraphQLInt },
  },
})

const User: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'A user in the system',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(emailScalar) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (user: IUser) => `${user.firstName} ${user.lastName}`,
    },
    avatarUrl: { type: urlScalar },
    bio: { type: GraphQLString },
    isActive: { type: new GraphQLNonNull(GraphQLBoolean), resolve: () => true },
    emailVerified: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: () => true,
    },
    lastLoginAt: { type: dateTimeScalar },
    preferences: { type: jsonScalar },
    createdAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      resolve: () => new Date().toISOString(),
    },
    updatedAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      resolve: () => new Date().toISOString(),
    },
    organizations: {
      type: new GraphQLList(OrganizationMembership),
      resolve: () => [],
    },
    assignedTasks: {
      type: new GraphQLList(Task),
      args: {
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    notifications: {
      type: new GraphQLList(Notification),
      args: {
        unreadOnly: { type: GraphQLBoolean },
        pagination: { type: PaginationInput },
      },
      resolve: () => [],
    },
  }),
})

const OrganizationMembership = new GraphQLObjectType({
  name: 'OrganizationMembership',
  description: "A user's membership in an organization",
  fields: () => ({
    organization: { type: new GraphQLNonNull(Organization) },
    role: { type: new GraphQLNonNull(UserRole) },
    joinedAt: { type: new GraphQLNonNull(dateTimeScalar) },
  }),
})

const Project: GraphQLObjectType = new GraphQLObjectType({
  name: 'Project',
  description: 'A project within an organization',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    code: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(ProjectStatus) },
    budget: { type: GraphQLFloat },
    spentBudget: { type: GraphQLFloat },
    startDate: { type: dateTimeScalar },
    endDate: { type: dateTimeScalar },
    completionPercentage: { type: GraphQLInt },
    isPublic: { type: new GraphQLNonNull(GraphQLBoolean) },
    tags: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    organization: { type: new GraphQLNonNull(Organization) },
    manager: { type: User },
    members: {
      type: new GraphQLList(ProjectMember),
      resolve: () => [],
    },
    tasks: {
      type: new GraphQLList(Task),
      args: {
        status: { type: new GraphQLList(TaskStatus) },
        assigneeId: { type: GraphQLID },
        pagination: { type: PaginationInput },
      },
      resolve: () => [],
    },
    milestones: {
      type: new GraphQLList(Milestone),
      resolve: () => [],
    },
    documents: {
      type: new GraphQLList(Document),
      resolve: () => [],
    },
  }),
})

const ProjectMember = new GraphQLObjectType({
  name: 'ProjectMember',
  description: 'A member of a project',
  fields: () => ({
    user: { type: new GraphQLNonNull(User) },
    role: { type: new GraphQLNonNull(GraphQLString) },
    joinedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    hoursLogged: { type: GraphQLFloat },
  }),
})

const Task: GraphQLObjectType = new GraphQLObjectType({
  name: 'Task',
  description: 'A task within a project',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    status: { type: new GraphQLNonNull(TaskStatus) },
    priority: { type: new GraphQLNonNull(TaskPriority) },
    estimatedHours: { type: GraphQLFloat },
    actualHours: { type: GraphQLFloat },
    dueDate: { type: dateTimeScalar },
    completedAt: { type: dateTimeScalar },
    tags: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    project: { type: new GraphQLNonNull(Project) },
    assignee: { type: User },
    reporter: { type: new GraphQLNonNull(User) },
    comments: {
      type: new GraphQLList(Comment),
      resolve: () => [],
    },
    attachments: {
      type: new GraphQLList(Attachment),
      resolve: () => [],
    },
    subtasks: {
      type: new GraphQLList(Task),
      resolve: () => [],
    },
    parentTask: { type: Task },
    dependencies: {
      type: new GraphQLList(Task),
      resolve: () => [],
    },
  }),
})

const Milestone = new GraphQLObjectType({
  name: 'Milestone',
  description: 'A project milestone',
  interfaces: [Node, Timestamped],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    dueDate: { type: new GraphQLNonNull(dateTimeScalar) },
    completedAt: { type: dateTimeScalar },
    project: { type: new GraphQLNonNull(Project) },
    tasks: { type: new GraphQLList(Task) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
  },
})

const Comment = new GraphQLObjectType({
  name: 'Comment',
  description: 'A comment on a task or document',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: { type: new GraphQLNonNull(User) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    editedAt: { type: dateTimeScalar },
    mentions: { type: new GraphQLList(User) },
    reactions: { type: new GraphQLList(Reaction) },
  }),
})

const Reaction = new GraphQLObjectType({
  name: 'Reaction',
  description: 'A reaction to a comment',
  fields: () => ({
    emoji: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(User) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
  }),
})

const Document = new GraphQLObjectType({
  name: 'Document',
  description: 'A document or file',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    fileUrl: { type: new GraphQLNonNull(urlScalar) },
    mimeType: { type: new GraphQLNonNull(GraphQLString) },
    sizeBytes: { type: new GraphQLNonNull(GraphQLInt) },
    version: { type: new GraphQLNonNull(GraphQLInt) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    uploadedBy: { type: new GraphQLNonNull(User) },
    project: { type: Project },
    tags: { type: new GraphQLList(GraphQLString) },
  }),
})

const Attachment = new GraphQLObjectType({
  name: 'Attachment',
  description: 'An attachment to a task or comment',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    fileName: { type: new GraphQLNonNull(GraphQLString) },
    fileUrl: { type: new GraphQLNonNull(urlScalar) },
    mimeType: { type: new GraphQLNonNull(GraphQLString) },
    sizeBytes: { type: new GraphQLNonNull(GraphQLInt) },
    uploadedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    uploadedBy: { type: new GraphQLNonNull(User) },
  },
})

const Notification = new GraphQLObjectType({
  name: 'Notification',
  description: 'A notification for a user',
  interfaces: [Node],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    type: { type: new GraphQLNonNull(NotificationType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    message: { type: new GraphQLNonNull(GraphQLString) },
    read: { type: new GraphQLNonNull(GraphQLBoolean) },
    readAt: { type: dateTimeScalar },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    user: { type: new GraphQLNonNull(User) },
    relatedObjectId: { type: GraphQLID },
    relatedObjectType: { type: GraphQLString },
  }),
})

const AuditLog = new GraphQLObjectType({
  name: 'AuditLog',
  description: 'An audit log entry',
  interfaces: [Node],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    eventType: { type: new GraphQLNonNull(AuditEventType) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: GraphQLID },
    user: { type: User },
    organizationId: { type: new GraphQLNonNull(GraphQLID) },
    organization: { type: Organization },
    ipAddress: { type: GraphQLString },
    userAgent: { type: GraphQLString },
    metadata: { type: jsonScalar },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
  }),
})

const BillingInfo = new GraphQLObjectType({
  name: 'BillingInfo',
  description: 'Billing information for an organization',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    paymentMethod: { type: GraphQLString },
    billingEmail: { type: new GraphQLNonNull(emailScalar) },
    billingAddress: { type: jsonScalar },
    taxId: { type: GraphQLString },
    nextBillingDate: { type: dateTimeScalar },
    currentBalance: { type: GraphQLFloat },
  },
})

const InvoiceItem = new GraphQLObjectType({
  name: 'InvoiceItem',
  description: 'An item on an invoice',
  fields: {
    description: { type: new GraphQLNonNull(GraphQLString) },
    quantity: { type: new GraphQLNonNull(GraphQLInt) },
    unitPrice: { type: new GraphQLNonNull(GraphQLFloat) },
    total: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

const Invoice = new GraphQLObjectType({
  name: 'Invoice',
  description: 'An invoice for billing',
  interfaces: [Node],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    invoiceNumber: { type: new GraphQLNonNull(GraphQLString) },
    organization: { type: new GraphQLNonNull(Organization) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    currency: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    dueDate: { type: new GraphQLNonNull(dateTimeScalar) },
    paidAt: { type: dateTimeScalar },
    items: {
      type: new GraphQLList(InvoiceItem),
      resolve: (): IInvoiceItem[] => [
        {
          description: 'Professional Services',
          quantity: 1,
          unitPrice: 1000,
          total: 1000,
        },
      ],
    },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
  },
})

// Union Types
const SearchResult = new GraphQLUnionType({
  name: 'SearchResult',
  types: [User, Project, Task, Document],
  resolveType(value: SearchResultType) {
    if ('email' in value) return 'User'
    if ('code' in value) return 'Project'
    if ('priority' in value) return 'Task'
    if ('fileUrl' in value) return 'Document'
    return undefined
  },
})

// Analytics Types
const DashboardMetrics = new GraphQLObjectType({
  name: 'DashboardMetrics',
  description: 'Metrics for dashboard display',
  fields: {
    activeUsers: { type: new GraphQLNonNull(GraphQLInt) },
    totalProjects: { type: new GraphQLNonNull(GraphQLInt) },
    completedTasks: { type: new GraphQLNonNull(GraphQLInt) },
    pendingTasks: { type: new GraphQLNonNull(GraphQLInt) },
    averageTaskCompletionTime: { type: GraphQLFloat },
    projectsOverBudget: { type: GraphQLInt },
    upcomingDeadlines: { type: new GraphQLList(Task) },
    recentActivity: { type: new GraphQLList(AuditLog) },
  },
})

const Report = new GraphQLObjectType({
  name: 'Report',
  description: 'A generated report',
  interfaces: [Node],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    parameters: { type: jsonScalar },
    data: { type: jsonScalar },
    generatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    generatedBy: { type: new GraphQLNonNull(User) },
    organization: { type: new GraphQLNonNull(Organization) },
  },
})

// Root Query Type
const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query type',
  fields: {
    // User queries
    me: {
      type: User,
      resolve: () => ({
        id: '1',
        email: 'current@user.com',
        firstName: 'Current',
        lastName: 'User',
      }),
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_root, { id }: { id: string }): IUser => ({
        id,
        email: `user${id}@example.com`,
        firstName: 'Test',
        lastName: 'User',
      }),
    },
    users: {
      type: new GraphQLList(User),
      args: {
        organizationId: { type: GraphQLID },
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    // Organization queries
    organization: {
      type: Organization,
      args: {
        id: { type: GraphQLID },
        slug: { type: GraphQLString },
      },
      resolve: (): IOrganization => ({
        id: '1',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        tier: 'ENTERPRISE',
      }),
    },
    organizations: {
      type: new GraphQLList(Organization),
      args: {
        pagination: { type: PaginationInput },
      },
      resolve: () => [],
    },
    // Project queries
    project: {
      type: Project,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    projects: {
      type: new GraphQLList(Project),
      args: {
        organizationId: { type: GraphQLID },
        status: { type: new GraphQLList(ProjectStatus) },
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    // Task queries
    task: {
      type: Task,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    tasks: {
      type: new GraphQLList(Task),
      args: {
        projectId: { type: GraphQLID },
        assigneeId: { type: GraphQLID },
        status: { type: new GraphQLList(TaskStatus) },
        priority: { type: new GraphQLList(TaskPriority) },
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    // Search
    search: {
      type: new GraphQLList(SearchResult),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
        types: { type: new GraphQLList(GraphQLString) },
        limit: { type: GraphQLInt },
      },
      resolve: () => [],
    },
    // Analytics
    dashboardMetrics: {
      type: DashboardMetrics,
      args: {
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
        dateRange: { type: FilterInput },
      },
      resolve: () => ({
        activeUsers: 42,
        totalProjects: 15,
        completedTasks: 234,
        pendingTasks: 89,
      }),
    },
    report: {
      type: Report,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    // Audit logs
    auditLogs: {
      type: new GraphQLList(AuditLog),
      args: {
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: GraphQLID },
        eventTypes: { type: new GraphQLList(AuditEventType) },
        pagination: { type: PaginationInput },
        filter: { type: FilterInput },
      },
      resolve: () => [],
    },
    // Notifications
    notifications: {
      type: new GraphQLList(Notification),
      args: {
        unreadOnly: { type: GraphQLBoolean },
        types: { type: new GraphQLList(NotificationType) },
        pagination: { type: PaginationInput },
      },
      resolve: () => [],
    },
    // Invoices
    invoice: {
      type: Invoice,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_root, { id }: { id: string }): IInvoice => ({
        id,
        invoiceNumber: `INV-${id}`,
        amount: 1000,
        currency: 'USD',
        status: 'PENDING',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }),
    },
    invoices: {
      type: new GraphQLList(Invoice),
      args: {
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: GraphQLString },
        pagination: { type: PaginationInput },
      },
      resolve: () => [],
    },
  },
})

// Mutation Type
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation type',
  fields: {
    // User mutations
    createUser: {
      type: User,
      args: {
        input: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: (_root, { input }: { input: ICreateUserInput }): IUser => ({
        id: '1',
        ...input,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      }),
    },
    updateUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(UpdateUserInput) },
      },
      resolve: () => null,
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => true,
    },
    // Organization mutations
    createOrganization: {
      type: Organization,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
      },
      resolve: () => null,
    },
    updateOrganization: {
      type: Organization,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        tier: { type: OrganizationTier },
      },
      resolve: () => null,
    },
    inviteUserToOrganization: {
      type: GraphQLBoolean,
      args: {
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(emailScalar) },
        role: { type: UserRole },
      },
      resolve: () => true,
    },
    // Project mutations
    createProject: {
      type: Project,
      args: {
        input: { type: new GraphQLNonNull(CreateProjectInput) },
      },
      resolve: (
        _root,
        { input }: { input: ICreateProjectInput }
      ): IProject | null => {
        return {
          id: '1',
          name: input.name,
          description: input.description,
          code: 'PROJ-001',
          status: input.status || 'PLANNING',
          organizationId: input.organizationId,
        }
      },
    },
    updateProject: {
      type: Project,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: ProjectStatus },
      },
      resolve: () => null,
    },
    deleteProject: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => true,
    },
    // Task mutations
    createTask: {
      type: Task,
      args: {
        input: { type: new GraphQLNonNull(CreateTaskInput) },
      },
      resolve: (
        _root,
        { input }: { input: ICreateTaskInput }
      ): ITask | null => {
        return {
          id: '1',
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          status: input.status || 'TODO',
          priority: input.priority || 'MEDIUM',
        }
      },
    },
    updateTask: {
      type: Task,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: TaskStatus },
        priority: { type: TaskPriority },
        assigneeId: { type: GraphQLID },
      },
      resolve: () => null,
    },
    deleteTask: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => true,
    },
    // Comment mutations
    addComment: {
      type: Comment,
      args: {
        taskId: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (
        _root,
        { content }: { taskId: string; content: string }
      ): IComment | null => {
        return {
          id: '1',
          content,
          createdAt: new Date().toISOString(),
        }
      },
    },
    updateComment: {
      type: Comment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: () => null,
    },
    deleteComment: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => true,
    },
    // Notification mutations
    markNotificationAsRead: {
      type: Notification,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_root, { id }: { id: string }): INotification | null => {
        return {
          id,
          type: 'INFO',
          title: 'Notification',
          message: 'Marked as read',
          read: true,
          createdAt: new Date().toISOString(),
        }
      },
    },
    markAllNotificationsAsRead: {
      type: GraphQLBoolean,
      resolve: () => true,
    },
    // File upload
    uploadDocument: {
      type: Document,
      args: {
        projectId: { type: GraphQLID },
        file: { type: new GraphQLNonNull(GraphQLString) }, // In practice, this would be a file upload
        description: { type: GraphQLString },
      },
      resolve: (
        _root,
        args: { projectId?: string; file: string; description?: string }
      ): IDocument | null => {
        return {
          id: '1',
          name: 'document.pdf',
          description: args.description,
          fileUrl: args.file,
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          version: 1,
        }
      },
    },
  },
})

// Subscription Type
const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  description: 'Root subscription type',
  fields: {
    taskUpdated: {
      type: Task,
      args: {
        projectId: { type: GraphQLID },
      },
      subscribe: async function* () {
        // Mock subscription with delay
        await new Promise(resolve => setTimeout(resolve, 100))
        yield { taskUpdated: { id: '1', title: 'Updated Task' } }
      },
    },
    notificationReceived: {
      type: Notification,
      subscribe: async function* () {
        // Mock subscription with delay
        await new Promise(resolve => setTimeout(resolve, 100))
        yield {
          notificationReceived: {
            id: '1',
            type: 'INFO',
            title: 'New Notification',
            message: 'You have a new notification',
          },
        }
      },
    },
    projectStatusChanged: {
      type: Project,
      args: {
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
      },
      subscribe: async function* () {
        // Mock subscription with delay
        await new Promise(resolve => setTimeout(resolve, 100))
        yield {
          projectStatusChanged: {
            id: '1',
            name: 'Project Alpha',
            status: 'IN_PROGRESS',
          },
        }
      },
    },
  },
})

// Create and export the schema
export const enterpriseTestSchema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
  description:
    'Enterprise-focused GraphQL schema with comprehensive business features',
})
