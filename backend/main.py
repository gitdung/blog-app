from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client['blog_database']
posts_collection = db['posts']

class BlogPost(BaseModel):
    id: str = None
    title: str
    content: str
    image: str

@app.post("/posts/")
async def create_post(post: BlogPost):
    result = await db.posts.insert_one(post.dict(exclude={"id"}))
    post.id = str(result.inserted_id)
    return JSONResponse(status_code=201, content=post.dict())

@app.get("/posts/")
async def get_posts():
    posts = []
    async for post in db.posts.find():
        post["_id"] = str(post["_id"])
        posts.append(post)
    return posts

@app.put("/posts/{post_id}")
async def update_post(post_id: str, post: BlogPost):
    result = await db["posts"].update_one({"_id": ObjectId(post_id)}, {"$set": post.dict()})
    if result.modified_count == 1:
        updated_post = await db["posts"].find_one({"_id": ObjectId(post_id)})
        return updated_post
    raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found")


@app.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return JSONResponse(status_code=204)

