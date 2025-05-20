from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import databutton as db
import json # Moved import json to top level

from app.auth import AuthorizedUser

router = APIRouter(prefix="/communities", tags=["Communities"])

# --- Firebase Admin SDK Initialization ---
app_firebase = None
firestore_db_client = None

print("[Firebase Init] Starting Firebase Admin SDK initialization process...")
try:
    firebase_secret_value = db.secrets.get("FIREBASE_SERVICE_ACCOUNT_KEY")
    if firebase_secret_value is None:
        print("[Firebase Init Error] FIREBASE_SERVICE_ACCOUNT_KEY secret is NOT SET. Cannot initialize Firebase.")
        # This is a critical failure, subsequent Firestore calls will fail.
        # Depending on app requirements, might raise an exception here to halt startup
    else:
        print("[Firebase Init] FIREBASE_SERVICE_ACCOUNT_KEY secret retrieved.")
        cred_json = json.loads(firebase_secret_value)
        cred = credentials.Certificate(cred_json)
        print("[Firebase Init] Credentials object created.")

        if not firebase_admin._apps:
            print("[Firebase Init] No Firebase app initialized yet. Initializing a new app...")
            app_firebase = firebase_admin.initialize_app(cred)
            print(f"[Firebase Init Success] Firebase Admin SDK initialized successfully. App name: {app_firebase.name}")
        else:
            print("[Firebase Init] Firebase app already initialized. Getting existing app...")
            app_firebase = firebase_admin.get_app() # Get the already initialized default app
            print(f"[Firebase Init Success] Using existing Firebase app. App name: {app_firebase.name}")
        
        if app_firebase:
            firestore_db_client = firestore.client(app=app_firebase)
            print("[Firebase Init Success] Firestore client obtained successfully.")
        else:
            print("[Firebase Init Error] Firebase app object is None after initialization/get attempt.")

except ValueError as e:
    print(f"[Firebase Init ValueError] A ValueError occurred: {e}")
except json.JSONDecodeError as e:
    print(f"[Firebase Init JSONError] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON: {e}")
except Exception as e:
    print(f"[Firebase Init Error] An unexpected error occurred: {e}")

if firestore_db_client is None:
    print("[Firebase Init Warning] firestore_db_client is None after initialization block. Firestore will not be available.")

# --- Pydantic Models ---
class JoinCommunityResponse(BaseModel):
    message: str
    community_id: str
    user_id: str

class CommunityMembershipStatus(BaseModel):
    is_member: bool
    is_creator: bool

# --- Helper Functions ---
async def get_community_data_and_key(community_id: str) -> tuple[dict, str]:
    """Fetches a community document by ID from db.storage.json or raises 404."""
    storage_key = f"community-{community_id}.json"
    try:
        community_data = db.storage.json.get(key=storage_key)
        if not community_data or not isinstance(community_data, dict):
            # Ensure it's a dict, as db.storage.json.get could return other types if key is misused
            print(f"[API Error] Community data for {storage_key} is not a valid dictionary or not found.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found or data invalid")
        return community_data, storage_key
    except FileNotFoundError:
        print(f"[API Error] Community file {storage_key} not found.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")
    except Exception as e:
        print(f"[API Error] Error fetching community {community_id} from db.storage.json: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error accessing community data")

# --- API Endpoints ---

@router.post("/{community_id}/join", response_model=JoinCommunityResponse)
async def join_community(
    community_id: str,
    current_user: AuthorizedUser
):
    """
    Allows an authenticated user to join a community.
    The user cannot join if they are the creator or already a member.
    """
    user_id = current_user.sub  # User's unique ID from Firebase Auth

    community_data, storage_key = await get_community_data_and_key(community_id)

    creator_id = community_data.get("creator_id")
    member_ids = community_data.get("member_ids", [])

    if creator_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Creator cannot join their own community as a member (already implicitly a member)."
        )

    if user_id in member_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this community."
        )

    # Add user to members list and update member count
    member_ids.append(user_id)
    new_member_count = len(member_ids)

    community_data["member_ids"] = member_ids
    # Update member_count if it exists, or add it.
    # The create_community endpoint in communities_api doesn't seem to add member_count,
    # so we should be mindful. Let's add/update it.
    community_data["member_count"] = new_member_count

    try:
        db.storage.json.put(key=storage_key, value=community_data)
        print(f"User {user_id} successfully joined community {community_id}. Data updated in {storage_key}.")
        return JoinCommunityResponse(
            message="Successfully joined community.",
            community_id=community_id,
            user_id=user_id
        )
    except Exception as e:
        print(f"Error updating db.storage.json for joining community {community_id} by user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update community membership."
        ) from e

@router.get("/{community_id}/membership_status", response_model=CommunityMembershipStatus)
async def get_community_membership_status(
    community_id: str,
    current_user: AuthorizedUser
):
    """
    Checks if the current authenticated user is a member or creator of a specific community.
    """
    user_id = current_user.sub
    
    community_data, _ = await get_community_data_and_key(community_id) # We don't need the key here for reads

    creator_id = community_data.get("creator_id")
    member_ids = community_data.get("member_ids", [])

    is_creator = (creator_id == user_id)
    is_member = (user_id in member_ids) or is_creator 

    return CommunityMembershipStatus(is_member=is_member, is_creator=is_creator)

# Placeholder for list_all_communities - will be filled by MYA-26
# @router.get("", response_model=CommunityListResponse)
# async def list_all_communities_endpoint(offset: int = 0, limit: int = 20):
#     pass

# Placeholder for list_my_communities - might need to be moved or integrated
# @router.get("/my", response_model=List[MyCommunityDetail])
# async def list_my_communities_endpoint(current_user: AuthorizedUser = Depends(AuthorizedUser)):
#     pass

# Placeholder for create_community - will be filled by a future task
# @router.post("", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
# async def create_community_endpoint(community_data: CreateCommunityRequest, current_user: AuthorizedUser = Depends(AuthorizedUser)):
#     pass
