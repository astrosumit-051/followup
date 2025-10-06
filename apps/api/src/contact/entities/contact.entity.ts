import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Priority } from '../enums/priority.enum';
import { Gender } from '../enums/gender.enum';

/**
 * Contact GraphQL Entity
 *
 * Represents a contact in the GraphQL schema with all fields
 * matching the Prisma Contact model.
 */
@ObjectType()
export class Contact {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => Priority)
  priority!: Priority;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field({ nullable: true })
  birthday?: Date;

  @Field({ nullable: true })
  profilePicture?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lastContactedAt?: Date;

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
