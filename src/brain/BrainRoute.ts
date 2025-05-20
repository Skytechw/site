import {
  CheckHealthData,
  CommunityCreateRequest,
  CreateCommunityData,
  CreateForumCategoryData,
  CreateForumTopicData,
  DeleteForumCategoryData,
  ForumCategoryCreateRequest,
  ForumTopicCreateRequest,
  GetCommunityDetailsData,
  GetCommunityMembershipStatusData,
  GetForumTopicDetailsData,
  JoinCommunityData,
  ListAllCommunitiesData,
  ListForumCategoriesData,
  ListForumTopicsInCategoryData,
  ListLatestForumTopicsInCommunityData,
  ListMyCommunitiesData,
  UpdateForumCategoryData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Create a new community. Requires authentication. - **name**: Name of the community (required). - **description**: Description of the community (required).
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name create_community
   * @summary Create Community
   * @request POST:/routes/communities/
   */
  export namespace create_community {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CommunityCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCommunityData;
  }

  /**
   * @description List all communities the authenticated user is a member of (or created).
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name list_my_communities
   * @summary List My Communities
   * @request GET:/routes/communities/me
   */
  export namespace list_my_communities {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListMyCommunitiesData;
  }

  /**
   * @description Get details for a specific community by its ID.
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name get_community_details
   * @summary Get Community Details
   * @request GET:/routes/communities/{community_id}
   */
  export namespace get_community_details {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommunityDetailsData;
  }

  /**
   * @description Create a new forum category within a community. Admin only.
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name create_forum_category
   * @summary Create Forum Category
   * @request POST:/routes/communities/{community_id}/forum-categories
   */
  export namespace create_forum_category {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ForumCategoryCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateForumCategoryData;
  }

  /**
   * @description List all non-deleted forum categories for a community.
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name list_forum_categories
   * @summary List Forum Categories
   * @request GET:/routes/communities/{community_id}/forum-categories
   */
  export namespace list_forum_categories {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListForumCategoriesData;
  }

  /**
   * @description Update an existing forum category. Admin only.
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name update_forum_category
   * @summary Update Forum Category
   * @request PUT:/routes/communities/{community_id}/forum-categories/{category_id}
   */
  export namespace update_forum_category {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
      /** Category Id */
      categoryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ForumCategoryCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateForumCategoryData;
  }

  /**
   * @description Soft delete a forum category. Admin only. Returns 204 No Content on success.
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name delete_forum_category
   * @summary Delete Forum Category
   * @request DELETE:/routes/communities/{community_id}/forum-categories/{category_id}
   */
  export namespace delete_forum_category {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
      /** Category Id */
      categoryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteForumCategoryData;
  }

  /**
   * @description Create a new forum topic within a specific category of a community using db.storage.json. Requires user to be authenticated.
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name create_forum_topic
   * @summary Create Forum Topic
   * @request POST:/routes/communities/{community_id}/categories/{category_id}/topics
   */
  export namespace create_forum_topic {
    export type RequestParams = {
      /**
       * Community Id
       * ID of the community
       * @format uuid
       */
      communityId: string;
      /**
       * Category Id
       * ID of the category to create the topic in
       * @format uuid
       */
      categoryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ForumTopicCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateForumTopicData;
  }

  /**
   * @description List all non-deleted forum topics for a specific category within a community.
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name list_forum_topics_in_category
   * @summary List Forum Topics In Category
   * @request GET:/routes/communities/{community_id}/categories/{category_id}/topics
   */
  export namespace list_forum_topics_in_category {
    export type RequestParams = {
      /**
       * Community Id
       * ID of the community
       * @format uuid
       */
      communityId: string;
      /**
       * Category Id
       * ID of the category to create the topic in
       * @format uuid
       */
      categoryId: string;
    };
    export type RequestQuery = {
      /**
       * Offset
       * Offset for pagination
       * @min 0
       * @default 0
       */
      offset?: number;
      /**
       * Limit
       * Limit for pagination
       * @min 1
       * @max 100
       * @default 20
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListForumTopicsInCategoryData;
  }

  /**
   * @description List the N most recent, non-deleted forum topics across all categories in a community.
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name list_latest_forum_topics_in_community
   * @summary List Latest Forum Topics In Community
   * @request GET:/routes/communities/{community_id}/topics/latest
   */
  export namespace list_latest_forum_topics_in_community {
    export type RequestParams = {
      /**
       * Community Id
       * ID of the community
       * @format uuid
       */
      communityId: string;
    };
    export type RequestQuery = {
      /**
       * Limit
       * Number of latest topics to fetch
       * @min 1
       * @max 50
       * @default 10
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListLatestForumTopicsInCommunityData;
  }

  /**
   * @description Get the details of a specific forum topic by its ID within a community.
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name get_forum_topic_details
   * @summary Get Forum Topic Details
   * @request GET:/routes/communities/{community_id}/topics/{topic_id}
   */
  export namespace get_forum_topic_details {
    export type RequestParams = {
      /**
       * Community Id
       * ID of the community
       * @format uuid
       */
      communityId: string;
      /**
       * Topic Id
       * ID of the forum topic
       * @format uuid
       */
      topicId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetForumTopicDetailsData;
  }

  /**
   * @description List all available, non-deleted communities with basic information.
   * @tags Community Discovery, dbtn/module:communities_discovery, dbtn/hasAuth
   * @name list_all_communities
   * @summary List All Communities
   * @request GET:/routes/communities
   */
  export namespace list_all_communities {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Offset
       * Offset for pagination
       * @min 0
       * @default 0
       */
      offset?: number;
      /**
       * Limit
       * Limit for pagination
       * @min 1
       * @max 100
       * @default 20
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListAllCommunitiesData;
  }

  /**
   * @description Allows an authenticated user to join a community. The user cannot join if they are the creator or already a member.
   * @tags Communities, dbtn/module:communities, dbtn/hasAuth
   * @name join_community
   * @summary Join Community
   * @request POST:/routes/communities/{community_id}/join
   */
  export namespace join_community {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = JoinCommunityData;
  }

  /**
   * @description Checks if the current authenticated user is a member or creator of a specific community.
   * @tags Communities, dbtn/module:communities, dbtn/hasAuth
   * @name get_community_membership_status
   * @summary Get Community Membership Status
   * @request GET:/routes/communities/{community_id}/membership_status
   */
  export namespace get_community_membership_status {
    export type RequestParams = {
      /** Community Id */
      communityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommunityMembershipStatusData;
  }
}
