import { Knex } from "knex";

export async function seed(knex: Knex) {
  const txn = await knex.transaction();

  try {
    // Deletes ALL existing entries
    await txn("other_tags").del();

    // Inserts seed entries
    await txn("other_tags").insert([
      { post_id: 1, tag_name: "food" },
      { post_id: 1, tag_name: "Tokyo" },
      { post_id: 2, tag_name: "food" },
      { post_id: 2, tag_name: "Tokyo" },
      { post_id: 3, tag_name: "food" },
      { post_id: 3, tag_name: "Kyoto" },
      { post_id: 3, tag_name: "Shrine" },
      { post_id: 3, tag_name: "Red leaf" },
      { post_id: 4, tag_name: "food" },
      { post_id: 4, tag_name: "Tokyo" },
    ]);
    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
