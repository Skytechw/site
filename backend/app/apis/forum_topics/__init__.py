import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field

import databutton as db # Import databutton SDK
from app.auth import AuthorizedUser

router = APIRouter(
    tags=["Forum Topics"]
)

# Storage key prefixes / patterns
COMMUNITY_KEY_PREFIX = "community-"
FCATEGORY_KEY_PATTERN = "fcategory_{community_id}_{category_id}.json"
FTOPIC_KEY_PATTERN = "forumtopic_{community_id}_{category_id}_{topic_id}.json"

# Pydantic Models (assuming these are mostly fine, may need to adjust Config for Pydantic V2 if project uses it)
class ForumTopicBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Title of the forum topic")
    content: str = Field(..., description="Initial content/post of the forum topic")

class ForumTopicCreateRequest(ForumTopicBase):
    pass

class ForumTopicInDB(ForumTopicBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    community_id: uuid.UUID
    category_id: uuid.UUID
    creator_id: str # Firebase User ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_deleted: bool = False # For soft deletes

class ForumTopicResponse(ForumTopicInDB):
    author_display_name: Optional[str] = None # To be populated later if needed

    class Config:
        orm_mode = True # For Pydantic V1. For V2, use model_config = {"from_attributes": True}

class ForumTopicListResponse(BaseModel):
    topics: List[ForumTopicResponse]
    total_count: int
    offset: Optional[int] = None
    limit: Optional[int] = None

# Adapted helper to validate community and category existence using db.storage.json
def validate_community_and_category_existence(community_id: uuid.UUID, category_id: uuid.UUID):
    community_key = f"{COMMUNITY_KEY_PREFIX}{str(community_id)}.json"
    try:
        community_data = db.storage.json.get(community_key)
        if not community_data: # Should not happen if get() throws FileNotFoundError
            raise HTTPException(status_code=404, detail=f"Community with ID {community_id} not found")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Community with ID {community_id} not found")
    except Exception as e:
        print(f"Error accessing community {community_key}: {e}")
        raise HTTPException(status_code=500, detail="Error validating community existence")

    category_key = FCATEGORY_KEY_PATTERN.format(community_id=str(community_id), category_id=str(category_id))
    try:
        category_data = db.storage.json.get(category_key)
        if not category_data: # Should not happen if get() throws FileNotFoundError
            raise HTTPException(status_code=404, detail=f"Category with ID {category_id} in community {community_id} not found")
        # Check if category is soft-deleted
        if category_data.get("is_deleted", False):
            raise HTTPException(status_code=404, detail=f"Category with ID {category_id} in community {community_id} not found (it may have been deleted)")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Category with ID {category_id} in community {community_id} not found")
    except Exception as e:
        print(f"Error accessing category {category_key}: {e}")
        raise HTTPException(status_code=500, detail="Error validating category existence")

@router.post("/communities/{community_id}/categories/{category_id}/topics", response_model=ForumTopicResponse, status_code=201)
async def create_forum_topic(
    topic_data: ForumTopicCreateRequest,
    user: AuthorizedUser,
    community_id: uuid.UUID = Path(..., description="ID of the community"),
    category_id: uuid.UUID = Path(..., description="ID of the category to create the topic in"),
):
    """
    Create a new forum topic within a specific category of a community using db.storage.json.
    Requires user to be authenticated.
    """
    validate_community_and_category_existence(community_id, category_id)
    
    new_topic_id = uuid.uuid4()
    
    topic_to_save = ForumTopicInDB(
        **topic_data.dict(),
        id=new_topic_id,
        community_id=community_id,
        category_id=category_id,
        creator_id=user.sub, # Firebase UID from AuthorizedUser
        # created_at, updated_at, is_deleted have defaults
    )

    # Convert model to dict for saving, ensuring UUIDs and datetimes are JSON serializable
    # .dict() by default handles datetimes to ISO strings if model_dump(mode='json') is not used
    # Pydantic V1 .dict() might need custom encoders for UUID if not handled by default.
    # Let's explicitly convert UUIDs to strings here for safety with db.storage.json.
    firestore_topic_data_dict = topic_to_save.dict(
        # Pydantic V1 does not have exclude_none, exclude_unset arguments directly in .dict() like V2 model_dump
        # We are saving the full model here, including defaults like is_deleted=False
    )
    
    # Ensure all UUIDs are strings for JSON storage
    firestore_topic_data_dict['id'] = str(topic_to_save.id)
    firestore_topic_data_dict['community_id'] = str(topic_to_save.community_id)
    firestore_topic_data_dict['category_id'] = str(topic_to_save.category_id)
    # Datetimes should be converted to ISO format strings by .dict() if the model fields are datetime objects
    # Let's verify and ensure they are strings if needed
    if isinstance(firestore_topic_data_dict.get('created_at'), datetime):
        firestore_topic_data_dict['created_at'] = firestore_topic_data_dict['created_at'].isoformat()
    if isinstance(firestore_topic_data_dict.get('updated_at'), datetime):
        firestore_topic_data_dict['updated_at'] = firestore_topic_data_dict['updated_at'].isoformat()

    storage_key = FTOPIC_KEY_PATTERN.format(
        community_id=str(community_id),
        category_id=str(category_id),
        topic_id=str(new_topic_id)
    )

    try:
        db.storage.json.put(key=storage_key, value=firestore_topic_data_dict)
        print(f"Forum topic '{topic_to_save.title}' saved with key: {storage_key}")
        
        # Return the ForumTopicResponse. Since orm_mode=True, it can take the ForumTopicInDB instance.
        # We might need to explicitly pass fields if there are discrepancies or for clarity.
        return ForumTopicResponse(**topic_to_save.dict()) # Pass the dict from the saved object
    except Exception as e:
        print(f"Error saving forum topic to {storage_key}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create forum topic: {str(e)}")

# TODO: GET endpoint for listing topics in a category (using db.storage.json)

@router.get("/communities/{community_id}/categories/{category_id}/topics", response_model=ForumTopicListResponse)
async def list_forum_topics_in_category(
    community_id: uuid.UUID = Path(..., description="ID of the community"),
    category_id: uuid.UUID = Path(..., description="ID of the category to create the topic in"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Limit for pagination"),
    # No user dependency needed for merely listing topics, assuming they are public within the category
):
    """List all non-deleted forum topics for a specific category within a community."""
    validate_community_and_category_existence(community_id, category_id)

    topics_in_category = []
    prefix_to_match = f"forumtopic_{str(community_id)}_{str(category_id)}_"

    print(f"Fetching forum topics for category {category_id} in community {community_id} with prefix '{prefix_to_match}'")

    try:
        all_json_files = db.storage.json.list()
        print(f"Found {len(all_json_files)} total JSON files in storage.")

        for file_info in all_json_files:
            key = file_info.name
            if key.startswith(prefix_to_match) and key.endswith(".json"):
                try:
                    topic_dict = db.storage.json.get(key)
                    if isinstance(topic_dict, dict):
                        # Ensure all required fields for ForumTopicInDB are present or have defaults
                        # Explicitly handle potential missing fields if necessary before parsing
                        # For example, if 'is_deleted' might be missing in older data:
                        topic_dict.setdefault('is_deleted', False)
                        topic_dict.setdefault('creator_id', "unknown") # Or handle more gracefully

                        # Convert string UUIDs back to UUID objects if Pydantic model expects them
                        # and datetime strings to datetime objects
                        if 'id' in topic_dict and isinstance(topic_dict['id'], str):
                            topic_dict['id'] = uuid.UUID(topic_dict['id'])
                        if 'community_id' in topic_dict and isinstance(topic_dict['community_id'], str):
                            topic_dict['community_id'] = uuid.UUID(topic_dict['community_id'])
                        if 'category_id' in topic_dict and isinstance(topic_dict['category_id'], str):
                            topic_dict['category_id'] = uuid.UUID(topic_dict['category_id'])
                        if 'created_at' in topic_dict and isinstance(topic_dict['created_at'], str):
                            topic_dict['created_at'] = datetime.fromisoformat(topic_dict['created_at'])
                        if 'updated_at' in topic_dict and isinstance(topic_dict['updated_at'], str):
                            topic_dict['updated_at'] = datetime.fromisoformat(topic_dict['updated_at'])
                        
                        topic_data = ForumTopicInDB(**topic_dict)
                        if not topic_data.is_deleted:
                            topics_in_category.append(ForumTopicResponse(**topic_data.dict()))
                    else:
                        print(f"Skipping non-dict data for key: {key}")
                except FileNotFoundError:
                    print(f"File not found for key: {key} during list (should not happen)")
                except Exception as e:
                    print(f"Error processing topic file {key}: {e}")
        
        # Sort by creation date, newest first
        topics_in_category.sort(key=lambda t: t.created_at, reverse=True)
        
        total_count = len(topics_in_category)
        paginated_topics = topics_in_category[offset : offset + limit]
        
        print(f"Returning {len(paginated_topics)} topics (out of {total_count} total) for category {category_id}.")
        return ForumTopicListResponse(
            topics=paginated_topics,
            total_count=total_count,
            offset=offset,
            limit=limit
        )
    except Exception as e:
        print(f"Error listing forum topics for category {category_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list forum topics: {str(e)}")

@router.get("/communities/{community_id}/topics/latest", response_model=ForumTopicListResponse)
async def list_latest_forum_topics_in_community(
    community_id: uuid.UUID = Path(..., description="ID of the community"),
    limit: int = Query(10, ge=1, le=50, description="Number of latest topics to fetch")
):
    """List the N most recent, non-deleted forum topics across all categories in a community."""
    # Validate community existence
    community_key = f"{COMMUNITY_KEY_PREFIX}{str(community_id)}.json"
    try:
        db.storage.json.get(community_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Community with ID {community_id} not found")
    except Exception as e:
        print(f"Error accessing community {community_key}: {e}")
        raise HTTPException(status_code=500, detail="Error validating community existence")

    all_community_topics = []
    # Prefix for all topics within this specific community, regardless of category
    prefix_to_match = f"forumtopic_{str(community_id)}_" 

    print(f"Fetching latest topics for community {community_id} with prefix '{prefix_to_match}'")

    try:
        all_json_files = db.storage.json.list()
        print(f"Found {len(all_json_files)} total JSON files in storage for latest topics scan.")

        for file_info in all_json_files:
            key = file_info.name
            if key.startswith(prefix_to_match) and key.endswith(".json"):
                try:
                    topic_dict = db.storage.json.get(key)
                    if isinstance(topic_dict, dict):
                        topic_dict.setdefault('is_deleted', False)
                        topic_dict.setdefault('creator_id', "unknown")
                        
                        if 'id' in topic_dict and isinstance(topic_dict['id'], str):
                            topic_dict['id'] = uuid.UUID(topic_dict['id'])
                        if 'community_id' in topic_dict and isinstance(topic_dict['community_id'], str):
                            topic_dict['community_id'] = uuid.UUID(topic_dict['community_id'])
                        if 'category_id' in topic_dict and isinstance(topic_dict['category_id'], str):
                            topic_dict['category_id'] = uuid.UUID(topic_dict['category_id'])
                        if 'created_at' in topic_dict and isinstance(topic_dict['created_at'], str):
                            topic_dict['created_at'] = datetime.fromisoformat(topic_dict['created_at'])
                        if 'updated_at' in topic_dict and isinstance(topic_dict['updated_at'], str):
                            topic_dict['updated_at'] = datetime.fromisoformat(topic_dict['updated_at'])
                        
                        topic_data = ForumTopicInDB(**topic_dict)
                        if not topic_data.is_deleted:
                            all_community_topics.append(ForumTopicResponse(**topic_data.dict()))
                    else:
                        print(f"Skipping non-dict data for key: {key} in latest topics scan")
                except FileNotFoundError:
                    print(f"File not found for key: {key} during latest topics scan (should not happen)")
                except Exception as e:
                    print(f"Error processing topic file {key} for latest topics: {e}")
        
        # Sort all topics by creation date, newest first
        all_community_topics.sort(key=lambda t: t.created_at, reverse=True)
        
        total_community_topics_count = len(all_community_topics)
        # Get the top N (limit) topics
        latest_topics = all_community_topics[:limit]
        
        print(f"Returning {len(latest_topics)} latest topics (out of {total_community_topics_count} total) for community {community_id}.")
        return ForumTopicListResponse(
            topics=latest_topics,
            total_count=total_community_topics_count, # This is total across community, not just the 'page'
            offset=0, # For latest N, offset is effectively 0
            limit=limit
        )
    except Exception as e:
        print(f"Error listing latest forum topics for community {community_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list latest forum topics: {str(e)}")


# TODO: GET endpoint for latest topics in a community (using db.storage.json)

@router.get("/communities/{community_id}/topics/{topic_id}", response_model=ForumTopicResponse)
async def get_forum_topic_details(
    community_id: uuid.UUID = Path(..., description="ID of the community"),
    topic_id: uuid.UUID = Path(..., description="ID of the forum topic"),
    # No user dependency needed if topics are generally public within a community once created
):
    """Get the details of a specific forum topic by its ID within a community."""
    # Basic validation for community existence (optional, could be skipped for direct topic fetch if desired for performance)
    # community_key = f"{COMMUNITY_KEY_PREFIX}{str(community_id)}.json"
    # try:
    #     db.storage.json.get(community_key)
    # except FileNotFoundError:
    #     raise HTTPException(status_code=404, detail=f"Community with ID {community_id} not found while fetching topic")

    # Construct the full key pattern for the topic. 
    # This requires knowing the category_id if it's part of the key, which it is: FTOPIC_KEY_PATTERN.
    # This means we either need category_id in the path, or we search across all categories for the topic_id.
    # For simplicity and direct access, if FTOPIC_KEY_PATTERN is always used, we need to find the topic file
    # potentially without knowing its original category_id upfront, or the pattern needs adjustment if category_id is not fixed.

    # Assuming FTOPIC_KEY_PATTERN: "forumtopic_{community_id}_{category_id}_{topic_id}.json"
    # We need to search for a file matching "forumtopic_{community_id}_*_{topic_id}.json"

    all_json_files = db.storage.json.list()
    found_topic_dict = None
    
    # Build the expected suffix for the key to find the specific topic
    # Example: "_some-topic-uuid.json"
    topic_id_str = str(topic_id)
    # We are looking for a key that looks like: forumtopic_COMMUNITY-ID_CATEGORY-ID_TOPIC-ID.json

    for file_info in all_json_files:
        key = file_info.name
        # Check if it's a topic file for the given community and topic ID
        # Example key: forumtopic_commID_catID_topicID.json
        parts = key.replace(".json", "").split("_")
        if key.startswith(f"forumtopic_{str(community_id)}_") and len(parts) == 4 and parts[3] == topic_id_str:
            try:
                potential_topic_dict = db.storage.json.get(key)
                if isinstance(potential_topic_dict, dict):
                    # Ensure all required fields are present and convert types
                    potential_topic_dict.setdefault('is_deleted', False)
                    potential_topic_dict.setdefault('creator_id', "unknown")

                    if 'id' in potential_topic_dict and isinstance(potential_topic_dict['id'], str):
                        potential_topic_dict['id'] = uuid.UUID(potential_topic_dict['id'])
                    if 'community_id' in potential_topic_dict and isinstance(potential_topic_dict['community_id'], str):
                        potential_topic_dict['community_id'] = uuid.UUID(potential_topic_dict['community_id'])
                    if 'category_id' in potential_topic_dict and isinstance(potential_topic_dict['category_id'], str):
                        potential_topic_dict['category_id'] = uuid.UUID(potential_topic_dict['category_id'])
                    if 'created_at' in potential_topic_dict and isinstance(potential_topic_dict['created_at'], str):
                        potential_topic_dict['created_at'] = datetime.fromisoformat(potential_topic_dict['created_at'])
                    if 'updated_at' in potential_topic_dict and isinstance(potential_topic_dict['updated_at'], str):
                        potential_topic_dict['updated_at'] = datetime.fromisoformat(potential_topic_dict['updated_at'])

                    parsed_topic = ForumTopicInDB(**potential_topic_dict) # Validate and parse
                    if not parsed_topic.is_deleted and parsed_topic.id == topic_id and parsed_topic.community_id == community_id:
                        found_topic_dict = potential_topic_dict
                        break # Found the specific topic
            except FileNotFoundError:
                print(f"File {key} listed but not found during get operation. Skipping.")
            except Exception as e:
                print(f"Error processing potential topic file {key}: {e}. Skipping.")
                continue # Skip this file if there's an error reading or parsing it

    if not found_topic_dict:
        raise HTTPException(status_code=404, detail=f"Forum topic with ID {topic_id} not found in community {community_id} or it has been deleted.")

    # Convert to ForumTopicResponse
    # The found_topic_dict already has UUIDs and datetimes converted back from strings by the parsing loop
    response_topic = ForumTopicResponse(**found_topic_dict)
    return response_topic



# TODO: GET endpoint for latest topics in a community (using db.storage.json)