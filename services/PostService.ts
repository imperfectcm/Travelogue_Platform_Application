import type { Knex } from "knex";
import { knex } from "../utils/knex";

export class PostService {
  constructor(private knex: Knex) {}
  // =================== Post init ====================

  // Create a new post (Insert user_id, title, departure_date, travel_days, traveller_count, average_expenditure, content_name, status)
  async publishPost(
    userId: number | undefined,
    postImage: string | null,
    title: string,
    departureDate: Date | null,
    travelDays: number | null,
    travellerCounts: number | null,
    averageExpenditure: number | null,
    contentJson: string | null,
    contentHTML: string | null,
    status: string
  ) {
    try {
      return (
        await this.knex("posts")
          .insert({
            user_id: userId,
            post_image: postImage,
            title: title,
            departure_date: departureDate,
            travel_days: travelDays,
            traveller_counts: travellerCounts,
            average_expenditure: averageExpenditure,
            content_json: contentJson,
            content_html: contentHTML,
            status: status,
            created_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          })
          .returning("id")
      )[0];
    } catch (error) {
      console.log(error);
    }
  }

  // get the html and json file name from post id
  async getHtmlJsonById(postId: any) {
    return await this.knex
      .select("content_json", "content_html")
      .from("posts")
      .where("id", postId);
  }

  // Get post image
  async getPostImage(postId: number) {
    return (
      await this.knex.select("post_image").from("posts").where("id", postId)
    )[0];
  }

  // Update post image
  async updatePostImage(postId: number, postImage: string) {
    await this.knex("posts")
      .update({
        post_image: postImage,
        updated_at: this.knex.fn.now(),
      })
      .where("id", postId);
  }

  // update profile
  async updateProfileImage(userId: number, profileImage: string) {
    await this.knex("users")
      .update({
        profile_pic: profileImage,
        updated_at: this.knex.fn.now(),
      })
      .where("id", userId);
  }

  // Search nation tag relation
  async searchNationTag(nationTag: any) {
    return await this.knex
      .select("id", "tag_name")
      .from("nation_tags")
      .whereRaw('lower("tag_name") like ?', `${nationTag.toLowerCase()}%`)
      .limit(5);
  }

  // Check nation tag
  async getNationTagId(nationTag: string) {
    return (
      await this.knex
        .select("id")
        .from("nation_tags")
        .whereRaw("lower(tag_name) = ?", nationTag.toLowerCase())
    )[0];
  }

  // Create nation tag relation
  async createNationTagRelation(postId: number, nationTagId: number) {
    // let txn = await knex.transaction();
    try {
      await this.knex("post_nation_tag_relation").insert({
        post_id: postId,
        nation_tag_id: nationTagId,
        // created_at: this.knex.fn.now(),
        // updated_at: this.knex.fn.now(),
      });

      // await txn.commit();
    } catch (error) {
      console.log(error);
      // await txn.rollback();
    }
  }

  // Get post nation tag relation
  async getPostNationTag(postId: number) {
    return await this.knex
      .select("post_nation_tag_relation.id", "tag_name")
      .from("post_nation_tag_relation")
      .innerJoin("nation_tags", "nation_tag_id", "nation_tags.id")
      .where("post_id", postId)
      .orderBy("post_nation_tag_relation.id", "asc");
  }

  //get user nation tag

  async getNationTagByUserId(userId: number) {
    return await this.knex
      .select("nation_tags.tag_name,nation_tags.id")
      .from("nation_tags")
      .innerJoin("post_nation_tag_relation", "nation_tag_id", "nation_tags.id")
      .innerJoin("posts", "posts.id", "post_nation_tag_relation.post_id")
      .where("posts.user_id", userId)
      .orderBy("post_nation_tag_relation.id", "asc");
  }

  // Delete post nation tag relation
  async deletePostNationTag(postId: number) {
    await this.knex("post_nation_tag_relation").where("post_id", postId).del();
  }

  // Get post other tag relation
  async getPostOtherTag(postId: number) {
    return await this.knex
      .select("tag_name")
      .from("other_tags")
      .where("post_id", postId)
      .orderBy("id", "asc");
  }

  // Create other tag
  async createOtherTag(postId: number, otherTag: string) {
    let txn = await knex.transaction();
    try {
      await this.knex("other_tags").insert({
        post_id: postId,
        tag_name: otherTag,
        // created_at: this.knex.fn.now(),
        // updated_at: this.knex.fn.now(),
      });

      await txn.commit();
    } catch (error) {
      console.log(error);
      await txn.rollback();
    }
  }

  // Delete other tag
  async deletePostOtherTag(postId: number) {
    await this.knex("other_tags").where("post_id", postId).del();
  }

  // =================== Get posts comments ====================
  async getPostComments(postId: number) {
    const comments = await this.knex("users")
      .select(
        "comments.comment",
        "users.username",
        "users.profile_pic",
        "comments.created_at"
      )
      .leftJoin("comments", "comments.user_id", "users.id")
      .leftJoin("posts", "posts.id", "comments.post_id")
      .where("comments.post_id", postId)
      .orderBy("comments.created_at", "asc");

    return comments;
  }

  // =================== create comments ====================
  async createComment(postId: number, userId: number, comment: string) {
    const comments = await this.knex("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        comment: comment,
      })
      .returning("comments.id");
    return comments;
  }

  // =================== Get posts ==================== Man

  // Get all posts info (username, profile_pic, collected_counts, nation_tags,tag_name, * from posts)
  async getAllPosts(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at"
  ) {
    const offset = (page - 1) * perPage;
    console.log({
      offset,
    });
    const post = await this.knex("posts")
      .select(
        "posts.user_id",
        "posts.id as post_id",
        "title",
        "post_image",
        "username",
        "profile_pic",
        knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
        knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
        knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
      )
      .where("posts.status", "public")
      .leftJoin("other_tags", "other_tags.post_id", "posts.id")
      .leftJoin(
        "post_nation_tag_relation",
        "post_nation_tag_relation.post_id",
        "posts.id"
      )
      .leftJoin(
        "nation_tags",
        "nation_tags.id",
        "post_nation_tag_relation.nation_tag_id"
      )
      .leftJoin(
        "user_collect_post_relation",
        "user_collect_post_relation.post_id",
        "posts.id"
      )
      .leftJoin("users", "posts.user_id", "users.id")
      .groupBy("posts.id", "posts.user_id", "username", "profile_pic")
      .orderBy(orderBy, orderDirection)
      .limit(perPage)
      .offset(offset);

    return post;
  }

  // =================== Get posts by tag ====================

  // Get all posts info (username, profile_pic, collected_counts, nation_tags,tag_name, * from posts)
  async getAllPostsByTag(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at",
    tag: string
  ) {
    const offset = (page - 1) * perPage;
    let lowerTag = tag.toLocaleLowerCase();

    const post = await this.knex
      .with("subquery_alias", (queryBuilder) => {
        queryBuilder
          .select(
            "posts.user_id",
            "posts.id as post_id",
            "title",
            "post_image",
            "username",
            "profile_pic",
            "posts.created_at as post_created_at",
            knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
            knex.raw(
              "array_agg(distinct(LOWER(nation_tags.tag_name))) as lower_nation_tag"
            ),
            knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
            knex.raw(
              "array_agg(distinct(LOWER(other_tags.tag_name))) as lower_other_tag"
            ),
            knex.raw(
              "array_agg(distinct(user_collect_post_relation.id)) as user_collect_post_relation_id"
            ),
            knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
          )
          .from("posts")
          .leftJoin("users", "posts.user_id", "users.id")
          .leftJoin(
            "post_nation_tag_relation",
            "post_nation_tag_relation.post_id",
            "posts.id"
          )
          .leftJoin(
            "nation_tags",
            "nation_tags.id",
            "post_nation_tag_relation.nation_tag_id"
          )
          .leftJoin("other_tags", "other_tags.post_id", "posts.id")
          .leftJoin(
            "user_collect_post_relation",
            "user_collect_post_relation.post_id",
            "posts.id"
          )
          .groupBy(
            "posts.id",
            "posts.user_id",
            "username",
            "profile_pic",
            "post_created_at"
          )
          .where("posts.status", "public")
          .orderBy(orderBy, orderDirection);
      })
      .select("*")
      .from("subquery_alias")
      .whereRaw("? = ANY(lower_nation_tag)", [lowerTag])
      .orWhereRaw("? = ANY(lower_other_tag)", [lowerTag])
      .limit(perPage)
      .offset(offset);

    return post;
  }

  // =================== Get user posts ===================
  async getUserPosts(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at",
    userId: number
  ) {
    const offset = (page - 1) * perPage;
    const post = await this.knex("posts")
      .select(
        "posts.user_id",
        "username",
        "profile_pic",
        "posts.id",
        "title",
        "post_image",
        knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
        knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
        knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
      )
      .leftJoin("other_tags", "other_tags.post_id", "posts.id")
      .leftJoin(
        "post_nation_tag_relation",
        "post_nation_tag_relation.post_id",
        "posts.id"
      )
      .leftJoin(
        "nation_tags",
        "nation_tags.id",
        "post_nation_tag_relation.nation_tag_id"
      )
      .leftJoin(
        "user_collect_post_relation",
        "user_collect_post_relation.post_id",
        "posts.id"
      )
      .leftJoin("users", "users.id", "posts.user_id")
      .where("users.id", userId)
      .groupBy("posts.id", "username", "profile_pic")
      .orderBy(orderBy, orderDirection)
      .limit(perPage)
      .offset(offset);
    return post;
  }

  // =================== Get user collected posts ===================
  async getUserCollectedPosts(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at",
    userId: number
  ) {
    const offset = (page - 1) * perPage;
    const post = await this.knex("posts")
      .select(
        "posts.user_id",
        "username",
        "profile_pic",
        "posts.id as post_id",
        "title",
        "post_image",
        knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
        knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
        knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
      )
      .leftJoin("other_tags", "other_tags.post_id", "posts.id")
      .leftJoin(
        "post_nation_tag_relation",
        "post_nation_tag_relation.post_id",
        "posts.id"
      )
      .leftJoin(
        "nation_tags",
        "nation_tags.id",
        "post_nation_tag_relation.nation_tag_id"
      )
      .leftJoin(
        "user_collect_post_relation",
        "user_collect_post_relation.post_id",
        "posts.id"
      )
      .leftJoin("users", "users.id", "posts.user_id")
      .where("user_collect_post_relation.user_id", userId)
      .groupBy("posts.id", "username", "profile_pic")
      .orderBy(orderBy, orderDirection)
      .limit(perPage)
      .offset(offset);
    return post;
  }

  // =================== Get one post info ===================

  // get the post information by id
  async getPostInforById(postId: number) {
    const result = await this.knex
      .select("*")
      .from("posts")
      .where("id", postId)
      .first();

    return result;
  }

  // get the author profile by post id
  async getAuthorProfile(postId: number) {
    return await this.knex
      .select(
        "users.profile_pic",
        "users.username",
        "users.caption",
        "users.living_location",
        "users.id"
      )
      .from("users")
      .innerJoin("posts", "user_id", "users.id")
      .where("posts.id", postId);
  }
  //  if return null ,not collected ; if return something , is collected
  // review: duplicate checkCollection
  async isPostCollected(postId: number, userId: number) {
    return await this.knex
      .select("*")
      .from("user_collect_post_relation")
      .where("post_id", postId)
      .where("user_id", userId);
  }
  // get the total number of collection
  async collectionCount(postId: number) {
    return await this.knex
      .count()
      .from("user_collect_post_relation")
      .where("post_id", postId);
  }

  // =================== Edit post ==================== Man

  // Update post title
  async updateTitle(updateTitle: string | null, postId: number) {
    await this.knex("posts")
      .update({
        title: updateTitle,
        updated_at: this.knex.fn.now(),
      })
      .where("id", postId);
  }

  // Update post info (departure_date, travel_days, traveller_counts, average_expenditure)
  async updatePostInfo(
    updateDate: string | null,
    updateDays: number | null,
    updateCount: number | null,
    updateExpense: number | null,
    postId: number
  ) {
    await this.knex("posts")
      .update({
        departure_date: updateDate,
        travel_days: updateDays,
        traveller_counts: updateCount,
        average_expenditure: updateExpense,
        updated_at: this.knex.fn.now(),
      })
      .where("id", postId);
  }

  // publicPost
  async publicPost(postId: number) {
    await this.knex("posts")
      .update({
        status: "public",
      })
      .where("id", postId);
  }

  // privatePost
  async privatePost(postId: number) {
    await this.knex("posts")
      .update({
        status: "private",
      })
      .where("id", postId);
  }

  // Collect post
  async collectPost(postId: number, userId: number) {
    await this.knex("user_collect_post_relation").insert({
      user_id: userId,
      post_id: postId,
    });
  }

  // Uncollect post
  async deleteCollectPost(postId: number, userId: number) {
    await this.knex("user_collect_post_relation")
      .where({
        user_id: userId,
        post_id: postId,
      })
      .del();
  }

  // check collected or not
  async checkCollection(postId: number, userId: number) {
    return await this.knex("user_collect_post_relation").select("*").where({
      post_id: postId,
      user_id: userId,
    });
  }

  // Delete post

  async deletePostById(postId: number) {
    await this.knex("posts").where("id", postId).del();
  }

  //get json file name by id
  async getJsonfile(postId: number) {
    return await this.knex("posts").select("content_json").where("id", postId);
  }

  //get html file name by id
  async getHtmlfile(postId: number) {
    return await this.knex("posts").select("content_html").where("id", postId);
  }
  //check if the post id exist
  async checkId(postId: number) {
    return await this.knex("posts")
      .select("id")
      .where("id", postId)
      .returning("id");
  }

  async getPostsGoogleVision(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at",
    tagName: string
  ) {
    const offset = (page - 1) * perPage;
    const post = await this.knex("posts")
      .select(
        "posts.id",
        "title",
        "post_image",
        "username",
        "profile_pic",
        knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
        knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
        knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
      )
      .where("posts.status", "public")
      .where("nation_tags.tag_name", tagName)
      .leftJoin("other_tags", "other_tags.post_id", "posts.id")
      .leftJoin(
        "post_nation_tag_relation",
        "post_nation_tag_relation.post_id",
        "posts.id"
      )
      .leftJoin(
        "nation_tags",
        "nation_tags.id",
        "post_nation_tag_relation.nation_tag_id"
      )
      .leftJoin(
        "user_collect_post_relation",
        "user_collect_post_relation.post_id",
        "posts.id"
      )
      .leftJoin("users", "posts.user_id", "users.id")
      .groupBy("posts.id", "posts.user_id", "username", "profile_pic")
      .orderBy(orderBy, orderDirection)
      .limit(perPage)
      .offset(offset);

    return post;
  }

  // =================== Get posts ==================== Man

  // Get all posts info (username, profile_pic, collected_counts, nation_tags,tag_name, * from posts)
  async getPostsByTextInput(
    page: number = 1,
    perPage: number = 10,
    orderDirection = "asc",
    orderBy = "created_at",
    inputValue: string
  ) {
    console.log("orderDirection", orderDirection);
    const offset = (page - 1) * perPage;
    const post = await this.knex("posts")
      .select(
        "posts.user_id",
        "posts.id",
        "title",
        "post_image",
        "username",
        "profile_pic"
        // knex.raw("array_agg(distinct(other_tags.tag_name)) as other_tag"),
        // knex.raw("array_agg(distinct(nation_tags.tag_name)) as nation_tag"),
        // knex.raw("Count(distinct(user_collect_post_relation.id)) as count")
      )
      .where("posts.status", "public")
      .where("nation_tags.tag_name", inputValue)
      .leftJoin("other_tags", "other_tags.post_id", "posts.id")
      .leftJoin(
        "post_nation_tag_relation",
        "post_nation_tag_relation.post_id",
        "posts.id"
      )
      .leftJoin(
        "nation_tags",
        "nation_tags.id",
        "post_nation_tag_relation.nation_tag_id"
      )
      .leftJoin(
        "user_collect_post_relation",
        "user_collect_post_relation.post_id",
        "posts.id"
      )
      .leftJoin("users", "posts.user_id", "users.id")
      .groupBy("posts.id", "posts.user_id", "username", "profile_pic");
    // .orderBy(orderBy, orderDirection)
    // .limit(perPage)
    // .offset(offset);

    return post;
  }
}
