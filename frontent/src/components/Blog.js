import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../components/styles.css';

function Blog() {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [fullName, setFullName] = useState('');  // Tên của user hiện tại
    const [editingPostId, setEditingPostId] = useState(null);  // Lưu trữ ID của post đang edit
    const [username, setUsername] = useState('');  // Username của người dùng
    const [password, setPassword] = useState('');  // Password của người dùng
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Kiểm tra trạng thái đăng nhập
    const [showDropdown, setShowDropdown] = useState(false); // Kiểm tra trạng thái dropdown
    const [showModal, setShowModal] = useState(false); // Kiểm tra trạng thái modal
    const [isLogin, setIsLogin] = useState(true); // Kiểm tra xem modal đang ở trạng thái login hay signup
    const [showEditModal, setShowEditModal] = useState(false);  // Hiển thị modal Edit

    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/posts/');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const createOrEditPost = async () => {
        if (editingPostId) {
            // Nếu có ID bài viết đang chỉnh sửa thì gọi API cập nhật bài viết
            try {
                await axios.put(`http://localhost:8000/posts/${editingPostId}`, {
                    title,
                    content,
                    image,
                    author: fullName
                });
                alert('Post updated successfully!');
                setEditingPostId(null);  // Reset sau khi cập nhật xong
                setTitle('');
                setContent('');
                setImage('');
                setShowEditModal(false);  // Ẩn modal chỉnh sửa
                fetchPosts();  // Tải lại danh sách bài viết sau khi cập nhật
            } catch (error) {
                console.error('Error editing post:', error);
            }
        } else {
            // Nếu không có ID, thì tạo bài viết mới
            try {
                await axios.post('http://localhost:8000/posts/', {
                    title,
                    content,
                    image,
                    author: fullName // Thêm tên tác giả
                });
                fetchPosts();
                setTitle('');
                setContent('');
                setImage('');
            } catch (error) {
                console.error('Error creating post:', error);
            }
        }
    };
    
    
    const editPost = (post) => {
        setTitle(post.title);
        setContent(post.content);
        setImage(post.image);
        setEditingPostId(post._id);  // Lưu lại ID bài viết đang chỉnh sửa
        setShowEditModal(true);  // Hiển thị modal chỉnh sửa
        console.log("Editing Post ID:", post._id);  // Kiểm tra giá trị ID
    };
    
    

    const deletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`http://localhost:8000/posts/${postId}`);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/login/', {
                username: username,
                password: password,
            });
            setFullName(response.data.full_name); // Lưu tên đầy đủ của người dùng
            setIsLoggedIn(true); // Đánh dấu người dùng đã đăng nhập
            alert('Login successful!');
            // Reset form fields
            setUsername('');
            setPassword('');
            setShowModal(false);
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed! Please check your credentials.');
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/users/', {
                full_name: fullName,
                username,
                password,
            });
            alert('User created successfully! You can now log in.');
            // Reset form fields
            setFullName('');
            setUsername('');
            setPassword('');
            setIsLogin(true); // Switch to login form after successful signup
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Sign up failed! Please try again.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setFullName('');
        setShowDropdown(false);
        alert('You have been logged out.');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const openModal = () => {
        setShowModal(true);
        setIsLogin(true); // Default to login form when opening modal
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const switchToSignUp = () => {
        setIsLogin(false);
    };

    const switchToLogin = () => {
        setIsLogin(true);
    };

    return (
        <div className="blog-app">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <h1>My Blog App</h1>
                </div>
                <div className="header-right">
                    {isLoggedIn ? (
                        <div className="user-menu" ref={dropdownRef}>
                            <span className="user-name" onClick={toggleDropdown}>
                                {fullName} &#x25BC;
                            </span>
                            {showDropdown && (
                                <div className="dropdown">
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-links">
                            <span className="auth-text" onClick={openModal}>
                                Login / Signup
                            </span>
                        </div>
                    )}
                </div>
            </header>
    
            {/* Modal Login/Signup */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        {isLogin ? (
                            <div className="modal-form">
                                <h2>Login</h2>
                                <form onSubmit={handleLogin}>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="modal-input"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="modal-input"
                                    />
                                    <button type="submit" className="modal-button">Login</button>
                                </form>
                                <p className="toggle-text">
                                    Don't have an account?{' '}
                                    <span className="toggle-link" onClick={switchToSignUp}>
                                        Sign Up
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div className="modal-form">
                                <h2>Sign Up</h2>
                                <form onSubmit={handleSignUp}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="modal-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="modal-input"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="modal-input"
                                    />
                                    <button type="submit" className="modal-button">Sign Up</button>
                                </form>
                                <p className="toggle-text">
                                    Already have an account?{' '}
                                    <span className="toggle-link" onClick={switchToLogin}>
                                        Login
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
    
            {/* Modal Edit Post */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={() => setShowEditModal(false)}>&times;</span>
                        <h2>Edit Post</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="post-input"
                        />
                        <textarea
                            placeholder="Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="post-textarea"
                        />
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="post-input"
                        />
                        <button onClick={createOrEditPost} className="post-button">
                            Update Post
                        </button>
                    </div>
                </div>
            )}
    
            {/* Main Content */}
            <div className="blog-container">
                <h2>Welcome to the Blog App</h2>
                {isLoggedIn ? (
                    <div>
                        <div className="create-post">
                            <h2>Create a New Post</h2>
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="post-input"
                            />
                            <textarea
                                placeholder="Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="post-textarea"
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="post-input"
                            />
                            <button onClick={createOrEditPost} className="post-button">
                                Create Post
                            </button>
                        </div>
                        <div className="blog-posts">
                            {posts.map((post) => (
                                <div className="blog-post" key={post._id}>
                                    <h3>{post.title}</h3>
                                    {post.image && <img src={post.image} alt={post.title} className="post-image" />}
                                    <p>{post.content}</p>
                                    <p><strong>By: {post.author}</strong></p>
                                    <div className="post-actions">
                                        <button onClick={() => editPost(post)} className="post-action-button">Edit</button>
                                        <button onClick={() => deletePost(post._id)} className="post-action-button delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="welcome-message">
                        <p>Please log in or sign up to create and manage blog posts.</p>
                    </div>
                )}
            </div>
        </div>
    );    
}

export default Blog;
