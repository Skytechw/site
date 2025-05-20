from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime, timezone # Added timezone
import uuid
from typing import List

import databutton as db
from app.auth import AuthorizedUser # Assuming your auth utilities are here

# --- Pydantic Models for Communities ---
class CommunityBase(BaseModel):
    name: str
    description: str

class CommunityCreateRequest(CommunityBase):
    creator_id: str # This will be ignored by the endpoint, user.sub will be used.

class CommunityResponse(CommunityBase):
    id: str
    creator_id: str
    member_ids: list[str]
    created_at: datetime

# --- Pydantic Models for Forum Categories ---
class ForumCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)

class ForumCategoryCreateRequest(ForumCategoryBase):
    pass

class ForumCategoryResponse(ForumCategoryBase):
    id: str
    community_id: str
    created_at: datetime

# Internal model for storing category data, including soft delete flag
class ForumCategoryStoredData(ForumCategoryResponse):
    is_deleted: bool = False


router = APIRouter(
    prefix="/communities",
    tags=["Communities"],
)

# --- Helper Functions ---
def _get_community_doc_or_404(community_id: str) -> dict:
    """Fetches a community document by ID from db.storage.json or raises 404."""
    storage_key = f"community-{community_id}.json"
    try:
        community_doc = db.storage.json.get(key=storage_key)
        if not community_doc or not isinstance(community_doc, dict):
            raise HTTPException(status_code=404, detail="Community not found")
        return community_doc
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Community not found")
    except Exception as e:
        print(f"Error fetching community doc {community_id}: {e}")
        raise HTTPException(status_code=500, detail="Error accessing community data")

def _ensure_admin_permission(community_doc: dict, user: AuthorizedUser):
    """Ensures the user is the creator of the community or raises 403."""
    if community_doc.get("creator_id") != user.sub:
        raise HTTPException(status_code=403, detail="User does not have admin permissions for this community")

# --- Community Endpoints --- 
@router.post("/", response_model=CommunityResponse, status_code=201)
async def create_community(
    body: CommunityCreateRequest,
    user: AuthorizedUser
):
    """
    Create a new community. Requires authentication.

    - **name**: Name of the community (required).
    - **description**: Description of the community (required).
    """
    creator_id = user.sub # Use authenticated user's ID
    community_id = str(uuid.uuid4())
    created_at_dt = datetime.now(timezone.utc) # Use timezone-aware datetime

    community_data_to_save = {
        "id": community_id,
        "name": body.name,
        "description": body.description,
        "creator_id": creator_id,
        "member_ids": [creator_id],  # Creator is initially the only member
        "created_at": created_at_dt.isoformat(), # Store as ISO format string
    }
    
    print(f"Attempting to save community: {community_data_to_save}")

    try:
        storage_key = f"community-{community_id}.json"
        db.storage.json.put(key=storage_key, value=community_data_to_save)
        print(f"Community saved to db.storage.json with key: {storage_key}")
        
        return CommunityResponse(
            id=community_id,
            name=community_data_to_save["name"],
            description=community_data_to_save["description"],
            creator_id=community_data_to_save["creator_id"],
            member_ids=community_data_to_save["member_ids"],
            created_at=created_at_dt
        )
    except Exception as e:
        print(f"Error saving community to db.storage.json: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create community: {str(e)}")

@router.get("/me", response_model=List[CommunityResponse])
async def list_my_communities(user: AuthorizedUser):
    """
    List all communities the authenticated user is a member of (or created).
    """
    user_id = user.sub
    user_communities = []
    print(f"Fetching communities for user: {user_id}")

    try:
        all_community_files = db.storage.json.list()
        print(f"Found {len(all_community_files)} total community files in storage.")

        for file_info in all_community_files:
            key = file_info.name
            if not key.startswith("community-") or not key.endswith(".json"):
                # print(f"Skipping non-community file: {key}")
                continue
            
            try:
                community_data = db.storage.json.get(key)
                if community_data and isinstance(community_data, dict):
                    if user_id == community_data.get("creator_id") or user_id in community_data.get("member_ids", []):
                        user_communities.append(
                            CommunityResponse(
                                id=community_data["id"],
                                name=community_data["name"],
                                description=community_data["description"],
                                creator_id=community_data["creator_id"],
                                member_ids=community_data["member_ids"],
                                created_at=datetime.fromisoformat(community_data["created_at"])
                            )
                        )
                        # print(f"Added community '{community_data.get('name')}' (ID: {community_data.get('id')}) to list for user {user_id}")
                # Removed noisy logs for brevity
            except FileNotFoundError:
                print(f"File not found for key: {key} (should not happen during list)")
            except Exception as e:
                print(f"Error processing community file {key}: {e}")

        print(f"Returning {len(user_communities)} communities for user {user_id}")
        return user_communities
    except Exception as e:
        print(f"Error listing communities from db.storage.json: {e}")
        raise HTTPException(status_code=500, detail="Failed to list communities")

@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community_details(community_id: str):
    """
    Get details for a specific community by its ID.
    """
    community_doc = _get_community_doc_or_404(community_id)
    print(f"Successfully fetched community data: {community_doc}")
    
    created_at_val = community_doc.get("created_at")
    if isinstance(created_at_val, str):
        created_at_dt = datetime.fromisoformat(created_at_val)
    elif isinstance(created_at_val, datetime):
        created_at_dt = created_at_val
    else:
        print(f"Warning: created_at is missing or invalid type for community {community_id}. Using current UTC time.")
        created_at_dt = datetime.now(timezone.utc)

    return CommunityResponse(
        id=community_doc["id"],
        name=community_doc["name"],
        description=community_doc["description"],
        creator_id=community_doc["creator_id"],
        member_ids=community_doc.get("member_ids", []),
        created_at=created_at_dt
    )

# --- Forum Category Endpoints ---
@router.post("/{community_id}/forum-categories", response_model=ForumCategoryResponse, status_code=201, tags=["Forum Categories"])
async def create_forum_category(
    community_id: str,
    category_data: ForumCategoryCreateRequest,
    user: AuthorizedUser
):
    """Create a new forum category within a community. Admin only."""
    community_doc = _get_community_doc_or_404(community_id)
    _ensure_admin_permission(community_doc, user)

    category_id = str(uuid.uuid4())
    created_at_dt = datetime.now(timezone.utc)

    stored_category_data = ForumCategoryStoredData(
        id=category_id,
        community_id=community_id,
        name=category_data.name,
        description=category_data.description,
        created_at=created_at_dt,
        is_deleted=False
    )
    
    storage_key = f"fcategory_{community_id}_{category_id}.json"
    
    try:
        db.storage.json.put(key=storage_key, value=stored_category_data.model_dump(mode='json'))
        print(f"Forum category '{stored_category_data.name}' saved with key: {storage_key}")
        
        # Return ForumCategoryResponse (without is_deleted field)
        return ForumCategoryResponse(
            id=category_id,
            community_id=community_id,
            name=stored_category_data.name,
            description=stored_category_data.description,
            created_at=created_at_dt
        )
    except Exception as e:
        print(f"Error saving forum category to db.storage.json: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create forum category: {str(e)}")

# Placeholder for GET, PUT, DELETE category endpoints
@router.get("/{community_id}/forum-categories", response_model=List[ForumCategoryResponse], tags=["Forum Categories"])
async def list_forum_categories(community_id: str):
    """List all non-deleted forum categories for a community."""
    # First, check if community exists to provide a friendly 404 if not
    _get_community_doc_or_404(community_id) # We don't need the doc itself, just to ensure it exists
    
    categories = []
    prefix_to_match = f"fcategory_{community_id}_"
    print(f"Fetching forum categories for community {community_id} with prefix '{prefix_to_match}'")

    try:
        all_category_files = db.storage.json.list()
        print(f"Found {len(all_category_files)} total JSON files in storage.")

        for file_info in all_category_files:
            key = file_info.name
            if key.startswith(prefix_to_match) and key.endswith(".json"):
                try:
                    category_stored_data_dict = db.storage.json.get(key)
                    # Validate that it's a dictionary and has the is_deleted flag
                    if isinstance(category_stored_data_dict, dict):
                        category_stored_data = ForumCategoryStoredData(**category_stored_data_dict)
                        if not category_stored_data.is_deleted:
                            # Convert to ForumCategoryResponse (which excludes is_deleted)
                            categories.append(
                                ForumCategoryResponse(
                                    id=category_stored_data.id,
                                    community_id=category_stored_data.community_id,
                                    name=category_stored_data.name,
                                    description=category_stored_data.description,
                                    created_at=category_stored_data.created_at
                                )
                            )
                            print(f"Added category '{category_stored_data.name}' to list for community {community_id}")
                        else:
                            print(f"Skipping deleted category with key: {key}")
                    else:
                        print(f"Skipping non-dict data for key: {key}")
                except FileNotFoundError:
                    print(f"File not found for key: {key} during list (should not happen if consistency is maintained)")
                except Exception as e:
                    print(f"Error processing category file {key}: {e}")
        
        print(f"Returning {len(categories)} non-deleted categories for community {community_id}")
        return categories
    except Exception as e:
        print(f"Error listing forum categories for community {community_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list forum categories: {str(e)}")


@router.put("/{community_id}/forum-categories/{category_id}", response_model=ForumCategoryResponse, tags=["Forum Categories"])
async def update_forum_category(
    community_id: str, 
    category_id: str, 
    category_update_data: ForumCategoryCreateRequest, # Re-using create request for update fields
    user: AuthorizedUser
):
    """Update an existing forum category. Admin only."""
    community_doc = _get_community_doc_or_404(community_id)
    _ensure_admin_permission(community_doc, user)

    storage_key = f"fcategory_{community_id}_{category_id}.json"
    print(f"Attempting to update category with key: {storage_key}")

    try:
        # Fetch existing category data
        try:
            existing_category_dict = db.storage.json.get(key=storage_key)
            if not isinstance(existing_category_dict, dict):
                print(f"Category data for {storage_key} is not a dict.")
                raise HTTPException(status_code=404, detail="Forum category not found or data corrupted")
            existing_category = ForumCategoryStoredData(**existing_category_dict)
        except FileNotFoundError:
            print(f"Forum category not found with key: {storage_key} for update.")
            raise HTTPException(status_code=404, detail="Forum category not found")

        # Check if it's marked as deleted
        if existing_category.is_deleted:
            print(f"Attempt to update an already deleted category: {storage_key}")
            raise HTTPException(status_code=404, detail="Forum category not found (it may have been deleted)")

        # Update fields
        existing_category.name = category_update_data.name
        existing_category.description = category_update_data.description
        # created_at, id, community_id, is_deleted remain unchanged by this operation

        db.storage.json.put(key=storage_key, value=existing_category.model_dump(mode='json'))
        print(f"Forum category '{existing_category.name}' updated with key: {storage_key}")

        return ForumCategoryResponse(
            id=existing_category.id,
            community_id=existing_category.community_id,
            name=existing_category.name,
            description=existing_category.description,
            created_at=existing_category.created_at
        )
    except HTTPException: # Re-raise HTTPExceptions directly
        raise
    except Exception as e:
        print(f"Error updating forum category {storage_key}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update forum category: {str(e)}")


@router.delete("/{community_id}/forum-categories/{category_id}", status_code=204, tags=["Forum Categories"])
async def delete_forum_category(community_id: str, category_id: str, user: AuthorizedUser):
    """Soft delete a forum category. Admin only. Returns 204 No Content on success."""
    community_doc = _get_community_doc_or_404(community_id)
    _ensure_admin_permission(community_doc, user)

    storage_key = f"fcategory_{community_id}_{category_id}.json"
    print(f"Attempting to soft-delete category with key: {storage_key}")

    try:
        # Fetch existing category data
        try:
            existing_category_dict = db.storage.json.get(key=storage_key)
            if not isinstance(existing_category_dict, dict):
                print(f"Category data for {storage_key} is not a dict for delete.")
                raise HTTPException(status_code=404, detail="Forum category not found or data corrupted")
            existing_category = ForumCategoryStoredData(**existing_category_dict)
        except FileNotFoundError:
            print(f"Forum category not found with key: {storage_key} for delete.")
            raise HTTPException(status_code=404, detail="Forum category not found")

        # If already marked as deleted, consider it a success (idempotent)
        if existing_category.is_deleted:
            print(f"Category {storage_key} is already marked as deleted.")
            return # No content, so just return

        # Mark as deleted and save
        existing_category.is_deleted = True
        # Update timestamp for deletion if we add such a field later, e.g., deleted_at = datetime.now(timezone.utc)
        
        db.storage.json.put(key=storage_key, value=existing_category.model_dump(mode='json'))
        print(f"Forum category '{existing_category.name}' (key: {storage_key}) marked as deleted.")
        
        # HTTP 204 No Content response is automatically handled by FastAPI for status_code=204 and no return value
        return

    except HTTPException: # Re-raise HTTPExceptions directly
        raise
    except Exception as e:
        print(f"Error soft-deleting forum category {storage_key}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete forum category: {str(e)}")
