import { Knex } from "knex";

export async function seed(knex: Knex) {
  const txn = await knex.transaction();

  try {
    // Deletes ALL existing entries
    await txn("post_nation_tag_relation").del();

    // Inserts seed entries
    await txn("post_nation_tag_relation").insert([
      { post_id: 1, nation_tag_id: 110 },
      { post_id: 2, nation_tag_id: 110 },
      { post_id: 3, nation_tag_id: 110 },
      { post_id: 4, nation_tag_id: 110 },
      { post_id: 5, nation_tag_id: 108 },
      { post_id: 6, nation_tag_id: 222 },
      { post_id: 7, nation_tag_id: 108 },
      { post_id: 8, nation_tag_id: 229 },
      { post_id: 9, nation_tag_id: 229 },
      { post_id: 10, nation_tag_id: 81 },
      { post_id: 11, nation_tag_id: 81 },
      { post_id: 12, nation_tag_id: 81 },
      { post_id: 13, nation_tag_id: 110 },
      { post_id: 14, nation_tag_id: 108 },
      { post_id: 15, nation_tag_id: 222 },
      { post_id: 16, nation_tag_id: 81 },
      { post_id: 17, nation_tag_id: 208 },
      { post_id: 18, nation_tag_id: 108 },
      { post_id: 19, nation_tag_id: 230 },
      { post_id: 20, nation_tag_id: 229 },
      { post_id: 21, nation_tag_id: 81 },
    ]);
    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
