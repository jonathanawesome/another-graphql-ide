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
} from 'graphql'

import {
  dateTimeScalar,
  emailScalar,
  phoneNumberScalar,
} from './scalar-stubs'

// Enums
const AppointmentStatus = new GraphQLEnumType({
  name: 'AppointmentStatus',
  description: 'Status of veterinary appointments',
  values: {
    SCHEDULED: { description: 'Appointment is scheduled' },
    IN_PROGRESS: { description: 'Appointment is currently happening' },
    COMPLETED: { description: 'Appointment has been completed' },
    CANCELLED: { description: 'Appointment was cancelled' },
    NO_SHOW: { description: 'Patient did not show up' },
  },
})

const AppointmentType = new GraphQLEnumType({
  name: 'AppointmentType',
  description: 'Type of veterinary appointment',
  values: {
    CHECKUP: { description: 'Regular health checkup' },
    VACCINATION: { description: 'Vaccination appointment' },
    SURGERY: { description: 'Surgical procedure' },
    EMERGENCY: { description: 'Emergency visit' },
    GROOMING: { description: 'Grooming service' },
    DENTAL: { description: 'Dental care' },
  },
})

const EmployeeRole = new GraphQLEnumType({
  name: 'EmployeeRole',
  description: 'Roles for veterinary office employees',
  values: {
    VETERINARIAN: { description: 'Licensed veterinarian' },
    VETERINARY_TECHNICIAN: { description: 'Veterinary technician' },
    RECEPTIONIST: { description: 'Front desk receptionist' },
    GROOMER: { description: 'Pet groomer' },
    MANAGER: { description: 'Office manager' },
    ASSISTANT: { description: 'General assistant' },
  },
})

const PetSpecies = new GraphQLEnumType({
  name: 'PetSpecies',
  description: 'Species of pets',
  values: {
    DOG: { description: 'Domestic dog' },
    CAT: { description: 'Domestic cat' },
    BIRD: { description: 'Bird' },
    RABBIT: { description: 'Rabbit' },
    HAMSTER: { description: 'Hamster' },
    GUINEA_PIG: { description: 'Guinea pig' },
    REPTILE: { description: 'Reptile' },
    FISH: { description: 'Fish' },
    OTHER: { description: 'Other species' },
  },
})

const ProductCategory = new GraphQLEnumType({
  name: 'ProductCategory',
  description: 'Categories of products sold',
  values: {
    FOOD: { description: 'Pet food' },
    TOYS: { description: 'Pet toys' },
    MEDICATION: { description: 'Veterinary medications' },
    SUPPLIES: { description: 'Pet supplies' },
    GROOMING: { description: 'Grooming products' },
    ACCESSORIES: { description: 'Pet accessories' },
  },
})

const OrderStatus = new GraphQLEnumType({
  name: 'OrderStatus',
  description: 'Status of product orders',
  values: {
    PENDING: { description: 'Order is pending' },
    CONFIRMED: { description: 'Order is confirmed' },
    SHIPPED: { description: 'Order has been shipped' },
    DELIVERED: { description: 'Order has been delivered' },
    CANCELLED: { description: 'Order was cancelled' },
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
const CreateClientInput = new GraphQLInputObjectType({
  name: 'CreateClientInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: emailScalar },
    phone: { type: phoneNumberScalar },
    address: { type: GraphQLString },
  },
})

const CreatePetInput = new GraphQLInputObjectType({
  name: 'CreatePetInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    species: { type: new GraphQLNonNull(PetSpecies) },
    breed: { type: GraphQLString },
    age: { type: GraphQLInt },
    weight: { type: GraphQLFloat },
    clientId: { type: new GraphQLNonNull(GraphQLID) },
  },
})

const CreateAppointmentInput = new GraphQLInputObjectType({
  name: 'CreateAppointmentInput',
  fields: {
    petId: { type: new GraphQLNonNull(GraphQLID) },
    veterinarianId: { type: new GraphQLNonNull(GraphQLID) },
    appointmentType: { type: new GraphQLNonNull(AppointmentType) },
    scheduledAt: { type: new GraphQLNonNull(dateTimeScalar) },
    notes: { type: GraphQLString },
  },
})

const CreateEmployeeInput = new GraphQLInputObjectType({
  name: 'CreateEmployeeInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(emailScalar) },
    phone: { type: phoneNumberScalar },
    role: { type: new GraphQLNonNull(EmployeeRole) },
    salary: { type: GraphQLFloat },
  },
})

const CreateProductInput = new GraphQLInputObjectType({
  name: 'CreateProductInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    category: { type: new GraphQLNonNull(ProductCategory) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    stockQuantity: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

// Object Types
const Client: GraphQLObjectType = new GraphQLObjectType({
  name: 'Client',
  description: 'A client who brings their pets to the veterinary office',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (client: any) => `${client.firstName} ${client.lastName}`,
    },
    email: { type: emailScalar },
    phone: { type: phoneNumberScalar },
    address: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    pets: {
      type: new GraphQLList(Pet),
      resolve: () => [],
    },
    appointments: {
      type: new GraphQLList(Appointment),
      resolve: () => [],
    },
    orders: {
      type: new GraphQLList(Order),
      resolve: () => [],
    },
  }),
})

const Pet: GraphQLObjectType = new GraphQLObjectType({
  name: 'Pet',
  description: 'A pet that receives veterinary care',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    species: { type: new GraphQLNonNull(PetSpecies) },
    breed: { type: GraphQLString },
    age: { type: GraphQLInt },
    weight: { type: GraphQLFloat },
    microchipId: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    owner: {
      type: new GraphQLNonNull(Client),
      resolve: () => ({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      }),
    },
    appointments: {
      type: new GraphQLList(Appointment),
      resolve: () => [],
    },
    medicalRecords: {
      type: new GraphQLList(MedicalRecord),
      resolve: () => [],
    },
  }),
})

const Employee: GraphQLObjectType = new GraphQLObjectType({
  name: 'Employee',
  description: 'An employee of the veterinary office',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (employee: any) => `${employee.firstName} ${employee.lastName}`,
    },
    email: { type: new GraphQLNonNull(emailScalar) },
    phone: { type: phoneNumberScalar },
    role: { type: new GraphQLNonNull(EmployeeRole) },
    salary: { type: GraphQLFloat },
    hireDate: { type: dateTimeScalar },
    isActive: { type: new GraphQLNonNull(GraphQLBoolean) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    appointments: {
      type: new GraphQLList(Appointment),
      resolve: () => [],
    },
    schedule: {
      type: new GraphQLList(Schedule),
      resolve: () => [],
    },
  }),
})

const Appointment: GraphQLObjectType = new GraphQLObjectType({
  name: 'Appointment',
  description: 'A scheduled veterinary appointment',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    appointmentType: { type: new GraphQLNonNull(AppointmentType) },
    status: { type: new GraphQLNonNull(AppointmentStatus) },
    scheduledAt: { type: new GraphQLNonNull(dateTimeScalar) },
    completedAt: { type: dateTimeScalar },
    duration: { type: GraphQLInt },
    notes: { type: GraphQLString },
    cost: { type: GraphQLFloat },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    pet: {
      type: new GraphQLNonNull(Pet),
      resolve: () => ({
        id: '1',
        name: 'Buddy',
        species: 'DOG',
      }),
    },
    veterinarian: {
      type: new GraphQLNonNull(Employee),
      resolve: () => ({
        id: '1',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        role: 'VETERINARIAN',
      }),
    },
    client: {
      type: new GraphQLNonNull(Client),
      resolve: () => ({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      }),
    },
  }),
})

const MedicalRecord: GraphQLObjectType = new GraphQLObjectType({
  name: 'MedicalRecord',
  description: 'Medical record for a pet',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    diagnosis: { type: GraphQLString },
    treatment: { type: GraphQLString },
    medications: { type: new GraphQLList(GraphQLString) },
    notes: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    pet: { type: new GraphQLNonNull(Pet) },
    veterinarian: { type: new GraphQLNonNull(Employee) },
    appointment: { type: Appointment },
  }),
})

const Product: GraphQLObjectType = new GraphQLObjectType({
  name: 'Product',
  description: 'A product sold by the veterinary office',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    category: { type: new GraphQLNonNull(ProductCategory) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    stockQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    sku: { type: GraphQLString },
    isActive: { type: new GraphQLNonNull(GraphQLBoolean) },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
  }),
})

const OrderItem: GraphQLObjectType = new GraphQLObjectType({
  name: 'OrderItem',
  description: 'An item in an order',
  fields: () => ({
    product: { type: new GraphQLNonNull(Product) },
    quantity: { type: new GraphQLNonNull(GraphQLInt) },
    unitPrice: { type: new GraphQLNonNull(GraphQLFloat) },
    totalPrice: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
})

const Order: GraphQLObjectType = new GraphQLObjectType({
  name: 'Order',
  description: 'An order for products',
  interfaces: [Node, Timestamped],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    orderNumber: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(OrderStatus) },
    totalAmount: { type: new GraphQLNonNull(GraphQLFloat) },
    orderDate: { type: new GraphQLNonNull(dateTimeScalar) },
    shippedDate: { type: dateTimeScalar },
    deliveredDate: { type: dateTimeScalar },
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
    updatedAt: { type: new GraphQLNonNull(dateTimeScalar) },
    client: { type: new GraphQLNonNull(Client) },
    items: {
      type: new GraphQLList(OrderItem),
      resolve: () => [],
    },
  }),
})

const Schedule: GraphQLObjectType = new GraphQLObjectType({
  name: 'Schedule',
  description: 'Employee work schedule',
  interfaces: [Node],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    employee: { type: new GraphQLNonNull(Employee) },
    dayOfWeek: { type: new GraphQLNonNull(GraphQLString) },
    startTime: { type: new GraphQLNonNull(GraphQLString) },
    endTime: { type: new GraphQLNonNull(GraphQLString) },
    isRecurring: { type: new GraphQLNonNull(GraphQLBoolean) },
  }),
})

// Root Query Type - Custom name
const VetQueries = new GraphQLObjectType({
  name: 'VetQueries',
  description: 'Root query type for veterinary office operations',
  fields: {
    // Client queries
    client: {
      type: Client,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_root, { id }) => ({
        id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
      }),
    },
    clients: {
      type: new GraphQLList(Client),
      args: {
        search: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      resolve: () => [],
    },
    // Pet queries
    pet: {
      type: Pet,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    pets: {
      type: new GraphQLList(Pet),
      args: {
        clientId: { type: GraphQLID },
        species: { type: PetSpecies },
        limit: { type: GraphQLInt },
      },
      resolve: () => [],
    },
    // Employee queries
    employee: {
      type: Employee,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    employees: {
      type: new GraphQLList(Employee),
      args: {
        role: { type: EmployeeRole },
        isActive: { type: GraphQLBoolean },
      },
      resolve: () => [],
    },
    // Appointment queries
    appointment: {
      type: Appointment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    appointments: {
      type: new GraphQLList(Appointment),
      args: {
        date: { type: dateTimeScalar },
        veterinarianId: { type: GraphQLID },
        status: { type: AppointmentStatus },
      },
      resolve: () => [],
    },
    // Product queries
    product: {
      type: Product,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    products: {
      type: new GraphQLList(Product),
      args: {
        category: { type: ProductCategory },
        inStock: { type: GraphQLBoolean },
      },
      resolve: () => [],
    },
    // Order queries
    order: {
      type: Order,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    orders: {
      type: new GraphQLList(Order),
      args: {
        clientId: { type: GraphQLID },
        status: { type: OrderStatus },
      },
      resolve: () => [],
    },
  },
})

// Root Mutation Type - Custom name
const VetOperations = new GraphQLObjectType({
  name: 'VetOperations',
  description: 'Root mutation type for veterinary office operations',
  fields: {
    // Client mutations
    createClient: {
      type: Client,
      args: {
        input: { type: new GraphQLNonNull(CreateClientInput) },
      },
      resolve: (_root, { input }) => ({
        id: '1',
        ...input,
      }),
    },
    updateClient: {
      type: Client,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: emailScalar },
        phone: { type: phoneNumberScalar },
        address: { type: GraphQLString },
      },
      resolve: () => null,
    },
    // Pet mutations
    createPet: {
      type: Pet,
      args: {
        input: { type: new GraphQLNonNull(CreatePetInput) },
      },
      resolve: (_root, { input }) => ({
        id: '1',
        ...input,
      }),
    },
    updatePet: {
      type: Pet,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        breed: { type: GraphQLString },
        age: { type: GraphQLInt },
        weight: { type: GraphQLFloat },
      },
      resolve: () => null,
    },
    // Employee mutations
    createEmployee: {
      type: Employee,
      args: {
        input: { type: new GraphQLNonNull(CreateEmployeeInput) },
      },
      resolve: (_root, { input }) => ({
        id: '1',
        ...input,
        isActive: true,
      }),
    },
    updateEmployee: {
      type: Employee,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        role: { type: EmployeeRole },
        salary: { type: GraphQLFloat },
        isActive: { type: GraphQLBoolean },
      },
      resolve: () => null,
    },
    // Appointment mutations
    scheduleAppointment: {
      type: Appointment,
      args: {
        input: { type: new GraphQLNonNull(CreateAppointmentInput) },
      },
      resolve: (_root, { input }) => ({
        id: '1',
        ...input,
        status: 'SCHEDULED',
      }),
    },
    updateAppointment: {
      type: Appointment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: AppointmentStatus },
        scheduledAt: { type: dateTimeScalar },
        notes: { type: GraphQLString },
      },
      resolve: () => null,
    },
    cancelAppointment: {
      type: Appointment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: () => null,
    },
    // Product mutations
    createProduct: {
      type: Product,
      args: {
        input: { type: new GraphQLNonNull(CreateProductInput) },
      },
      resolve: (_root, { input }) => ({
        id: '1',
        ...input,
        isActive: true,
      }),
    },
    updateProduct: {
      type: Product,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        price: { type: GraphQLFloat },
        stockQuantity: { type: GraphQLInt },
        isActive: { type: GraphQLBoolean },
      },
      resolve: () => null,
    },
    // Order mutations
    createOrder: {
      type: Order,
      args: {
        clientId: { type: new GraphQLNonNull(GraphQLID) },
        items: { type: new GraphQLList(GraphQLString) }, // Simplified for demo
      },
      resolve: () => null,
    },
    updateOrderStatus: {
      type: Order,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(OrderStatus) },
      },
      resolve: () => null,
    },
  },
})

// Create and export the schema with custom root type names
export const veterinaryOfficeSchema = new GraphQLSchema({
  query: VetQueries,
  mutation: VetOperations,
  description:
    'Veterinary office GraphQL schema with custom root types and no subscriptions',
})