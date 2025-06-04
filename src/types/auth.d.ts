import { Role } from 'generated/prisma';

export type JwtPayload = {
  id: string;
  email: string;
  role: Role;
};
