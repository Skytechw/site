import {
  CheckHealthData,
  CommunityCreateRequest,
  CreateCommunityData,
  CreateCommunityError,
  CreateForumCategoryData,
  CreateForumCategoryError,
  CreateForumCategoryParams,
  CreateForumTopicData,
  CreateForumTopicError,
  CreateForumTopicParams,
  DeleteForumCategoryData,
  DeleteForumCategoryError,
  DeleteForumCategoryParams,
  ForumCategoryCreateRequest,
  ForumTopicCreateRequest,
  GetCommunityDetailsData,
  GetCommunityDetailsError,
  GetCommunityDetailsParams,
  GetCommunityMembershipStatusData,
  GetCommunityMembershipStatusError,
  GetCommunityMembershipStatusParams,
  GetForumTopicDetailsData,
  GetForumTopicDetailsError,
  GetForumTopicDetailsParams,
  JoinCommunityData,
  JoinCommunityError,
  JoinCommunityParams,
  ListAllCommunitiesData,
  ListAllCommunitiesError,
  ListAllCommunitiesParams,
  ListForumCategoriesData,
  ListForumCategoriesError,
  ListForumCategoriesParams,
  ListForumTopicsInCategoryData,
  ListForumTopicsInCategoryError,
  ListForumTopicsInCategoryParams,
  ListLatestForumTopicsInCommunityData,
  ListLatestForumTopicsInCommunityError,
  ListLatestForumTopicsInCommunityParams,
  ListMyCommunitiesData,
  UpdateForumCategoryData,
  UpdateForumCategoryError,
  UpdateForumCategoryParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new community. Requires authentication. - **name**: Name of the community (required). - **description**: Description of the community (required).
   *
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name create_community
   * @summary Create Community
   * @request POST:/routes/communities/
   */
  create_community = (data: CommunityCreateRequest, params: RequestParams = {}) =>
    this.request<CreateCommunityData, CreateCommunityError>({
      path: `/routes/communities/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all communities the authenticated user is a member of (or created).
   *
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name list_my_communities
   * @summary List My Communities
   * @request GET:/routes/communities/me
   */
  list_my_communities = (params: RequestParams = {}) =>
    this.request<ListMyCommunitiesData, any>({
      path: `/routes/communities/me`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get details for a specific community by its ID.
   *
   * @tags Communities, dbtn/module:communities_api, dbtn/hasAuth
   * @name get_community_details
   * @summary Get Community Details
   * @request GET:/routes/communities/{community_id}
   */
  get_community_details = ({ communityId, ...query }: GetCommunityDetailsParams, params: RequestParams = {}) =>
    this.request<GetCommunityDetailsData, GetCommunityDetailsError>({
      path: `/routes/communities/${communityId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new forum category within a community. Admin only.
   *
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name create_forum_category
   * @summary Create Forum Category
   * @request POST:/routes/communities/{community_id}/forum-categories
   */
  create_forum_category = (
    { communityId, ...query }: CreateForumCategoryParams,
    data: ForumCategoryCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateForumCategoryData, CreateForumCategoryError>({
      path: `/routes/communities/${communityId}/forum-categories`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all non-deleted forum categories for a community.
   *
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name list_forum_categories
   * @summary List Forum Categories
   * @request GET:/routes/communities/{community_id}/forum-categories
   */
  list_forum_categories = ({ communityId, ...query }: ListForumCategoriesParams, params: RequestParams = {}) =>
    this.request<ListForumCategoriesData, ListForumCategoriesError>({
      path: `/routes/communities/${communityId}/forum-categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing forum category. Admin only.
   *
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name update_forum_category
   * @summary Update Forum Category
   * @request PUT:/routes/communities/{community_id}/forum-categories/{category_id}
   */
  update_forum_category = (
    { communityId, categoryId, ...query }: UpdateForumCategoryParams,
    data: ForumCategoryCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateForumCategoryData, UpdateForumCategoryError>({
      path: `/routes/communities/${communityId}/forum-categories/${categoryId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Soft delete a forum category. Admin only. Returns 204 No Content on success.
   *
   * @tags Communities, Forum Categories, dbtn/module:communities_api, dbtn/hasAuth
   * @name delete_forum_category
   * @summary Delete Forum Category
   * @request DELETE:/routes/communities/{community_id}/forum-categories/{category_id}
   */
  delete_forum_category = (
    { communityId, categoryId, ...query }: DeleteForumCategoryParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteForumCategoryData, DeleteForumCategoryError>({
      path: `/routes/communities/${communityId}/forum-categories/${categoryId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create a new forum topic within a specific category of a community using db.storage.json. Requires user to be authenticated.
   *
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name create_forum_topic
   * @summary Create Forum Topic
   * @request POST:/routes/communities/{community_id}/categories/{category_id}/topics
   */
  create_forum_topic = (
    { communityId, categoryId, ...query }: CreateForumTopicParams,
    data: ForumTopicCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateForumTopicData, CreateForumTopicError>({
      path: `/routes/communities/${communityId}/categories/${categoryId}/topics`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all non-deleted forum topics for a specific category within a community.
   *
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name list_forum_topics_in_category
   * @summary List Forum Topics In Category
   * @request GET:/routes/communities/{community_id}/categories/{category_id}/topics
   */
  list_forum_topics_in_category = (
    { communityId, categoryId, ...query }: ListForumTopicsInCategoryParams,
    params: RequestParams = {},
  ) =>
    this.request<ListForumTopicsInCategoryData, ListForumTopicsInCategoryError>({
      path: `/routes/communities/${communityId}/categories/${categoryId}/topics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List the N most recent, non-deleted forum topics across all categories in a community.
   *
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name list_latest_forum_topics_in_community
   * @summary List Latest Forum Topics In Community
   * @request GET:/routes/communities/{community_id}/topics/latest
   */
  list_latest_forum_topics_in_community = (
    { communityId, ...query }: ListLatestForumTopicsInCommunityParams,
    params: RequestParams = {},
  ) =>
    this.request<ListLatestForumTopicsInCommunityData, ListLatestForumTopicsInCommunityError>({
      path: `/routes/communities/${communityId}/topics/latest`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get the details of a specific forum topic by its ID within a community.
   *
   * @tags Forum Topics, dbtn/module:forum_topics, dbtn/hasAuth
   * @name get_forum_topic_details
   * @summary Get Forum Topic Details
   * @request GET:/routes/communities/{community_id}/topics/{topic_id}
   */
  get_forum_topic_details = (
    { communityId, topicId, ...query }: GetForumTopicDetailsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetForumTopicDetailsData, GetForumTopicDetailsError>({
      path: `/routes/communities/${communityId}/topics/${topicId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all available, non-deleted communities with basic information.
   *
   * @tags Community Discovery, dbtn/module:communities_discovery, dbtn/hasAuth
   * @name list_all_communities
   * @summary List All Communities
   * @request GET:/routes/communities
   */
  list_all_communities = (query: ListAllCommunitiesParams, params: RequestParams = {}) =>
    this.request<ListAllCommunitiesData, ListAllCommunitiesError>({
      path: `/routes/communities`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Allows an authenticated user to join a community. The user cannot join if they are the creator or already a member.
   *
   * @tags Communities, dbtn/module:communities, dbtn/hasAuth
   * @name join_community
   * @summary Join Community
   * @request POST:/routes/communities/{community_id}/join
   */
  join_community = ({ communityId, ...query }: JoinCommunityParams, params: RequestParams = {}) =>
    this.request<JoinCommunityData, JoinCommunityError>({
      path: `/routes/communities/${communityId}/join`,
      method: "POST",
      ...params,
    });

  /**
   * @description Checks if the current authenticated user is a member or creator of a specific community.
   *
   * @tags Communities, dbtn/module:communities, dbtn/hasAuth
   * @name get_community_membership_status
   * @summary Get Community Membership Status
   * @request GET:/routes/communities/{community_id}/membership_status
   */
  get_community_membership_status = (
    { communityId, ...query }: GetCommunityMembershipStatusParams,
    params: RequestParams = {},
  ) =>
    this.request<GetCommunityMembershipStatusData, GetCommunityMembershipStatusError>({
      path: `/routes/communities/${communityId}/membership_status`,
      method: "GET",
      ...params,
    });
}
