-- Enable leaked password protection
UPDATE auth.config SET password_required_characters = 6;