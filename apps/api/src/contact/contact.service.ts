import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@relationhub/database';
import { ContactFilterInput } from './dto/contact-filter.input';
import { ContactPaginationInput } from './dto/contact-pagination.input';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

// Allowed fields for sorting
const ALLOWED_SORT_FIELDS = [
  'name',
  'email',
  'company',
  'createdAt',
  'updatedAt',
  'lastContactedAt',
  'priority',
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

/**
 * Contact Service
 *
 * Handles all business logic for contact management.
 * Enforces user ownership and data validation.
 *
 * @remarks
 * All methods enforce user ownership - contacts can only be accessed
 * by the user who created them. Unauthorized access throws NotFoundException.
 *
 * @example
 * ```typescript
 * // Find all contacts for a user
 * const result = await contactService.findAll(userId, {}, { limit: 20 });
 * console.log(result.nodes); // Contact[]
 * console.log(result.pageInfo.hasNextPage); // boolean
 * ```
 */
@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find a single contact by ID
   *
   * @param id - Contact ID
   * @param userId - User ID (for ownership verification)
   * @returns Contact if found and owned by user, null otherwise
   */
  async findOne(id: string, userId: string) {
    return this.prisma.contact.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Find all contacts with filtering, sorting, and pagination
   *
   * @param userId - User ID (for ownership filtering)
   * @param filters - Filter criteria
   * @param pagination - Pagination parameters
   * @param sortBy - Field to sort by (default: createdAt)
   * @param sortOrder - Sort order (default: desc)
   * @returns Paginated contact list with metadata
   * @throws BadRequestException if invalid sort field provided
   */
  async findAll(
    userId: string,
    filters: ContactFilterInput,
    pagination: ContactPaginationInput,
    sortBy: SortField = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    // Validate sort field
    if (!ALLOWED_SORT_FIELDS.includes(sortBy as SortField)) {
      throw new BadRequestException(
        `Invalid sort field: ${sortBy}. Allowed fields: ${ALLOWED_SORT_FIELDS.join(', ')}`,
      );
    }

    // Build where clause with proper Prisma types
    const where: Prisma.ContactWhereInput = { userId };
    const andConditions: Prisma.ContactWhereInput[] = [];

    // Apply filters
    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.company) {
      where.company = { contains: filters.company, mode: 'insensitive' };
    }

    if (filters.industry) {
      where.industry = { contains: filters.industry, mode: 'insensitive' };
    }

    if (filters.role) {
      where.role = { contains: filters.role, mode: 'insensitive' };
    }

    // Apply search across multiple fields (combine with AND to avoid conflicts)
    if (filters.search) {
      andConditions.push({
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    // Combine AND conditions if any
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Enforce pagination limit (max 100, default 20)
    const limit = Math.min(pagination.limit || 20, 100);

    // Build pagination parameters with proper Prisma types
    const findManyArgs: Prisma.ContactFindManyArgs = {
      where,
      take: limit + 1, // Fetch one extra to determine hasNextPage
      orderBy: { [sortBy]: sortOrder },
    };

    if (pagination.cursor) {
      findManyArgs.cursor = { id: pagination.cursor };
      findManyArgs.skip = 1; // Skip the cursor itself
    }

    // Execute queries
    const [fetchedNodes, totalCount] = await Promise.all([
      this.prisma.contact.findMany(findManyArgs),
      this.prisma.contact.count({ where }),
    ]);

    // Check if there are more results (using take: limit + 1 pattern)
    const hasNextPage = fetchedNodes.length > limit;
    const nodes = hasNextPage ? fetchedNodes.slice(0, limit) : fetchedNodes;

    // Calculate pagination info
    const startCursor = nodes.length > 0 ? nodes[0].id : null;
    const endCursor = nodes.length > 0 ? nodes[nodes.length - 1].id : null;

    // Create edges for Relay connection spec
    const edges = nodes.map((node) => ({
      node,
      cursor: node.id,
    }));

    return {
      nodes,
      edges,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!pagination.cursor,
        startCursor,
        endCursor,
      },
    };
  }

  /**
   * Create a new contact
   *
   * @param dto - Contact creation data
   * @param userId - User ID (automatically injected)
   * @returns Created contact
   */
  async create(dto: CreateContactDto, userId: string) {
    return this.prisma.contact.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  /**
   * Update an existing contact
   *
   * @param id - Contact ID
   * @param dto - Contact update data
   * @param userId - User ID (for ownership verification)
   * @returns Updated contact
   * @throws NotFoundException if contact not found or user doesn't own it
   */
  async update(id: string, dto: UpdateContactDto, userId: string) {
    // Verify ownership first
    const contact = await this.findOne(id, userId);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a contact
   *
   * @param id - Contact ID
   * @param userId - User ID (for ownership verification)
   * @returns True if deletion successful
   * @throws NotFoundException if contact not found or user doesn't own it
   */
  async delete(id: string, userId: string): Promise<boolean> {
    // Verify ownership first
    const contact = await this.findOne(id, userId);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.prisma.contact.delete({
      where: { id },
    });

    return true;
  }
}
