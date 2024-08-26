import { Knex } from "knex";
import nationArray from "../countries/countries";

export async function seed(knex: Knex) {
  const txn = await knex.transaction();

  try {
    for (let el of nationArray) {
      await txn("nation_tags").insert({
        tag_name: el,
        created_at: new Date(),
      });
    }

    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
