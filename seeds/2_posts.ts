import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const txn = await knex.transaction();
  // Deletes ALL existing entries
  try {
    await txn("posts").del();

    // Inserts seed entrie
    await knex("posts").insert([
      {
        user_id: 1,
        post_image: "test_image_post1.jpg",
        title: "Nice trip 👹👹",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 720,
        content_json: "test1post.json",
        content_html: "test1post.html",
        status: "public",
      },
      {
        user_id: 1,
        post_image: "test_image_post1.jpg",
        title: "Nice trip🐳🐳",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 720,
        content_json: "test3post.json",
        content_html: "test3post.html",
        status: "public",
      },
      {
        user_id: 2,
        post_image: "test_image_post2.jpg",
        title: "Nice trip👾👾",
        departure_date: "2023-04-16",
        travel_days: 4,
        traveller_counts: 3,
        average_expenditure: 840,
        content_json: "test2post.json",
        content_html: "test2post.html",
        status: "public",
      },
      {
        user_id: 2,
        post_image: "test_image_post1.jpg",
        title: "Nice trip🦄🦄",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 720,
        content_json: "test4post.json",
        content_html: "test4post.html",
        status: "public",
      },

      {
        user_id: 3,
        post_image: "test_image_post3.jpg",
        title: "Nice trip😎😎",
        departure_date: "2023-04-15",
        content_json: "test5post.json",
        content_html: "test5post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 4,
        post_image: "test_image_post4.jpg",
        title: "Nice trip🐖🐖",
        departure_date: "2023-04-15",
        content_json: "test6post.json",
        content_html: "test6post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 5,
        post_image: "test_image_post5.jpg",
        title: "Nice trip✨✨",
        content_json: "test7post.json",
        content_html: "test7post.html",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 6,
        post_image: "test_image_post6.jpg",
        title: "Nice trip🎉🎉",
        departure_date: "2023-04-15",
        content_json: "test8post.json",
        content_html: "test8post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 7,
        post_image: "test_image_post7.jpg",
        title: "Nice trip🎉🎉",
        departure_date: "2023-04-15",
        content_json: "test9post.json",
        content_html: "test9post.html",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 8,
        post_image: "test_image_post8.jpg",
        content_json: "test10post.json",
        content_html: "test10post.html",
        title: "Nice trip🥟🥟",
        departure_date: "2023-04-15",
        travel_days: 4,
        traveller_counts: 4,
        average_expenditure: 1200,
        status: "public",
      },
      {
        user_id: 9,
        post_image: "test_image_post9.jpg",
        title: "Nice trip🤣🤣",
        departure_date: "2023-04-15",
        content_json: "test11post.json",
        content_html: "test11post.html",
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
