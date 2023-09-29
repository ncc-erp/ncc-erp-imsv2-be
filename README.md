# Information Management System (IMS)
The Information Management System (IMS) is a specialized and advanced software solution designed to streamline, enhance, and optimize communication between an organization and its employees. This system serves as a dedicated platform for delivering critical notifications, updates, and relevant information to employees in a timely and efficient manner, fostering effective internal communication and engagement.

This project was bootstrapped with [Nestjs](https://docs.nestjs.com/) and uses [Postgres](https://www.postgresql.org/) for building modern web applications.

## Getting Started

1. **Clone the repository:**

2. **Prerequisites**
    - [Node.js 18](https://nodejs.org/en) and [yarn](https://yarnpkg.com) installed.

3. **Install Dependencies**
    ```bash
    yarn install
    yarn prepare
    yarn build
    ```

4. **Setup environment variable**

     Add `.env.dev`, `.env.local` and `.env.stg` config in root folder

   ```
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=imsv2
   DB_LOGGING=true
   NODE_ENV=development

   # ERP tools's API endpoints
   TIMESHEET_URL=
   TIMESHEET_SECURITY=

   HRM_URL=
   HRM_SECURITY=

   # etc...
    ```
5. **Start Development Server**

   - To create a new module, use

   ```bash
      $ nest g resource <name>
   ```

   - For example, when run `$ nest g resource post`. It will generate a CRUD example module with structure as below

   ```
      post
      └─── dto
      │   │   create-post.dto.ts
      │   │   update-post.dto.ts
      │
      └─── entities
      │   │   post.entity.ts
      │
      │    post.controller.spec.ts
      │    post.controller.ts
      │    post.module.ts
      │    post.service.spec.ts
      │    post.service.ts
   ```


    ```bash
    yarn start:debug
    ```
6. **Migrations**

    All migrations are stored inside src/migrations folder  
    Remember to specified NAME and ENV

    ```bash
    # First run generate with NAME = yearMonthDayHourMinuteSecond_your_migration_name
    # Example 202302091036_Add_table_test
    $ ENV=<env_name> yarn migration:generate <name>

    # Then run that migration
    $ ENV=<env_name> yarn migration:run

    # To revert, run
    $ ENV=<env_name> yarn migration:revert
    ```

7. **Test E2E**
      Require Docker desktop to run Postgres container

   ```bash
   yarn test:e2e

   #Run 1 test
   yarn test <testName>
   ```
## Deployment 

1. Build project

    ```bash
    yarn build 
    ```
    Build file on folder `dist`

2. Run by PM2

    ```bash
    yarn add -g pm2
    cat <<EOF > "ecosystem.config.js"
    module.exports = {
        apps: [{
        name: 'imsv2-prod',
        script: 'dist/main.js',
        time: true,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        env_production: {
            NODE_ENV: "production",
            ENV: "prod"
            }
        }]
    }
    pm2 start ecosystem.config.js --env production
    ```

## Project Structure
```
ncc-erp-imsv2-be
├── GUIDE.md
├── README.md
├── azure-pipelines.develop.yml
├── azure-pipelines.staging.yml
├── nest-cli.json
├── package.json
├── reports
│   └── e2e
├── rest.http
├── scripts
│   └── migration.sh
├── src
│   ├── app.module.ts
│   ├── client
│   ├── common
│   ├── config
│   ├── entities
│   ├── features
│   ├── logger
│   ├── main.ts
│   ├── mapping
│   ├── middleware
│   ├── migrations
│   ├── schedulers
│   ├── types
│   └── utils
├── test
│   ├── album
│   ├── app.e2e-spec.ts
│   ├── base
│   ├── comment
│   ├── jest-e2e.json
│   ├── news
│   ├── resources
│   ├── role
│   ├── user
│   └── widget
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock
```

## License
The MIT License (MIT)

Copyright (c) <year> NCC Plus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.






