# AI E-Commerce Marketplace API Documentation

## Base URL

Development:

http://localhost:5000/api

Authentication Endpoints

Endpoint Method Path Description
Sign Up POST /api/auth/sign-up Create a new user account
Sign In POST /api/auth/sign-in Log in with email and password
Social Login GET /api/auth/[provider] Authenticate with social provider
Sign Out POST /api/auth/sign-out Log out the current user
Forgot Password POST /api/auth/forgot-password Request password reset
Reset Password POST /api/auth/reset-password Reset password with token
Verify Email POST /api/auth/verify-email Verify user email address

Product Endpoints

Endpoint Method Path Description
Get All Products GET /api/products Get all products with optional filters
Get Single Product GET /api/products/:id Get a single product by ID
Create Product POST /api/products Create a new product
Update Product PUT /api/products/:id Update a product
Delete Product DELETE /api/products/:id Delete a product
Product Search GET /api/products/search Search products by keyword
AI Product Search GET /api/products/ai-search Search products using AI

Category Endpoints

Endpoint Method Path Description
Get All Categories GET /api/categories Get all categories with optional filters
Get Single Category GET /api/categories/:id Get a single category by ID
Create Category POST /api/categories Create a new category
Update Category PUT /api/categories/:id Update a category
Delete Category DELETE /api/categories/:id Delete a category

Order Endpoints

Endpoint Method Path Description
Get All Orders GET /api/orders Get all orders with optional filters
Get Single Order GET /api/orders/:id Get a single order by ID
Create Order POST /api/orders Create a new order
Update Order PUT /api/orders/:id Update an order
Delete Order DELETE /api/orders/:id Delete an order

Payment Endpoints

Endpoint Method Path Description
Create Payment Intent POST /api/payments/create-payment-intent Create a payment intent
Stripe Webhook POST /api/payments/webhook Handle Stripe webhook events

Cart Endpoints

Endpoint Method Path Description
Get Cart GET /api/cart Get current user's cart
Add Item to Cart POST /api/cart/items Add an item to cart
Update Cart Item PUT /api/cart/items/:itemId Update cart item quantity
Remove Cart Item DELETE /api/cart/items/:itemId Remove item from cart
Clear Cart DELETE /api/cart Clear entire cart

Wishlist Endpoints

Endpoint Method Path Description
Get Wishlist GET /api/wishlist Get current user's wishlist
Add Item to Wishlist POST /api/wishlist/items Add an item to wishlist
Remove Wishlist Item DELETE /api/wishlist/items/:itemId Remove item from wishlist
Clear Wishlist DELETE /api/wishlist Clear entire wishlist

Review Endpoints

Endpoint Method Path Description
Get Product Reviews GET /api/reviews Get reviews for a product
Create Review POST /api/reviews Create a new review
Update Review PUT /api/reviews/:id Update a review
Delete Review DELETE /api/reviews/:id Delete a review

AI Endpoints

Endpoint Method Path Description
AI Product Search GET /api/ai/products/search Search products using AI
AI Recommendations GET /api/ai/recommendations Get product recommendations

User Endpoints

Endpoint Method Path Description
Get User Profile GET /api/users/me Get current user profile
Update User Profile PUT /api/users/me Update user profile

Blog Endpoints

Endpoint Method Path Description
Get All Blogs GET /api/blogs Get all blogs with optional filters
Get Single Blog GET /api/blogs/:id Get a single blog by ID
Create Blog POST /api/blogs Create a new blog
Update Blog PUT /api/blogs/:id Update a blog
Delete Blog DELETE /api/blogs/:id Delete a blog

Newsletter Endpoints

Endpoint Method Path Description
Subscribe to Newsletter POST /api/newsletter/subscribe Subscribe to newsletter
Unsubscribe from Newsletter DELETE /api/newsletter/unsubscribe Unsubscribe from newsletter  