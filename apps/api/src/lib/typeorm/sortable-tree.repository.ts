import {
  FindManyOptions,
  FindOptionsUtils,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  ObjectLiteral,
  SelectQueryBuilder,
  TreeRepository,
  TreeRepositoryUtils,
  TypeORMError,
} from "typeorm";

export interface FindTreeOptions<Entity extends ObjectLiteral> {
  where?: FindOptionsWhere<Entity>;

  order?: FindManyOptions<Entity>["order"];

  /**
   * Indicates what relations of entity should be loaded (simplified left join form).
   */
  relations?: string[];

  /**
   * When loading a tree from a TreeRepository, limits the depth of the descendents loaded
   */
  depth?: number;
}

export interface SortableTreeRepository<
  Entity extends ObjectLiteral,
> extends TreeRepository<Entity> {
  this: TreeRepository<Entity>;
  moveUp(entity: Entity): Promise<void>;
  moveDown(entity: Entity): Promise<void>;
  findDescendantsTree(
    entity: Entity,
    options?: FindTreeOptions<Entity>,
  ): Promise<Entity>;
}

export const sortableTreeRepositoryMethods: any = {
  async moveUp(entity: ObjectLiteral) {
    if (this.metadata.treeType === "nested-set") {
      const lftPropertyName = this.metadata.nestedSetLeftColumn!.propertyPath;
      const rgtPropertyName = this.metadata.nestedSetRightColumn!.propertyPath;
      const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
      const parentPropertyName =
        joinColumn?.givenDatabaseName || joinColumn?.databaseName;

      const primaryMetadataColumns = this.metadata.columns.filter(
        (column: any) => column.isPrimary,
      );

      if (primaryMetadataColumns.length !== 1) {
        throw new TypeORMError("Unsupported composite primary key");
      }

      const primaryPropertyName = primaryMetadataColumns[0]!.propertyPath;

      const target = await this.createQueryBuilder()
        .select("*")
        .where(`${primaryPropertyName} = :primaryPropertyName`, {
          primaryPropertyName: entity[primaryPropertyName],
        })
        .getRawOne();

      const preNode = await this.createQueryBuilder()
        .select("*")
        .setFindOptions({
          where: {
            [lftPropertyName]: LessThan(target[lftPropertyName]),
            [parentPropertyName!]: target[parentPropertyName!],
          } as any,
          order: { [lftPropertyName]: "DESC" } as any,
        })
        .getRawOne();

      if (!preNode) throw new TypeORMError("This node can not move up");

      const valueAdd = target[rgtPropertyName] - preNode[rgtPropertyName];
      const valueMinus = target[lftPropertyName] - preNode[lftPropertyName];

      const plusDatas = await this.find({
        where: {
          [lftPropertyName]: MoreThanOrEqual(preNode[lftPropertyName]),
          [rgtPropertyName]: LessThanOrEqual(preNode[rgtPropertyName]),
        } as any,
        select: [primaryPropertyName],
      });

      const minusDatas = await this.find({
        where: {
          [lftPropertyName]: MoreThanOrEqual(target[lftPropertyName]),
          [rgtPropertyName]: LessThanOrEqual(target[rgtPropertyName]),
        } as any,
        select: [primaryPropertyName],
      });

      if (plusDatas?.length > 0) {
        await this.createQueryBuilder()
          .update()
          .set({
            [lftPropertyName]: () => `${lftPropertyName} + :valueAdd`,
            [rgtPropertyName]: () => `${rgtPropertyName} + :valueAdd`,
          } as any)
          .setParameters({
            valueAdd,
          })
          .where({
            [primaryPropertyName]: In(
              plusDatas.map((i: any) => i[primaryPropertyName]),
            ),
          })
          .execute();
      }

      if (minusDatas.length > 0) {
        await this.createQueryBuilder()
          .update()
          .set({
            [lftPropertyName]: () => `${lftPropertyName} - :valueMinus`,
            [rgtPropertyName]: () => `${rgtPropertyName} - :valueMinus`,
          } as any)
          .setParameters({
            valueMinus,
          })
          .where({
            [primaryPropertyName]: In(
              minusDatas.map((i: any) => i[primaryPropertyName]),
            ),
          })
          .execute();
      }
      return;
    }

    throw new TypeORMError(`move up only support in nested-set tree entities`);
  },

  async moveDown(entity: ObjectLiteral) {
    if (this.metadata.treeType === "nested-set") {
      const lftPropertyName = this.metadata.nestedSetLeftColumn!.propertyPath;
      const rgtPropertyName = this.metadata.nestedSetRightColumn!.propertyPath;
      const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
      const parentPropertyName =
        joinColumn?.givenDatabaseName || joinColumn?.databaseName;

      const primaryMetadataColumns = this.metadata.columns.filter(
        (column: any) => column.isPrimary,
      );

      if (primaryMetadataColumns.length !== 1) {
        throw new TypeORMError("Unsupported composite primary key");
      }

      const primaryPropertyName = primaryMetadataColumns[0]!.propertyPath;

      const target = await this.createQueryBuilder()
        .select("*")
        .where(`${primaryPropertyName} = :primaryPropertyName`, {
          primaryPropertyName: entity[primaryPropertyName],
        })
        .getRawOne();

      const nextNode = await this.createQueryBuilder()
        .select("*")
        .setFindOptions({
          where: {
            [lftPropertyName]: MoreThan(target[rgtPropertyName]),
            [parentPropertyName!]: target[parentPropertyName!],
          } as any,
          order: { [lftPropertyName]: "ASC" } as any,
        })
        .getRawOne();

      if (!nextNode) throw new TypeORMError("This node can not move down");

      const valueAdd = nextNode[rgtPropertyName] - target[rgtPropertyName];
      const valueMinus = nextNode[lftPropertyName] - target[lftPropertyName];

      const plusDatas = await this.find({
        where: {
          [lftPropertyName]: MoreThanOrEqual(target[lftPropertyName]),
          [rgtPropertyName]: LessThanOrEqual(target[rgtPropertyName]),
        } as any,
        select: [primaryPropertyName],
      });

      const minusDatas = await this.find({
        where: {
          [lftPropertyName]: MoreThanOrEqual(nextNode[lftPropertyName]),
          [rgtPropertyName]: LessThanOrEqual(nextNode[rgtPropertyName]),
        } as any,
        select: [primaryPropertyName],
      });

      if (plusDatas?.length > 0) {
        await this.createQueryBuilder()
          .update()
          .set({
            [lftPropertyName]: () => `${lftPropertyName} + :valueAdd`,
            [rgtPropertyName]: () => `${rgtPropertyName} + :valueAdd`,
          } as any)
          .setParameters({
            valueAdd,
          })
          .where({
            [primaryPropertyName]: In(
              plusDatas.map((i: any) => i[primaryPropertyName]),
            ),
          })
          .execute();
      }

      if (minusDatas.length > 0) {
        await this.createQueryBuilder()
          .update()
          .set({
            [lftPropertyName]: () => `${lftPropertyName} - :valueMinus`,
            [rgtPropertyName]: () => `${rgtPropertyName} - :valueMinus`,
          } as any)
          .setParameters({
            valueMinus,
          })
          .where({
            [primaryPropertyName]: In(
              minusDatas.map((i: any) => i[primaryPropertyName]),
            ),
          })
          .execute();
      }
      return;
    }

    throw new TypeORMError(`move up only support in nested-set tree entities`);
  },

  async findDescendantsTree<Entity extends ObjectLiteral>(
    entity: Entity,
    options?: FindTreeOptions<Entity>,
  ) {
    // todo: throw exception if there is no column of this relation?

    const qb: SelectQueryBuilder<any> = this.createDescendantsQueryBuilder(
      "treeEntity",
      "treeClosure",
      entity,
    );

    if (options?.where) {
      qb.where(options.where);
    }

    if (this.metadata.treeType === "nested-set") {
      const lftPropertyName = this.metadata.nestedSetLeftColumn!.propertyPath;
      qb.orderBy(`treeEntity.${lftPropertyName}`, "ASC");
    }

    if (options?.order) {
      qb.setFindOptions({ order: options.order });
    }

    FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);

    const entities = await qb.getRawAndEntities();

    const relationMaps = TreeRepositoryUtils.createRelationMaps(
      this.manager,
      this.metadata,
      "treeEntity",
      entities.raw,
    );

    TreeRepositoryUtils.buildChildrenEntityTree(
      this.metadata,
      entity,
      entities.entities,
      relationMaps,
      {
        depth: -1,
        ...options,
      },
    );

    return entity;
  },
};
