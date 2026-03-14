from http.client import HTTPException
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile
from fastapi.responses import HTMLResponse
from connections.connections_manager import ConnectionManager
import shutil
from database.create_db_tables import create_db_tables
from sqlmodel import Session
from database.models import Room
from database.database import engine

# @app.post("/upload-mp3")
# async def upload_mp3(file : UploadFile):
#     """
#     Step 1:
#     Download an mp3 audio the mp3/mpeg format.
#     """
#     if file.content_type != "audio/mpeg":
#         raise HTTPException(
#             status_code=415,
#             detail=f"Unsupported file type: {file.content_type}. Only audio/mpeg is allowed."
#         )
    
#     safe_filename = UPLOAD_DIR / file.filename

#     try:
#         # Use shutil.copyfileobj for efficient file saving (handles large files well)
#         with open(safe_filename, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"There was an error uploading the file: {e}"
#         )
#     finally:
#         await file.close() # Ensure the UploadFile is closed

#     return {
#         "filename": file.filename,
#         "content_type": file.content_type,
#         "location": str(safe_filename)
#     }


# async def stream_mp3_bytes(file_path, chunk_size = 1024):
#     try:
#         with open(file_path, 'rb') as f:
#             while True:
#                 # Read a chunk of bytes
#                 data = f.read(chunk_size)
#                 if not data:
#                     # If no more data, the stream is finished
#                     break
#                 yield data
#     except IOError as e:
#         print(f"Error opening or reading file: {e}")
