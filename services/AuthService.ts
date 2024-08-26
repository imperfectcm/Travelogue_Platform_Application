import type { Knex } from "knex";
import { knex } from "../utils/knex";

export class AuthService {
  constructor(private knex: Knex) {}

  // =================== User register ==================== Mich

  // Check username / email duplicate
  async checkUserDuplicate(email: string) {
    return (
      await this.knex
        .select("username", "email", "password")
        .from("users")
        .where("email", email)
    )[0];
  }

  // Create new user (Insert username, email, password)

  async verifySuccess(userId: any) {
    return await this.knex("users")
      .update({
        status: "activated",
      })
      .where({
        id: userId,
      })
      .returning("*");
  }

  async createNewUser(
    username: string,
    email: string,
    password: string,
    emailtoken: string,
    status: string,
    blog_image: string,
    profile_pic: string
  ) {
    let txn = await knex.transaction();
    try {
      return (
        await this.knex("users")
          .insert({
            username: username,
            email: email,
            password: password,
            emailtoken: emailtoken,
            status: status,
            blog_image,
            profile_pic,
            created_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          })
          .returning("id")
      )[0];
    } catch (error) {
      console.log(error);
      await txn.rollback();
    }
  }

  // =================== User login ==================== Mich123

  // Check user email, password
  async getUserByEmail(
    email: string
    //password: string
  ) {
    return (
      await this.knex
        .select("id", "email", "password", "status")
        .from("users")
        .where("email", email)
    )[0];
  }

  // =================== Get user information ==================== Mich

  // Get all user information
  async getUserInfos(userId: number) {
    return (
      await this.knex
        .select(
          "id",
          "username",
          "email",
          "profile_pic",
          "blog_image",
          "password",
          "caption",
          "living_location",
          "emailToken"
        )
        .from("users")
        .where("id", userId)
    )[0];
  }

  // Get user blog image
  async getUserBlogImage(userId: number) {
    return (
      await this.knex.select("blog_image").from("users").where("id", userId)
    )[0];
  }

  // Get all user posts

  async getAllUserPosts(userId: number) {
    return (
      await this.knex
        .select(
          "post_image",
          "title",
          "created_at",
          "departure_date",
          "travel_days",
          "traveller_counts",
          "average_expenditure",
          "content_name"
        )
        .from("users")
        .where("id", userId)
    )[0];
  }

  // Get all user collections

  async getAllUserCollections(userId: number) {
    return (
      await this.knex
        .select("post_id")
        .from("user_collect_post_relation")
        .where("id", userId)
    )[0];
  }

  // Get all nations user visited

  async getAllNationsUserVisited(postId: number) {
    return (
      await this.knex
        .select("post_id", "nation_tag_id")
        .from("post_nation_tag_relation")
        .where("id", postId)
    )[0];
  }

  // Get last 3 comments from user

  async getUserCommentHistory(userId: number) {
    return (
      await this.knex
        .select("post_id", "user_id", "comment_name")
        .from("user_comment_post_relation")
        .where("id", userId)
    )[0];
  }

  // =================== Edit user information ====================

  // Update user page blog image
  async updateBlogImage(userId: number, blogImage: string | null) {
    await this.knex("users")
      .update({
        blog_image: blogImage,
        updated_at: this.knex.fn.now(),
      })
      .where("id", userId);
  }

  // Update user profile pic
  async updateProfilePic(userId: number, profilePic: string | null) {
    await this.knex("users")
      .update({
        profile_pic: profilePic,
        updated_at: this.knex.fn.now(),
      })
      .where("id", userId);
  }

  // Update username, caption, living_locvation
  async updateUserInfo(
    userId: number,
    username: string,
    caption: string | null,
    livingLocation: string | null
  ) {
    let txn = await knex.transaction();
    try {
      await this.knex("users")
        .update({
          username: username,
          caption: caption,
          living_location: livingLocation,
          updated_at: this.knex.fn.now(),
        })
        .where("id", userId);

      await txn.commit();
    } catch (error) {
      console.log(error);
      await txn.rollback();
    }
  }

  // check password
  async getUserPassword(userId: number) {
    return (
      await this.knex.select("password").from("users").where("id", userId)
    )[0];
  }

  // Update password
  async updateUserPassword(userId: number, hashedPassword: string) {
    await this.knex("users")
      .update({
        password: hashedPassword,
        updated_at: this.knex.fn.now(),
      })
      .where("id", userId);
  }
}
