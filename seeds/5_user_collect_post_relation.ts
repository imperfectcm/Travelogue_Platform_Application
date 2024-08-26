import { Knex } from "knex";

export async function seed(knex: Knex) {
  const txn = await knex.transaction();

  try {
    // Deletes ALL existing entries
    await txn("user_collect_post_relation").del();

    // Inserts seed entries
    await txn("user_collect_post_relation").insert([
      { post_id: 1, user_id: 2 },
      { post_id: 1, user_id: 3 },
      { post_id: 2, user_id: 2 },
      { post_id: 3, user_id: 1 },
      { post_id: 4, user_id: 1 },
      { post_id: 4, user_id: 3 },
    ]);
    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
