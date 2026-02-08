CREATE OR REPLACE FUNCTION generate_user_scheduler()
RETURNS TRIGGER AS $$
DECLARE
    new_shift_id TEXT;
    date_counter DATE;
BEGIN
    -- Set the date counter to start from January 1, 2024
    date_counter := CURRENT_DATE;

    -- Loop through each day for 30 days to create shifts and assign to schedulers
    FOR i IN 1..30 LOOP -- 30 days only 
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