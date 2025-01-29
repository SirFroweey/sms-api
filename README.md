
# Scalable SMS Processing and Query System

## Objective
Design and implement a scalable backend service to process and query SMS messages using **Node.js** and a relational database like **PostgreSQL** or **sqlite**. You may use typescript if you want but it is not required. This assignment should take around 3 hrs to complete.

---


## Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Install your preferred relational db & node database and/or orm package**:
---

## Requirements

### 1. Input
Create a RESTful endpoint to handle incoming SMS message data:
```json
{
  "from": "+1234567890",
  "to": "+0987654321",
  "message": "Hello, world!"
}
```

- **Validation**:
  - Proper phone number format (`+<country_code><number>`) adhering to the E.164 standard (you may use any 3rd party packages if needed).
  - Message length (max 160 characters).
  - Rate-limiting: No more than **5 messages per minute** from the same sender (`from`).

### 2. Message Processing
- Save the SMS message data to a **PostgreSQL database** with the following schema:
  - **sms_messages**:
    - `id` (UUID, primary key)
    - `from` (string)
    - `to` (string)
    - `message` (string)
    - `received_at` (timestamp)
    - `status` (ENUM: `received`, `stored`, `processed`)

- **Deduplication**:
  - Avoid saving duplicate messages from the same sender to the same recipient within a **2-second window**.

### 3. Query Endpoint
Provide a second endpoint to query stored messages:
- Endpoint: `/messages`
- Query parameters:
  - `from` (optional): Filter messages by sender.
  - `to` (optional): Filter messages by recipient.
  - `status` (optional): Filter by message status.
- Include **pagination**:
  - Default: 10 results per page.
  - Adjustable via `?limit=` and `?offset=`.

### 4. Media Attachment
Provide additional table(s) to upload and store a media attachments for each message, you may use local drive storage for the sake of this project:
- Modify the `messages` table to support this feature.
- Provide a way to make sure the same media attachment is not uploaded and stored multiple times in file storage or the database.
- Provide an endpoint to query the media attachment(s) for a specific message. via `/messages/:id/media`.
- limit the upload file type to images only.

### 5. Testing
- Include a way to test your solutions for (you don't have to go overboard testing every single feature):
  - Input validation.
  - Deduplication logic.
  - Rate-limiting.
  - Query endpoint(s).
  - File upload.
---

---

## Design Questions (written answers, no code required)
1. **Serverless**:
   - How would you design the system & migrate your solution to be serverless with aws lambdas to ensure scalability?

2. **Authentication**:
   - How would you implement authentication for the RESTful endpoints?

3. **Security**:
   - How would you secure the RESTful endpoints, the database, and the message contents?

4. **Real-Time Metrics**:
   - Imagine you need to provide a lightweight monitoring endpoint `/metrics` to return:
   - Explain the queries, additional tables, and functions you would use to calculate these metrics.
      - Total messages processed.
      - Current queue size.
      - Average message processing time.

5. **Scalability**:
   - How would you scale your solution to handle a large number of messages per second?
   - What are the bottlenecks in your current design?

---

## Deliverables
1. **Codebase**:
   - Node.js project structured for readability and maintainability.
   - Include `package.json` with dependencies and scripts for local testing.

2. **Database Schema**:
   - Use orm or SQL script to create the database schema.
   - Include indexes for optimizing queries & performance.

3. **README**:
   - Setup instructions.
   - Scalability considerations.

4. **Tests**:
   - Include test cases and instructions to run them.

---

## Submission
1. Please remove `node_modules` folder and zip up the project folder before emailing your solution to `team@people.capital`.
2. You have 7 days to complete the assignment from the date you receive it.
3. If you have any questions or need clarification, please email `team@people.capital`.

---
