import {
  Repository,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  DeepPartial,
  ObjectLiteral,
} from 'typeorm';

/**
 * Abstract base repository providing common CRUD operations for all entities.
 *
 * This class implements the repository pattern with TypeORM, providing a consistent
 * interface for data access across all feature modules. It encapsulates common
 * database operations and can be extended by concrete repositories to add
 * domain-specific queries.
 *
 * @template T - The entity type that extends ObjectLiteral
 * @abstract
 * @example
 * class UserRepository extends BaseAbstractRepository<User> {
 *   constructor(dataSource: DataSource) {
 *     super(User, dataSource.manager);
 *   }
 * }
 */
export abstract class BaseAbstractRepository<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  /**
   * Creates and persists a new entity.
   *
   * This method handles both entity instantiation and persistence in a single
   * transaction, ensuring data consistency.
   *
   * @param {DeepPartial<T>} data - Partial entity data to create
   * @returns {Promise<T>} The created and persisted entity with generated fields (id, timestamps)
   * @throws {QueryFailedError} If database constraints are violated
   * @example
   * const user = await userRepository.create({
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Finds a single entity based on the provided options.
   *
   * Provides flexible querying with support for relations, selection, and ordering.
   * Returns null instead of throwing when no entity is found.
   *
   * @param {FindOneOptions<T>} options - TypeORM find options including where conditions, relations, etc.
   * @returns {Promise<T | null>} The found entity or null if not found
   * @example
   * const user = await userRepository.findOne({
   *   where: { email: 'user@example.com' },
   *   relations: ['profile', 'posts']
   * });
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  /**
   * Finds all entities matching the provided options.
   *
   * Supports pagination, filtering, sorting, and relation loading. Returns empty
   * array when no entities match the criteria.
   *
   * @param {FindManyOptions<T>} [options] - Optional TypeORM find options for filtering, ordering, pagination
   * @returns {Promise<T[]>} Array of found entities (empty array if none found)
   * @example
   * const users = await userRepository.findAll({
   *   where: { isActive: true },
   *   order: { createdAt: 'DESC' },
   *   skip: 0,
   *   take: 10
   * });
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  /**
   * Finds an entity by its primary key (id).
   *
   * Convenience method for finding entities by their UUID. Internally uses findOne
   * with appropriate where clause.
   *
   * @param {string} id - The UUID of the entity to find
   * @returns {Promise<T | null>} The found entity or null if not found
   * @example
   * const user = await userRepository.findById('123e4567-e89b-12d3-a456-426614174000');
   * if (!user) {
   *   throw new NotFoundException('User not found');
   * }
   */
  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  /**
   * Updates an existing entity by its id.
   *
   * Performs a partial update, only modifying provided fields. Automatically
   * handles updatedAt timestamp. Returns the updated entity after refetching
   * to ensure all computed fields are current.
   *
   * @param {string} id - The UUID of the entity to update
   * @param {DeepPartial<T>} data - Partial entity data containing fields to update
   * @returns {Promise<T | null>} The updated entity or null if not found
   * @throws {QueryFailedError} If database constraints are violated
   * @example
   * const updatedUser = await userRepository.update(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   { name: 'Jane Doe', isActive: false }
   * );
   */
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  /**
   * Deletes an entity by its id.
   *
   * Performs a hard delete, permanently removing the entity from the database.
   * For soft deletes, consider adding a deletedAt field and using update instead.
   *
   * @param {string} id - The UUID of the entity to delete
   * @returns {Promise<boolean>} true if the entity was deleted, false if not found
   * @example
   * const wasDeleted = await userRepository.delete('123e4567-e89b-12d3-a456-426614174000');
   * if (!wasDeleted) {
   *   throw new NotFoundException('User not found');
   * }
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
