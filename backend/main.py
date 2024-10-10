from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Thay đổi cho phù hợp với frontend của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối MongoDB
client = MongoClient(os.environ.get("MONGODB_URL", "mongodb://localhost:27017"))
db = client.blog_database

# Mô hình dữ liệu cho bài viết
class BlogPost(BaseModel):
    title: str
    content: str
    image: str
    author: str  # Thêm trường author

class User(BaseModel):
    full_name: str
    username: str
    password: str

class Login(BaseModel):
    username: str
    password: str

@app.post("/login/")
async def login(login: Login):
    user = db.users.find_one({"username": login.username, "password": login.password})
    if user:
        return {"message": "Login successful", "full_name": user["full_name"]}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")

@app.post("/users/")
async def create_user(user: User):
    db.users.insert_one(user.dict())
    return {"message": "User created successfully"}

@app.post("/login/")
async def login(username: str, password: str):
    user = db.users.find_one({"username": username, "password": password})
    if user:
        return {"message": "Login successful", "full_name": user["full_name"]}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")

@app.post("/posts/")
async def create_post(post: BlogPost):
    db.posts.insert_one(post.dict())
    return post

@app.get("/posts/")
async def get_posts():
    posts = []
    for post in db.posts.find():
        post["_id"] = str(post["_id"])
        posts.append(post)
    return posts

@app.put("/posts/{post_id}")
async def edit_post(post_id: str, post: BlogPost):
    existing_post = db.posts.find_one({"_id": ObjectId(post_id)})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"title": post.title, "content": post.content, "image": post.image}}
    )
    updated_post = db.posts.find_one({"_id": ObjectId(post_id)})
    updated_post["_id"] = str(updated_post["_id"])
    return updated_post

@app.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    result = db.posts.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}
