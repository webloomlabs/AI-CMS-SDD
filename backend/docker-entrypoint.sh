#!/bin/sh
set -e

echo "🚀 Starting AI-CMS Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (if not already generated)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding failed or already completed"
fi

echo "✅ Database setup complete!"

# Start the application
echo "🎉 Starting application server..."
exec node dist/index.js
