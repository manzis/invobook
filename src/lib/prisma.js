// /lib/prisma.js

import { PrismaClient } from '@prisma/client';

// This is a check to see if we are in a development environment.
// In development, Next.js can hot-reload files, which might create
// multiple new PrismaClient instances and exhaust your database connections.
// This code prevents that by storing the client in a global variable.
const client = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = client;

export default client;