import { Knex } from "knex";

export async function seed(knex: Knex) {
  const txn = await knex.transaction();

  try {
    // Deletes ALL existing entries
    await txn("comments").del();

    // Inserts seed entries
    await txn("comments").insert([
      { post_id: 1, user_id: 2, comment: "this is really great" },
      { post_id: 2, user_id: 2, comment: "this is really nice" },
      { post_id: 3, user_id: 1, comment: "this is really beautiful" },
      { post_id: 4, user_id: 1, comment: "Amazing!!!!!!" },
    ]);
    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
