## Problem

Visiting `/dashboard` (and any route that reads `analyses`) returns:

```
403  permission denied for function has_role
```

The `analyses` RLS policies reference `public.has_role(auth.uid(), 'coach')`. Postgres evaluates the policy as the calling role (`authenticated` / `anon`), and that role has no EXECUTE privilege on `has_role`, so every query against `analyses` fails — surfacing as "Something went wrong" in the UI.

## Fix

Single migration that grants EXECUTE on the security-definer helper to the API roles:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO authenticated, anon, service_role;
```

`has_role` is already `SECURITY DEFINER` with a locked `search_path`, so granting EXECUTE is safe — callers still can't read `user_roles` directly, they can only ask "does this user have this role?".

## Verification

1. Reload `/dashboard` as the signed-in student — past readings list loads (empty state, no error toast).
2. Re-check network: `GET /rest/v1/analyses` returns `200 []`.
3. Coach dashboard (`/coach`) loads for a user with the `coach` role.

No app code changes needed.
