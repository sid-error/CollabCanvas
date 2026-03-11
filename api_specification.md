# CollabCanvas API Integration Testing Specification (Postman)

This document details the complete REST API endpoints required for integration testing of the **CollabCanvas** application via Postman.

## Authentication

### 1. Register User
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Authentication**: Public
- **Description**: Registers a new user account with email verification and password validation.
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "agreedToTerms": true
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Registration successful. Please check your email for confirmation."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/register' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"username": "johndoe", "email": "john.doe@example.com", "password": "SecurePassword123!", "agreedToTerms": true}'
  ```

### 2. Login User
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Authentication**: Public
- **Description**: Authenticates user credentials and returns a JWT token.
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "johndoe"
  }
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/login' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"email": "john.doe@example.com", "password": "SecurePassword123!"}'
  ```

### 3. Google OAuth Login
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/google`
- **Authentication**: Public
- **Description**: Authenticates user using a provided Google OAuth 2.0 token.
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "idToken": "ya29.a0AfH6SMC..."
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "token": "eyJhb...",
  "user": {
    "id": "123",
    "username": "John Doe"
  }
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/google' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"idToken": "ya29.a0AfH6SMC..."}'
  ```

### 4. Logout
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **Authentication**: JWT
- **Description**: Invalidates the current user session/token.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body (JSON Example)**:
  ```json
  {}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Successfully logged out"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/logout' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 5. Request Password Reset
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/forgot-password`
- **Authentication**: Public
- **Description**: Generates a reset token and sends a reset email.
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "email": "john.doe@example.com"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Password reset email sent."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/forgot-password' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"email": "john.doe@example.com"}'
  ```

### 6. Reset Password
- **Module**: Authentication
- **Method**: `POST`
- **Route**: `/api/auth/reset-password`
- **Authentication**: Public
- **Description**: Resets the user's password using the token provided via email.
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "token": "reset-token-12345",
  "newPassword": "NewSecurePassword123!"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Password has been successfully reset."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/auth/reset-password' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"token": "reset-token-12345", "newPassword": "NewSecurePassword123!"}'
  ```

### 7. Delete Account
- **Module**: Authentication
- **Method**: `DELETE`
- **Route**: `/api/auth/account`
- **Authentication**: JWT
- **Description**: Permanently deletes the currently authenticated user's account.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "password": "SecurePassword123!"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Account successfully deleted."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request DELETE 'http://localhost:5000/api/auth/account' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"password": "SecurePassword123!"}'
  ```

## Profile Management

### 8. Get User Profile
- **Module**: Profile Management
- **Method**: `GET`
- **Route**: `/api/profile`
- **Authentication**: JWT
- **Description**: Retrieves the full profile details for the authenticated user.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "data": {
    "username": "johndoe",
    "bio": "Creative thinker",
    "theme": "dark"
  }
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/profile' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 9. Update Profile Information
- **Module**: Profile Management
- **Method**: `PUT`
- **Route**: `/api/profile`
- **Authentication**: JWT
- **Description**: Updates personal info such as display name and bio.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "displayName": "John D.",
  "bio": "Updated bio text."
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Profile updated successfully."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/profile' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"displayName": "John D.", "bio": "Updated bio text."}'
  ```

### 10. Upload Profile Picture
- **Module**: Profile Management
- **Method**: `POST`
- **Route**: `/api/profile/picture`
- **Authentication**: JWT
- **Description**: Uploads and updates the user's profile picture using multipart/form-data.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "file": "(binary image file)"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "pictureUrl": "https://cdn.example.com/profiles/123.jpg"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/profile/picture' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: multipart/form-data' \\
  --form 'file=@"/path/to/image.jpg"'
  ```

### 11. Remove Profile Picture
- **Module**: Profile Management
- **Method**: `DELETE`
- **Route**: `/api/profile/picture`
- **Authentication**: JWT
- **Description**: Removes the user's custom profile picture, reverting to default.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Profile picture removed."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request DELETE 'http://localhost:5000/api/profile/picture' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 12. Update Theme Preference
- **Module**: Profile Management
- **Method**: `PUT`
- **Route**: `/api/profile/settings/theme`
- **Authentication**: JWT
- **Description**: Updates the user's preferred application theme (light, dark, system).
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "theme": "dark"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Theme preference updated."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/profile/settings/theme' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"theme": "dark"}'
  ```

### 13. Update Notification Settings
- **Module**: Profile Management
- **Method**: `PUT`
- **Route**: `/api/profile/settings/notifications`
- **Authentication**: JWT
- **Description**: Updates user opt-in status and preferences for notifications.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "inApp": true,
  "email": false,
  "sound": true
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Notification settings updated."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/profile/settings/notifications' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"inApp": true, "email": false, "sound": true}'
  ```

### 14. Update Keyboard Shortcuts
- **Module**: Profile Management
- **Method**: `PUT`
- **Route**: `/api/profile/settings/shortcuts`
- **Authentication**: JWT
- **Description**: Customizes the keyboard shortcuts for drawing tools.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "undo": "Ctrl+Z",
  "brush": "B",
  "eraser": "E"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Shortcuts updated successfuly."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/profile/settings/shortcuts' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"undo": "Ctrl+Z", "brush": "B", "eraser": "E"}'
  ```

## Room Management

### 15. Create Room
- **Module**: Room Management
- **Method**: `POST`
- **Route**: `/api/rooms`
- **Authentication**: JWT
- **Description**: Creates a new collaborative drawing room.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "name": "Brainstorming Session",
  "description": "Design ideas map",
  "isPrivate": false
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "roomId": "rm-9876",
  "roomCode": "A1B2C3D4"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"name": "Brainstorming Session", "description": "Design ideas map", "isPrivate": false}'
  ```

### 16. Join Room Using Code
- **Module**: Room Management
- **Method**: `POST`
- **Route**: `/api/rooms/join`
- **Authentication**: JWT / Public
- **Description**: Validates a room code (and optional password) and adds user as participant.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "roomCode": "A1B2C3D4",
  "password": ""
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "roomId": "rm-9876",
  "wsToken": "ws-token-abc..."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/join' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"roomCode": "A1B2C3D4", "password": ""}'
  ```

### 17. Leave Room
- **Module**: Room Management
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/leave`
- **Authentication**: JWT
- **Description**: Removes the user from the room's active participant list.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Successfully left the room."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/leave' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 18. List Public Rooms
- **Module**: Room Management
- **Method**: `GET`
- **Route**: `/api/rooms/public`
- **Authentication**: JWT / Public
- **Description**: Retrieves a paginated gallery of active public rooms.
- **Headers**:
  ```http
  (None)
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "rooms": [
    {
      "id": "rm-9876",
      "name": "Public Draw",
      "participants": 4
    }
  ]
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/public'
  ```

### 19. Search Rooms
- **Module**: Room Management
- **Method**: `GET`
- **Route**: `/api/rooms/search?q=design`
- **Authentication**: JWT
- **Description**: Searches available public rooms by name or tag.
- **Headers**:
  ```http
  (None)
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "results": [
    {
      "id": "rm-123",
      "name": "Design Team"
    }
  ]
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/search?q=design'
  ```

### 20. Invite Users via Room Code
- **Module**: Room Management
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/invite`
- **Authentication**: JWT
- **Description**: Generates a shareable invitation link or code.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "expirationHours": 24
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "inviteLink": "https://collabcanvas.app/j/A1B2C3D4"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/invite' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 21. Update Room Settings
- **Module**: Room Management
- **Method**: `PUT`
- **Route**: `/api/rooms/:roomId`
- **Authentication**: JWT
- **Description**: Updates room metadata (name, description, visibility, password).
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "name": "Updated Room Name",
  "isPrivate": true,
  "password": "newpass"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Room settings updated."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/rooms/:roomId' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"name": "Updated Room Name", "isPrivate": true, "password": "newpass"}'
  ```

### 22. Delete Room
- **Module**: Room Management
- **Method**: `DELETE`
- **Route**: `/api/rooms/:roomId`
- **Authentication**: JWT
- **Description**: Permanently deletes a room and kicks all participants.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Room successfully deleted."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request DELETE 'http://localhost:5000/api/rooms/:roomId' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 23. Manage Participants
- **Module**: Room Management
- **Method**: `PUT`
- **Route**: `/api/rooms/:roomId/participants/:participantId`
- **Authentication**: JWT
- **Description**: Changes a participant's role (admin, editor, viewer), kicks, or bans them.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "action": "ban",
  "reason": "inappropriate conduct"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Participant banned successfully."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/rooms/:roomId/participants/:participantId' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"action": "ban", "reason": "inappropriate conduct"}'
  ```

### 24. Get User's Previous Rooms
- **Module**: Room Management
- **Method**: `GET`
- **Route**: `/api/rooms/history`
- **Authentication**: JWT
- **Description**: Retrieves the user's dashboard populated with recently active rooms.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "rooms": [
    {
      "id": "rm-1",
      "name": "Old Canvas",
      "lastVisited": "2023-10-01"
    }
  ]
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/history' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

## Canvas System

### 25. Send Drawing Strokes
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/strokes`
- **Authentication**: JWT
- **Description**: Submits a new drawing path to the canvas state.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "points": [
    {
      "x": 10,
      "y": 20
    },
    {
      "x": 12,
      "y": 22
    }
  ],
  "color": "#000000",
  "brushSize": 5
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "strokeId": "strk-xyz"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/strokes' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"points": [{"x": 10, "y": 20}, {"x": 12, "y": 22}], "color": "#000000", "brushSize": 5}'
  ```

### 26. Add Shapes
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/shapes`
- **Authentication**: JWT
- **Description**: Submits a standard geometric shape (rectangle, circle) to the canvas.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "width": 50,
  "height": 50,
  "fill": "#ff0000"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "shapeId": "shp-123"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/shapes' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"type": "rectangle", "x": 100, "y": 100, "width": 50, "height": 50, "fill": "#ff0000"}'
  ```

### 27. Add Text
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/texts`
- **Authentication**: JWT
- **Description**: Adds a text box object to the canvas with styling properties.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "text": "Hello Team",
  "fontFamily": "Arial",
  "fontSize": 14,
  "x": 50,
  "y": 50
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "textId": "txt-456"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/texts' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"text": "Hello Team", "fontFamily": "Arial", "fontSize": 14, "x": 50, "y": 50}'
  ```

### 28. Insert Image
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/images`
- **Authentication**: JWT
- **Description**: Uploads and inserts an image to the canvas.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "file": "(binary image file)",
  "x": 10,
  "y": 10
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "imageId": "img-789",
  "url": "https://cdn.example..."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/images' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: multipart/form-data' \\
  --form 'file=@"/path/to/image.jpg"'
  ```

### 29. Move Objects
- **Module**: Canvas System
- **Method**: `PUT`
- **Route**: `/api/rooms/:roomId/canvas/objects/:objectId`
- **Authentication**: JWT
- **Description**: Updates the positional and transformational coordinates of an object.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "x": 150,
  "y": 200,
  "rotation": 45
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Object moved."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request PUT 'http://localhost:5000/api/rooms/:roomId/canvas/objects/:objectId' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"x": 150, "y": 200, "rotation": 45}'
  ```

### 30. Delete Objects
- **Module**: Canvas System
- **Method**: `DELETE`
- **Route**: `/api/rooms/:roomId/canvas/objects/:objectId`
- **Authentication**: JWT
- **Description**: Removes a specific object or path from the canvas rendering.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Object deleted."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request DELETE 'http://localhost:5000/api/rooms/:roomId/canvas/objects/:objectId' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 31. Undo / Redo
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/history`
- **Authentication**: JWT
- **Description**: Triggers a server-side undo or redo operation for the user's history.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "action": "undo"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "newState": {
    "objects": []
  }
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/history' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"action": "undo"}'
  ```

### 32. Clear Canvas
- **Module**: Canvas System
- **Method**: `DELETE`
- **Route**: `/api/rooms/:roomId/canvas`
- **Authentication**: JWT
- **Description**: Wipes all objects from the room's canvas.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "message": "Canvas cleared."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request DELETE 'http://localhost:5000/api/rooms/:roomId/canvas' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 33. Manage Layers
- **Module**: Canvas System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/layers`
- **Authentication**: JWT
- **Description**: Creates, toggles visibility, locks, or reorders a canvas layer.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "action": "add",
  "layerName": "Background"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "layerId": "lyr-1"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/layers' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"action": "add", "layerName": "Background"}'
  ```

## Real-Time Collaboration

### 34. Join WebSocket Room
- **Module**: Real-Time Collaboration
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/ws-ticket`
- **Authentication**: JWT
- **Description**: Obtains a secure ticket to establish a WebSocket connection.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "ticket": "ws-sec-tk-..."
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/ws-ticket' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 35. Broadcast Drawing Event
- **Module**: Real-Time Collaboration
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/events/drawing`
- **Authentication**: JWT
- **Description**: REST equivalent to broadcast a drawing event to peers.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "eventType": "DRAW_START",
  "data": {
    "x": 10,
    "y": 10
  }
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "broadcasted": true
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/events/drawing' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"eventType": "DRAW_START", "data": {"x": 10, "y": 10}}'
  ```

### 36. Broadcast Cursor Movement
- **Module**: Real-Time Collaboration
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/events/cursor`
- **Authentication**: JWT
- **Description**: REST equivalent to broadcast live user cursor coordinates.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "userId": "123",
  "x": 450,
  "y": 300
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/events/cursor' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"userId": "123", "x": 450, "y": 300}'
  ```

### 37. Notify User Joined / Left
- **Module**: Real-Time Collaboration
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/events/presence`
- **Authentication**: JWT
- **Description**: REST equivalent to manually broadcast presence changes.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "event": "USER_JOINED",
  "userId": "123"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/events/presence' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"event": "USER_JOINED", "userId": "123"}'
  ```

### 38. Object Locking
- **Module**: Real-Time Collaboration
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/canvas/objects/:objectId/lock`
- **Authentication**: JWT
- **Description**: Claims a lock on an object to prevent conflicting simultaneous edits.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "lock": true
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "lockedBy": "user-123"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/canvas/objects/:objectId/lock' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"lock": true}'
  ```

## Export System

### 39. Export Canvas as PNG
- **Module**: Export System
- **Method**: `GET`
- **Route**: `/api/rooms/:roomId/export?format=png&quality=0.8`
- **Authentication**: JWT
- **Description**: Renders the current canvas into a high-quality PNG image file.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response**:
  `(Binary PNG file stream)`
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/:roomId/export?format=png&quality=0.8' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### 40. Export Canvas as SVG
- **Module**: Export System
- **Method**: `GET`
- **Route**: `/api/rooms/:roomId/export?format=svg`
- **Authentication**: JWT
- **Description**: Renders the current canvas into a scalable vector graphic (SVG).
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response**:
  `(XML text data)`
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/:roomId/export?format=svg' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

## Chat System

### 41. Send Chat Message
- **Module**: Chat System
- **Method**: `POST`
- **Route**: `/api/rooms/:roomId/chat`
- **Authentication**: JWT
- **Description**: Broadcasts a chat message to all connected peers in the room.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body (JSON Example)**:
  ```json
  {
  "message": "Has anyone seen my red circle?"
}
  ```
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "messageId": "msg-111",
  "timestamp": "2023-10-01T10:00:00Z"
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request POST 'http://localhost:5000/api/rooms/:roomId/chat' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{"message": "Has anyone seen my red circle?"}'
  ```

### 42. Get Chat History
- **Module**: Chat System
- **Method**: `GET`
- **Route**: `/api/rooms/:roomId/chat`
- **Authentication**: JWT
- **Description**: Retrieves the historical chat logs for the room.
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: `(None)`
- **Expected Response (JSON Example)**:
  ```json
  {
  "success": true,
  "messages": [
    {
      "id": "msg-111",
      "sender": "John",
      "text": "Hello",
      "time": "2023-10-01T10:00:00Z"
    }
  ]
}
  ```
- **Postman-ready Request Example (cURL)**:
  ```bash
  curl --location --request GET 'http://localhost:5000/api/rooms/:roomId/chat' \\
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

