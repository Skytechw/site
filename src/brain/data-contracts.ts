/** CommunityBasicInfo */
export interface CommunityBasicInfo {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /**
   * Member Count
   * @default 0
   */
  member_count?: number;
}

/** CommunityCreateRequest */
export interface CommunityCreateRequest {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Creator Id */
  creator_id: string;
}

/** CommunityListResponse */
export interface CommunityListResponse {
  /** Communities */
  communities: CommunityBasicInfo[];
  /** Total Count */
  total_count: number;
}

/** CommunityMembershipStatus */
export interface CommunityMembershipStatus {
  /** Is Member */
  is_member: boolean;
  /** Is Creator */
  is_creator: boolean;
}

/** CommunityResponse */
export interface CommunityResponse {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Id */
  id: string;
  /** Creator Id */
  creator_id: string;
  /** Member Ids */
  member_ids: string[];
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** ForumCategoryCreateRequest */
export interface ForumCategoryCreateRequest {
  /**
   * Name
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** Description */
  description?: string | null;
}

/** ForumCategoryResponse */
export interface ForumCategoryResponse {
  /**
   * Name
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** Description */
  description?: string | null;
  /** Id */
  id: string;
  /** Community Id */
  community_id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** ForumTopicCreateRequest */
export interface ForumTopicCreateRequest {
  /**
   * Title
   * Title of the forum topic
   * @minLength 3
   * @maxLength 200
   */
  title: string;
  /**
   * Content
   * Initial content/post of the forum topic
   */
  content: string;
}

/** ForumTopicListResponse */
export interface ForumTopicListResponse {
  /** Topics */
  topics: ForumTopicResponse[];
  /** Total Count */
  total_count: number;
  /** Offset */
  offset?: number | null;
  /** Limit */
  limit?: number | null;
}

/** ForumTopicResponse */
export interface ForumTopicResponse {
  /**
   * Title
   * Title of the forum topic
   * @minLength 3
   * @maxLength 200
   */
  title: string;
  /**
   * Content
   * Initial content/post of the forum topic
   */
  content: string;
  /**
   * Id
   * @format uuid
   */
  id?: string;
  /**
   * Community Id
   * @format uuid
   */
  community_id: string;
  /**
   * Category Id
   * @format uuid
   */
  category_id: string;
  /** Creator Id */
  creator_id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at?: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at?: string;
  /**
   * Is Deleted
   * @default false
   */
  is_deleted?: boolean;
  /** Author Display Name */
  author_display_name?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** JoinCommunityResponse */
export interface JoinCommunityResponse {
  /** Message */
  message: string;
  /** Community Id */
  community_id: string;
  /** User Id */
  user_id: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type CreateCommunityData = CommunityResponse;

export type CreateCommunityError = HTTPValidationError;

/** Response List My Communities */
export type ListMyCommunitiesData = CommunityResponse[];

export interface GetCommunityDetailsParams {
  /** Community Id */
  communityId: string;
}

export type GetCommunityDetailsData = CommunityResponse;

export type GetCommunityDetailsError = HTTPValidationError;

export interface CreateForumCategoryParams {
  /** Community Id */
  communityId: string;
}

export type CreateForumCategoryData = ForumCategoryResponse;

export type CreateForumCategoryError = HTTPValidationError;

export interface ListForumCategoriesParams {
  /** Community Id */
  communityId: string;
}

/** Response List Forum Categories */
export type ListForumCategoriesData = ForumCategoryResponse[];

export type ListForumCategoriesError = HTTPValidationError;

export interface UpdateForumCategoryParams {
  /** Community Id */
  communityId: string;
  /** Category Id */
  categoryId: string;
}

export type UpdateForumCategoryData = ForumCategoryResponse;

export type UpdateForumCategoryError = HTTPValidationError;

export interface DeleteForumCategoryParams {
  /** Community Id */
  communityId: string;
  /** Category Id */
  categoryId: string;
}

export type DeleteForumCategoryData = any;

export type DeleteForumCategoryError = HTTPValidationError;

export interface CreateForumTopicParams {
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
}

export type CreateForumTopicData = ForumTopicResponse;

export type CreateForumTopicError = HTTPValidationError;

export interface ListForumTopicsInCategoryParams {
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
}

export type ListForumTopicsInCategoryData = ForumTopicListResponse;

export type ListForumTopicsInCategoryError = HTTPValidationError;

export interface ListLatestForumTopicsInCommunityParams {
  /**
   * Limit
   * Number of latest topics to fetch
   * @min 1
   * @max 50
   * @default 10
   */
  limit?: number;
  /**
   * Community Id
   * ID of the community
   * @format uuid
   */
  communityId: string;
}

export type ListLatestForumTopicsInCommunityData = ForumTopicListResponse;

export type ListLatestForumTopicsInCommunityError = HTTPValidationError;

export interface GetForumTopicDetailsParams {
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
}

export type GetForumTopicDetailsData = ForumTopicResponse;

export type GetForumTopicDetailsError = HTTPValidationError;

export interface ListAllCommunitiesParams {
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
}

export type ListAllCommunitiesData = CommunityListResponse;

export type ListAllCommunitiesError = HTTPValidationError;

export interface JoinCommunityParams {
  /** Community Id */
  communityId: string;
}

export type JoinCommunityData = JoinCommunityResponse;

export type JoinCommunityError = HTTPValidationError;

export interface GetCommunityMembershipStatusParams {
  /** Community Id */
  communityId: string;
}

export type GetCommunityMembershipStatusData = CommunityMembershipStatus;

export type GetCommunityMembershipStatusError = HTTPValidationError;
