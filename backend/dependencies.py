from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt # You might need `pip install python-jose` or `pip install PyJWT`
import os

# This is the same secret used by NextAuth.js on the frontend
# In production, ensure this is loaded securely from environment variables
NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET", "dev-secret-do-not-use-in-prod")

oauth2_scheme = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    """
    Dependency to extract and validate the user ID from the NextAuth.js JWT.
    """
    token = credentials.credentials # This is the JWT from the "Bearer" header

    try:
        # Decode the JWT. Ensure the secret matches your NextAuth.js secret.
        # For production, you might want to verify issuer, audience, etc.
        payload = jwt.decode(token, NEXTAUTH_SECRET, algorithms=["HS256"])

        # The 'userId' is what we stored in the NextAuth.js JWT callback
        user_id: str = payload.get("userId")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: User ID missing in token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {e}",
        )
