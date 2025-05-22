
## User

| Field     | Type     | Required | Description                       |
| --------- | -------- | -------- | --------------------------------- |
| _id       | ObjectID | yes      | Automatically generated unique ID |
| name      | String   | yes      | Full name of the user             |
| email     | String   | yes      | User’s email address (unique)    |
| password  | String   | no       | Hashed password (for auth tasks)  |
| createdAt | Date     | yes      | Timestamp when user was created   |

---

## Book

| Field     | Type     | Required | Description                             |
| --------- | -------- | -------- | --------------------------------------- |
| _id       | ObjectID | yes      | Automatically generated unique ID       |
| title     | String   | yes      | Title of the book                       |
| author    | String   | yes      | Author name                             |
| ownerId   | ObjectID | yes      | Reference to the owning User’s `_id` |
| createdAt | Date     | yes      | Timestamp when record was created       |

---

## ReadingLog

| Field     | Type     | Required | Description                        |
| --------- | -------- | -------- | ---------------------------------- |
| _id       | ObjectID | yes      | Automatically generated unique ID  |
| bookId    | ObjectID | yes      | Reference to a Book’s `_id`     |
| date      | Date     | yes      | Date of the reading session        |
| notes     | String   | yes      | Notes or summary from that session |
| createdAt | Date     | yes      | Timestamp when record was created  |
