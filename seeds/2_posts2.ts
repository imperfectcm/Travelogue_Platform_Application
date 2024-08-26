import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const txn = await knex.transaction();
  // Deletes ALL existing entries
  try {
    // await txn("posts").del();

    // Inserts seed entrie
    await txn("posts").insert([
      {
        user_id: 10,
        post_image: "test_image_post10.jpg",
        title: "Nice trip😍😍",
        departure_date: "2023-04-15",
        content_json: "test12post.json",
        content_html: "test12post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 11,
        post_image: "test_image_post11.jpg",
        title: "Nice trip🚇🚇",
        departure_date: "2023-04-15",
        content_json: "test13post.json",
        content_html: "test13post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 12,
        post_image: "test_image_post12.jpg",
        title: "Nice trip😶‍🌫️😶‍🌫️",
        departure_date: "2023-04-15",
        content_json: "test14post.json",
        content_html: "test14post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 13,
        post_image: "test_image_post13.jpg",
        title: "Nice trip🤡🤡",
        departure_date: "2023-04-15",
        content_json: "test15post.json",
        content_html: "test15post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 14,
        post_image: "test_image_post14.jpg",
        title: "Nice trip🤖🤖",
        departure_date: "2023-04-15",
        content_json: "test16post.json",
        content_html: "test16post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 15,
        post_image: "test_image_post15.jpg",
        title: "Nice trip😎😎",
        departure_date: "2023-04-15",
        content_json: "test17post.json",
        content_html: "test17post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 16,
        post_image: "test_image_post16.jpg",
        title: "Nice trip🎉🤖🤡",
        departure_date: "2023-04-15",
        content_json: "test18post.json",
        content_html: "test18post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 17,
        post_image: "test_image_post17.jpg",
        title: "Nice trip👽🐖✨",
        content_json: "test19post.json",
        content_html: "test19post.html",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 18,
        post_image: "test_image_post18.jpg",
        title: "Nice trip🐳👾🦄",
        departure_date: "2023-04-15",
        content_json: "test20post.json",
        content_html: "test20post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 19,
        post_image: "test_image_post19.jpg",
        title: "Nice trip🐳👾🤩👹",
        departure_date: "2023-04-15",
        content_json: "test21post.json",
        content_html: "test21post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
    ]);

    await txn.commit();
    return;
  } catch (err) {
    console.log(err);
    await txn.rollback();
    return;
  }
}
