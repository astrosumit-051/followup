import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './entities/contact.entity';
import { ContactConnection } from './entities/contact-connection.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactFilterInput } from './dto/contact-filter.input';
import { ContactPaginationInput } from './dto/contact-pagination.input';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Contact GraphQL Resolver
 *
 * Handles all GraphQL operations for contact management.
 * All operations are protected by AuthGuard and require authentication.
 *
 * Security:
 * - @UseGuards(AuthGuard): Ensures all requests are authenticated
 * - @CurrentUser(): Extracts authenticated user from JWT token
 * - ValidationPipe: Validates all input DTOs using class-validator
 * - Service layer enforces user ownership on all operations
 *
 * @example
 * ```graphql
 * query {
 *   contacts(filters: { priority: HIGH }, pagination: { limit: 20 }) {
 *     nodes { id name email }
 *     pageInfo { hasNextPage endCursor }
 *   }
 * }
 * ```
 */
@Resolver(() => Contact)
@UseGuards(AuthGuard) // Protect all resolver methods with authentication
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Validate all inputs
export class ContactResolver {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Get all contacts for the authenticated user with filtering and pagination
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param filters - Optional filter criteria (priority, company, search, etc.)
   * @param pagination - Pagination parameters (cursor, limit)
   * @param sortBy - Field to sort by (default: createdAt)
   * @param sortOrder - Sort order (default: desc)
   * @returns Paginated list of contacts with metadata
   */
  @Query(() => ContactConnection, { name: 'contacts' })
  async findAll(
    @CurrentUser() user: any,
    @Args('filters', { type: () => ContactFilterInput, nullable: true })
    filters?: ContactFilterInput,
    @Args('pagination', { type: () => ContactPaginationInput, nullable: true })
    pagination?: ContactPaginationInput,
    @Args('sortBy', { type: () => String, nullable: true, defaultValue: 'createdAt' })
    sortBy?: string,
    @Args('sortOrder', { type: () => String, nullable: true, defaultValue: 'desc' })
    sortOrder?: 'asc' | 'desc',
  ): Promise<ContactConnection> {
    return this.contactService.findAll(
      user.id,
      filters || {},
      pagination || {},
      sortBy as any,
      sortOrder || 'desc',
    );
  }

  /**
   * Get a single contact by ID
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Contact ID
   * @returns Contact if found and owned by user, null otherwise
   */
  @Query(() => Contact, { name: 'contact', nullable: true })
  async findOne(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Contact | null> {
    return this.contactService.findOne(id, user.id);
  }

  /**
   * Create a new contact
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Contact creation data
   * @returns Created contact
   */
  @Mutation(() => Contact)
  async createContact(
    @CurrentUser() user: any,
    @Args('input', { type: () => CreateContactDto }) input: CreateContactDto,
  ): Promise<Contact> {
    return this.contactService.create(input, user.id);
  }

  /**
   * Update an existing contact
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Contact ID to update
   * @param input - Contact update data (partial)
   * @returns Updated contact
   * @throws NotFoundException if contact not found or user doesn't own it
   */
  @Mutation(() => Contact)
  async updateContact(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateContactDto }) input: UpdateContactDto,
  ): Promise<Contact> {
    return this.contactService.update(id, input, user.id);
  }

  /**
   * Delete a contact
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Contact ID to delete
   * @returns True if deletion successful
   * @throws NotFoundException if contact not found or user doesn't own it
   */
  @Mutation(() => Boolean)
  async deleteContact(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.contactService.delete(id, user.id);
  }
}
