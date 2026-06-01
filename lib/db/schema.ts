import { pgTable, text, integer, boolean, jsonb, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// article_types
export const articleTypes = pgTable('article_types', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
}, (table) => ({
  nameIdx: index('article_types_name_idx').on(table.name),
  slugIdx: index('article_types_slug_idx').on(table.slug),
}));

// category_types
export const categoryTypes = pgTable('category_types', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
}, (table) => ({
  slugIdx: index('category_types_slug_idx').on(table.slug),
}));

// categories
export const categories = pgTable('categories', {
  id: integer('id').primaryKey(),
  categoryTypeId: integer('category_type_id').notNull().references(() => categoryTypes.id),
  parentId: integer('parent_id'),
  name: jsonb('name').notNull(),
  sort: integer('sort').default(0),
  isRoot: boolean('is_root').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  categoryTypeIdIdx: index('categories_category_type_id_idx').on(table.categoryTypeId),
  parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
  isActiveIdx: index('categories_is_active_idx').on(table.isActive),
}));

// employees
export const employees = pgTable('employees', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  position: text('position'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('employees_email_idx').on(table.email),
}));

// tags
export const tags = pgTable('tags', {
  id: integer('id').primaryKey(),
  name: jsonb('name').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  isActiveIdx: index('tags_is_active_idx').on(table.isActive),
}));

// article_tag (pivot)
export const articleTag = pgTable('article_tag', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  articleIdIdx: index('article_tag_article_id_idx').on(table.articleId),
  tagIdIdx: index('article_tag_tag_id_idx').on(table.tagId),
}));

// articles
export const articles = pgTable('articles', {
  id: integer('id').primaryKey(),
  articleTypeId: integer('article_type_id').notNull().references(() => articleTypes.id),
  categoryId: integer('category_id').references(() => categories.id),
  authorId: integer('author_id').notNull().references(() => employees.id),
  image: text('image'),
  title: jsonb('title').notNull(),
  summary: jsonb('summary'),
  content: jsonb('content'),
  hit: integer('hit').default(0),
  isActive: boolean('is_active').default(true),
  publishedAt: timestamp('published_at'),
  sort: integer('sort').default(0),
  year: integer('year'),
  files: text('files'),
  originalFiles: text('original_files'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  articleTypeIdIdx: index('articles_article_type_id_idx').on(table.articleTypeId),
  categoryIdIdx: index('articles_category_id_idx').on(table.categoryId),
  authorIdIdx: index('articles_author_id_idx').on(table.authorId),
  isActiveIdx: index('articles_is_active_idx').on(table.isActive),
  publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
}));

// images
export const images = pgTable('images', {
  id: integer('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  description: jsonb('description'),
  sort: integer('sort').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  articleIdIdx: index('images_article_id_idx').on(table.articleId),
}));

// Zod schemas for validation (optional)
export const insertArticleTypeSchema = createInsertSchema(articleTypes).pick({
  name: true,
  slug: true,
});
export const selectArticleTypeSchema = createSelectSchema(articleTypes);

export const insertCategoryTypeSchema = createInsertSchema(categoryTypes).pick({
  name: true,
  slug: true,
});
export const selectCategoryTypeSchema = createSelectSchema(categoryTypes);

export const insertCategorySchema = createInsertSchema(categories).pick({
  categoryTypeId: true,
  parentId: true,
  name: true,
  sort: true,
  isRoot: true,
  isActive: true,
});
export const selectCategorySchema = createSelectSchema(categories);

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  name: true,
  email: true,
  position: true,
});
export const selectEmployeeSchema = createSelectSchema(employees);

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  isActive: true,
});
export const selectTagSchema = createSelectSchema(tags);

export const insertArticleSchema = createInsertSchema(articles).pick({
  articleTypeId: true,
  categoryId: true,
  authorId: true,
  image: true,
  title: true,
  summary: true,
  content: true,
  isActive: true,
  publishedAt: true,
  sort: true,
  year: true,
  files: true,
  originalFiles: true,
});
export const selectArticleSchema = createSelectSchema(articles);

export const insertImageSchema = createInsertSchema(images).pick({
  articleId: true,
  path: true,
  description: true,
  sort: true,
});
export const selectImageSchema = createSelectSchema(images);

export const insertArticleTagSchema = createInsertSchema(articleTag).pick({
  articleId: true,
  tagId: true,
});
export const selectArticleTagSchema = createSelectSchema(articleTag);
