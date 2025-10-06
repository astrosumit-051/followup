import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@relationhub/database';
import { ContactFilterInput } from './dto/contact-filter.input';
import { ContactPaginationInput } from './dto/contact-pagination.input';

/**
 * Contact Service
 *
 * Handles all business logic for contact management.
 * Enforces user ownership and data validation.
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
    return this.prisma.contact.findUnique({
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
   */
  async findAll(
    userId: string,
    filters: ContactFilterInput,
    pagination: ContactPaginationInput,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    // Build where clause
    const where: any = { userId };

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

    // Apply search across multiple fields
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Enforce pagination limit (max 100, default 20)
    const limit = Math.min(pagination.limit || 20, 100);

    // Build pagination parameters
    const paginationParams: any = {
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    };

    if (pagination.cursor) {
      paginationParams.cursor = { id: pagination.cursor };
      paginationParams.skip = 1; // Skip the cursor itself
    }

    // Execute queries
    const [nodes, totalCount] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        ...paginationParams,
      }),
      this.prisma.contact.count({ where }),
    ]);

    // Calculate pagination info
    const hasNextPage = totalCount > (nodes.length + (pagination.cursor ? 1 : 0));
    const startCursor = nodes.length > 0 ? nodes[0].id : null;
    const endCursor = nodes.length > 0 ? nodes[nodes.length - 1].id : null;

    return {
      nodes,
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
  async create(dto: any, userId: string) {
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
   * @throws Error if contact not found or user doesn't own it
   */
  async update(id: string, dto: any, userId: string) {
    // Verify ownership first
    const contact = await this.findOne(id, userId);
    if (!contact) {
      throw new Error('Contact not found or unauthorized');
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
   * @throws Error if contact not found or user doesn't own it
   */
  async delete(id: string, userId: string): Promise<boolean> {
    // Verify ownership first
    const contact = await this.findOne(id, userId);
    if (!contact) {
      throw new Error('Contact not found or unauthorized');
    }

    await this.prisma.contact.delete({
      where: { id },
    });

    return true;
  }
}
