#!/bin/bash

# Define the path to the SQL files
NANO_ID_FUNCTION_SQL="./nanoid_function.sql"
OTHER_FUNCTIONS_SQL="./scheduler_functions.sql"

# Step 0: Delete the migrations folder if it exists
MIGRATIONS_DIR="prisma/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
    echo "Deleting existing migrations folder..."
    rm -rf "$MIGRATIONS_DIR"
fi

# Step 1: Create a blank migration named 'nanoid'
npx prisma migrate reset --force
npx prisma migrate dev --create-only --name nanoid

# Step 2: Find the latest migration file created by Prisma in the newly created migrations directory
LATEST_MIGRATION_FILE=$(find prisma/migrations -type f -name "*.sql" | sort | tail -n 1)

# Check if the migration file was found
if [ -z "$LATEST_MIGRATION_FILE" ]; then
    echo "Migration file not found."
    exit 1
fi

# Step 3: Prepend the nano ID function and append other functions to the migration file

# Prepend Nano ID function
cat "$NANO_ID_FUNCTION_SQL" "$LATEST_MIGRATION_FILE" > temp_file.sql && mv temp_file.sql "$LATEST_MIGRATION_FILE"

# Append other functions
cat "$OTHER_FUNCTIONS_SQL" >> "$LATEST_MIGRATION_FILE"

# Step 4: Run the migration
npx prisma migrate dev
