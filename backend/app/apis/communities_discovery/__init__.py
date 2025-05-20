import uuid
from typing import List, Optional

import databutton as db
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(tags=["Community Discovery"])

COMMUNITY_KEY_PREFIX = "community-"  # Confirmed from forum_topics API


class CommunityBasicInfo(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    member_count: int = 0
    # TODO: Potentially add creator_display_name if easy and user data is accessible

    class Config:
        from_attributes = True # Pydantic V2 equivalent of orm_mode


class CommunityListResponse(BaseModel):
    communities: List[CommunityBasicInfo]
    total_count: int


@router.get("/communities", response_model=CommunityListResponse)
async def list_all_communities(
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Limit for pagination")
):
    """List all available, non-deleted communities with basic information."""
    all_community_infos = [] 
    community_keys = []

    try:
        all_json_files = db.storage.json.list()
        for file_info in all_json_files:
            if file_info.name.startswith(COMMUNITY_KEY_PREFIX) and file_info.name.endswith(".json"):
                community_keys.append(file_info.name)
    except Exception as e:
        print(f"Error listing community files from storage: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving community list")

    # Paginate keys before loading data
    paginated_keys = community_keys[offset : offset + limit]

    for key in paginated_keys:
        try:
            community_data = db.storage.json.get(key)
            if isinstance(community_data, dict) and not community_data.get("is_deleted", False):
                # Ensure ID is UUID object
                if isinstance(community_data.get("id"), str):
                    community_data["id"] = uuid.UUID(community_data["id"])
                elif not isinstance(community_data.get("id"), uuid.UUID):
                    print(f"Skipping community {key} due to invalid or missing ID type.")
                    continue # Skip if ID is not a string or UUID

                member_ids = community_data.get("member_ids", [])
                if not isinstance(member_ids, list):
                    member_ids = [] # Default to empty list if not a list
                
                basic_info = CommunityBasicInfo(
                    id=community_data["id"],
                    name=community_data.get("name", "Unnamed Community"),
                    description=community_data.get("description"),
                    member_count=len(member_ids)
                )
                all_community_infos.append(basic_info)
        except FileNotFoundError:
            # Should not happen if key came from list(), but handle defensively
            print(f"Community file {key} listed but not found during retrieval.")
        except Exception as e:
            print(f"Error processing community data for key {key}: {e}")
            # Optionally, decide if a single bad record should stop the whole list

    return CommunityListResponse(
        communities=all_community_infos,
        total_count=len(community_keys) # Total count of all found (non-paginated) communities
    )
