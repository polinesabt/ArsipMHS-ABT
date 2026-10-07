-- Defense in depth: demo login and tokens are also rejected in application code.
UPDATE users SET is_active = 0 WHERE role = 'demo' AND is_active = 1;
