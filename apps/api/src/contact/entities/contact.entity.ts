import { ObjectType, Field, ID, registerEnumType, HideField } from '@nestjs/graphql';
import { Priority as PrismaEnumPriority } from '@cordiq/database';
import { Priority } from '../enums/priority.enum';
import { Gender as PrismaEnumGender } from '@cordiq/database';
import { Gender } from '../enums/gender.enum';

/**
 * Contact GraphQL Entity
 *
 * Represents a contact in the GraphQL schema with all fields
 * matching the Prisma Contact model.
 *
 * Security:
 * - userId is hidden from GraphQL schema to prevent information leakage
 * - Only accessible internally for authorization checks
 */
@ObjectType()
export class Contact {
  @Field(() => ID)
  id!: string;

  /**
   * User ID for authorization (hidden from GraphQL schema)
   *
   * @remarks
   * This field is used internally for ownership verification but is
   * explicitly hidden from the GraphQL schema using @HideField() to prevent
   * information leakage about user ownership patterns.
   */
  @HideField()
  userId!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string | null;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  linkedInUrl?: string | null;

  @Field({ nullable: true })
  company?: string | null;

  @Field({ nullable: true })
  industry?: string | null;

  @Field({ nullable: true })
  role?: string | null;

  @Field(() => Priority)
  priority!: PrismaEnumPriority;

  @Field(() => Gender, { nullable: true })
  gender?: PrismaEnumGender | null;

  @Field({ nullable: true })
  birthday?: Date | null;

  @Field({ nullable: true })
  profilePicture?: string | null;

  @Field({ nullable: true })
  notes?: string | null;

  @Field({ nullable: true })
  lastContactedAt?: Date | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

// Register Priority enum for GraphQL
registerEnumType(Priority, {
  name: 'Priority',
  description: 'Contact priority levels',
});

// Register Gender enum for GraphQL
registerEnumType(Gender, {
  name: 'Gender',
  description: 'Contact gender options',
});
