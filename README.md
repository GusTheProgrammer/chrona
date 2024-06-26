# Chrona

### Environment setup

First, create a `.env.local` file in the root directory of the project with the following variables:

```
DATABASE_URL=postgres://user:password@localhost:5432/db_name
SMTP_SERVER=smtp.host.com
SMTP_PORT=465
SMTP_USER=user@host.com
SMTP_KEY=password
```

Make sure to replace `user`, `password`, and `db_name` with your own Postgres credentials, and `smtp.host.com`, `user@host.com`, and `password` with your own SMTP credentials.

## DB Setup

This step involves creating a custom function in your PostgreSQL instance. This can be done manually or by using a bash script.

### Automated Process

You can use a bash script to automate the migration creation, function addition, and migration execution. Execute the script `./prisma_migrate.sh`.

### Manual Process

1. Create a blank migration:

```bash
npx prisma migrate dev --create-only
```

You can name this migration 'nanoid'. Then, open the file created by the migration.

2. Paste the Nano ID function at the top of the migration file:

```bash
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(64) := 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 63) + 1; -- + 1 because substr starts at 1 for some reason
    id := id || substr(urlAlphabet, pos, 1);
    i = i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE PLPGSQL STABLE;
```

3. Add the Trigger Function and View at the bottom of the same migration file as described in the provided SQL statements.

```sql
CREATE OR REPLACE FUNCTION generate_user_scheduler()
RETURNS TRIGGER AS $$
DECLARE
    new_shift_id TEXT;
    date_counter DATE;
BEGIN
    -- Set the date counter to start from January 1, 2024
    date_counter := '2024-01-01';

    -- Loop through each day for two years to create unique shifts and assign to schedulers
    FOR i IN 1..730 LOOP -- 365 days * 2 years
        -- Generate a unique shift ID using the 'nanoid' function
        new_shift_id := nanoid();

        IF EXTRACT(DOW FROM date_counter) IN (6, 0) THEN
            -- For Saturday (6) and Sunday (0), use alternate data
            INSERT INTO shifts (id, name, color, "startTime", "endTime", "createdAt", "updatedAt")
            VALUES
                (new_shift_id, '', '', date_counter + INTERVAL '9 hour', date_counter + INTERVAL '17 hour', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        ELSE
            -- For other days, use default shift values
            INSERT INTO shifts (id, name, color, "startTime", "endTime", "createdAt", "updatedAt")
            VALUES
                (new_shift_id, 'Working from Office', 'bg-blue-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500', date_counter + INTERVAL '8 hour', date_counter + INTERVAL '16 hour', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        END IF;

        -- Insert a scheduler entry with the new shift, using the teamId from the newly inserted user
        INSERT INTO "schedulers" ("userId", "teamId", "shiftId", "date", "createdAt", "updatedAt")
        VALUES
            (NEW."id", NEW."teamId", new_shift_id, date_counter, NOW(), NOW());

        -- Increment the date by one day
        date_counter := date_counter + INTERVAL '1 day';
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger to call the function after a new user is inserted
CREATE TRIGGER after_user_insert
AFTER INSERT ON "users"
FOR EACH ROW
EXECUTE FUNCTION generate_user_scheduler();

CREATE OR REPLACE VIEW "SchedulerCalendar" AS
SELECT
    s."id" AS scheduler_id,
    s."date" AS datestamp,
    u."id" as user_id,
    u."name" AS fullname,
    u."email" AS email,
    t."name" AS team_name,
    t."id" AS team_id,
    sh."id" AS shift_id,
    sh."name" AS shift_name,
    sh."color" AS shift_color,
    sh."startTime" AS start_time,
    sh."endTime" AS end_time
FROM
    "schedulers" s
LEFT JOIN
    "users" u ON s."userId" = u."id"
LEFT JOIN
    "teams" t ON s."teamId" = t."id"
LEFT JOIN
    "shifts" sh ON s."shiftId" = sh."id";
```

4. Run the migration:

```bash
npx prisma migrate dev
```

### Starting the development server

To start the development server, run:

```bash
npm run dev
```

### Seeding data

To seed data, make a GET request to `http://localhost:3000/api/seeds?secret=ts&option=reset` in your browser or with a tool like Postman. This will create default user roles and permissions and create a default admin user with the email and password are `gus@chrona.me`.
