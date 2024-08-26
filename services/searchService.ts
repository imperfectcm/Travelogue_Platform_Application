import type { Knex } from "knex";
import { knex } from "../utils/knex";

export class SearchService {
  constructor(private knex: Knex) {}

  // =================== search by google api ==================== Manson

  async searchNationTagByPhoto(countryName: string) {
    return await this.knex
      .select("post_nation_tag_relation.id", "tag_name")
      .from("post_nation_tag_relation")
      .innerJoin("nation_tags", "nation_tag_id", "nation_tags.id")
      .where("nation_tags.tag_name", countryName)
      .orderBy("post_nation_tag_relation.id", "asc");
  }

  // =================== search by text input ==================== Manson
  async searchNationTagByWord(nationTag: any) {
    return await this.knex
      .select("id", "tag_name")
      .from("nation_tags")
      .whereRaw('lower("tag_name") like ?', `${nationTag.toLowerCase()}%`)
      .limit(5);
  }

  async searchOtherTagByWord(otherTag: any) {
    return await this.knex
      .select("tag_name")
      .from("other_tags")
      .whereRaw('lower("tag_name") like ?', `${otherTag.toLowerCase()}%`)
      .limit(5);
  }
}
