import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

function Blog() {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(''); 
    const [editingPostId, setEditingPostId] = useState(null); 

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:8000/posts/');
        setPosts(response.data);
    };

    const createPost = async () => {
        try {
            await axios.post('http://localhost:8000/posts/', {
                title,
                content,
                image, 
            });
            fetchPosts();
            setTitle('');
            setContent('');
            setImage(''); 
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const deletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:8000/posts/${postId}`);
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const editPost = (post) => {
        setTitle(post.title);
        setContent(post.content);
        setImage(post.image); 
        setEditingPostId(post._id);
    };

    const updatePost = async () => {
        try {
            await axios.put(`http://localhost:8000/posts/${editingPostId}`, {
                title,
                content,
                image, 
            });
            fetchPosts();
            setTitle('');
            setContent('');
            setImage(''); 
            setEditingPostId(null);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    return (
        <div className="blog-container">
            <h1>Blog Posts</h1>
            <div className="create-post">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />
                {editingPostId ? (
                    <button onClick={updatePost}>Update Post</button>
                ) : (
                    <button onClick={createPost}>Create Post</button>
                )}
            </div>
            <div className="blog-posts">
                {posts.map((post) => (
                    <div className="blog-post" key={post._id}>
                        <h2>{post.title}</h2>
                        <img src={post.image} alt={post.title} />
                        <p>{post.content}</p>
                        <button onClick={() => editPost(post)}>Edit</button>
                        <button onClick={() => deletePost(post._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blog;
