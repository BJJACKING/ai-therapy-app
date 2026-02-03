-- MindAI Database Initialization
-- This file is executed when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE mindai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mindai')\gexec

-- Create user if it doesn't exist
SELECT 'CREATE USER mindai WITH PASSWORD ''mindai_password'''
WHERE NOT EXISTS (SELECT FROM pg_user WHERE usename = 'mindai')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mindai TO mindai;
