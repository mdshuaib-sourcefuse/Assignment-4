# User Management Table (TypeScript + HTML + CSS)

## Project Description

This project is a User Management Table built using TypeScript, HTML, and CSS. It displays user data in a tabular format and allows performing common CRUD-style operations such as load, edit, update, delete, and refresh directly from the UI.

The main objective of this project is to demonstrate:

* TypeScript Object-Oriented Programming (OOP) concepts
* Use of Enums, Interfaces, and Generics
* Practical use of a Decorator for date-time formatting
* DOM manipulation without using any external framework

---

## Features

* Display user list in an HTML table
* Load and refresh data functionality
* Inline Edit / Save / Cancel actions per row
* Delete user records
* Input validation (name, email, phone, address)
* Role management using enum
* Formatted createdAt date using a custom Decorator

---

## Tech Stack

* TypeScript – application logic and data handling
* HTML – table structure and layout
* CSS – styling and UI presentation
* JavaScript – compiled output from TypeScript for browser execution

---

## Code Structure Overview

### Roles Enum

Defines user roles in a type-safe way.

```ts
enum Roles {
  SUPERADMIN = "SuperAdmin",
  ADMIN = "Admin",
  SUBSCRIBER = "Subscriber",
}
```

---

### DateTimeFormatter Decorator

Used to format date and time when displaying createdAt in the table.

```ts
@DateTimeFormatter()
public createdAt!: Date;
```

It converts the date into a readable en-IN locale format.

---

### User Class

Represents the user model:

* Stores user details
* Preserves raw createdAt value
* Manages editable state

---

### Validation Logic

```ts
validateUser(user: User): string[]
```

Validates user input fields:

* First and last name are required
* Email must be valid
* Phone number must be 10 digits
* Address cannot be empty

---

### GenericStore<T>

```ts
class GenericStore<T extends { editing: boolean }>
```

A reusable generic data store that:

* Maintains original and working copies of data
* Supports reset, update, and delete operations
* Restores proper object types such as Date objects

---

### UserTable Class

```ts
class UserTable implements IUserCRUD
```

Handles all table-related behavior:

* Rendering rows
* Attaching button events
* Managing edit, save, cancel, and delete actions
* Interacting with the DOM

---

## UI Behavior

* Load Data displays the table with user data
* Refresh Data restores the original dataset
* Edit enables inline editing for a row
* Save validates and updates user data
* Cancel discards changes and exits edit mode
* Delete removes the selected user

---

## How to Run

1. Compile the TypeScript files:

```bash
npx tsc
```

2. Open index.html in a browser

---

## Learning Outcomes

From this project, you can learn:

* Practical usage of TypeScript decorators
* Real-world implementation of generics
* OOP principles with DOM manipulation
* Clean separation of data logic and UI logic

---

## Author

Md Shuaib
