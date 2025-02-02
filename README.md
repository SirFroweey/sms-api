
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
   - How would you design the system & migrate your solution to be serverless with aws lambdas to ensure scalability? **Answer: I would switch to Aurora Postgres Serverless. Then I would refactor the API into individual endpoints via API Gateway. Each endpoint would effectively be migrated into a single Lambda function. This would: promote better scalability (horizontally scale Lambdas with more traffic), reduce costs since an Express JS API costs more to spin up and run (more memory), more availability since each endpoint is independent, latency would drop since we wouldn't be wasting resources spinning up the entire Express API/faster cold boot, pave the way for easier authentication implementations via JWT Tokens and AWS Cognito/IAM where we would take advantage of AWS provided services and validators rather than hard-coding our own implementations, less tech debt since each independent Lambda/endpoint will be more manageable to maintain and the API(s) won't be part of a giant monolithic application in the long run. Finally, I would build out a AWS s3 bucket integration so file uploads are stored on S3, encrypted with KMS, and are referenced on our database table. The provisioning of AWS resources would be conducted via (IaC) the serverless framework or terraform depending on what our team is utilizing.**

2. **Authentication**:
   - How would you implement authentication for the RESTful endpoints? **Answer: Like mentioned in the above answer, I would defer to AWS Cognito/IAM with JWT tokens. A auth Lambda would be created to generate the JWT token. Then that token would be utilized during subsequent Lambda API calls.**

3. **Security**:
   - How would you secure the RESTful endpoints, the database, and the message contents? **Answer: I would secure the endpoints with AWS Cognito auth tokens. If we consider using AWS Amplify for our (Typescript) full-stack needs, we could sign our API requests. For the database, leverage AWS SSM for secrets. Assign AWS VPC for database to same group as Lambas (required); along with setting Public Accessibility to No. We could also utilize AWS KMS to encrypt sensitive information including message contents. KMS is a great option since it handles most of the overhead that normally requires a significant amount of manpower, including the rotation of keys.**

4. **Real-Time Metrics**:
   - Imagine you need to provide a lightweight monitoring endpoint `/metrics` to return:
   - Explain the queries, additional tables, and functions you would use to calculate these metrics.
      - Total messages processed.
      - Current queue size.
      - Average message processing time.

   **Answer: I would introduce a new table  named `statistics`. This table would be populated during the processing of every message input. The table could be composed of the following columns: `id`, `message_id`(foreign-key), `timestamp` (the time the message was processed), and `processing_time` (the time taken to process the given message in ms). I would then query this table to get the total messages processed via `SELECT COUNT(*) AS total_messages_processed FROM messages;
`. Then we could then do `SELECT COUNT(*) AS current_queue_size FROM messages WHERE status = 'pending';` to calculate the current size of the queue and can count how many messages are currently in a `pending` status in the messages table. We could finally get the average message processing time via `SELECT AVG(processing_time) AS average_processing_time FROM statistics;`.**

5. **Scalability**:
   - How would you scale your solution to handle a large number of messages per second? **Answer: The immediate answer is to horizontally scale individual endpoints that require high availability and performance via a Load Balancer. This would require (as I hinted in other answers), refactoring the API to leverage API Gateway and AWS Lamba's to encapsulate each endpoint into its own independent piece. On the software side, we can implement  implement caching on GET endpoints like the /messages endpoint. We could also impose rate limits on ALL endpoints requiring high availability and performance. Furthermore, we can improve performance by establishing proper use of proper asynchronous coding patterns.**
   - What are the bottlenecks in your current design? **Answer: Given the web application is a monolithic express JS API it would become increasingly difficult to scale as time goes by and the project grows in size. We cannot scale individual endpoints that require extra performance by vertical scaling, nor could we horizontally scale endpoints that require high availability. Also, the cold start/boot of the current design would be much slower than leveraging an API Gateway modeled application. Furthermore, If we tried scaling this application the costs would also be higher since more resources are required to run it.**

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

## David Almendarez - Additions Below

### Running the project

1. First CD into the root project directory and run: `npm install` from inside the root directory.
2. Then run the tests via `npm run test` or, `docker-compose up` from inside the root directory.
3. Then run the API locally via `npm run start` or `docker-compose up` from inside the root directory.
4. API accessible locally at: `http://localhost:8000/`.

### Running tests
From inside the root project directory run: `npm run test` or `docker-compose up`.

It should yield similar results as below:

```
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        12.584 s
Ran all test suites matching /.\\tests/i.
```

---
