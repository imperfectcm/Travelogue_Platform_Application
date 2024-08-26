import type { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments();
    table.string("username", 255).unique().notNullable();
    table.string("email", 255).unique().notNullable();
    table.string("profile_pic", 255).nullable;
    table.string("blog_image", 255).nullable;
    table.string("password", 255).notNullable();
    table.text("caption").nullable();
    table.string("living_location", 255).nullable();
    table.string("emailToken", 255).nullable();
    table.enum("status", ["activated", "pending"]).notNullable();
    table.string("emailtoken", 255).nullable;
    table.timestamps(false, true);
  });

  await knex.schema.createTable("posts", (table) => {
    table.increments();
    table.string("post_image", 255).nullable;
    table.string("title", 255).notNullable;
    table.date("departure_date").nullable;
    table.integer("travel_days").nullable;
    table.integer("traveller_counts").nullable;
    table.integer("average_expenditure").nullable;
    table.string("content_json", 255).nullable;
    table.string("content_html", 255).nullable;
    table.enum("status", ["public", "private"]).notNullable();
    table.timestamps(false, true);
    table.integer("user_id");
    table.foreign("user_id").references("users.id");
  });

  await knex.schema.createTable("nation_tags", (table) => {
    table.increments();
    table.string("tag_name", 255).notNullable();
    table.timestamps(false, true);
  });

  await knex.schema.createTable("other_tags", (table) => {
    table.increments();
    table.integer("post_id");
    table.string("tag_name", 255).notNullable;
    table
      .foreign("post_id")
      .references("posts.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.timestamps(false, true);
  });

  await knex.schema.createTable("post_nation_tag_relation", (table) => {
    table.increments();
    table.integer("post_id");
    table.integer("nation_tag_id");
    table
      .foreign("post_id")
      .references("posts.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.foreign("nation_tag_id").references("nation_tags.id");
    table.timestamps(false, true);
  });

  await knex.schema.createTable("comments", (table) => {
    table.increments();
    table.integer("post_id").notNullable;
    table.integer("user_id").notNullable;
    table
      .foreign("post_id")
      .references("posts.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.foreign("user_id").references("users.id");
    table.text("comment").notNullable;
    table.timestamps(false, true);
  });

  await knex.schema.createTable("user_collect_post_relation", (table) => {
    table.increments();
    table.integer("post_id");
    table.integer("user_id");
    table
      .foreign("post_id")
      .references("posts.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.foreign("user_id").references("users.id");
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTableIfExists("user_collect_post_relation")
    .dropTableIfExists("comments")
    .dropTableIfExists("post_nation_tag_relation")
    .dropTableIfExists("post_other_tag_relation")
    .dropTableIfExists("other_tags")
    .dropTableIfExists("nation_tags")
    .dropTableIfExists("posts")
    .dropTableIfExists("users");
}
