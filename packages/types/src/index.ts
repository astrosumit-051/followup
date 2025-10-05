// Shared TypeScript types and interfaces for RelationHub

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum EmailProvider {
  GMAIL = 'GMAIL',
  OUTLOOK = 'OUTLOOK',
  SMTP = 'SMTP',
}

export enum ActivityType {
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  CALL = 'CALL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedInUrl: string | null;
  company: string | null;
  industry: string | null;
  role: string | null;
  priority: Priority;
  gender: Gender | null;
  birthday: Date | null;
  profilePicture: string | null;
  notes: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Email {
  id: string;
  userId: string;
  contactId: string;
  subject: string;
  body: string;
  sentAt: Date;
  openedAt: Date | null;
  clickedAt: Date | null;
  provider: EmailProvider;
}

export interface Activity {
  id: string;
  userId: string;
  contactId: string;
  type: ActivityType;
  description: string;
  occurredAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  contactId: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}
