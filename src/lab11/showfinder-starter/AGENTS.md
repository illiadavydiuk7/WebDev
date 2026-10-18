# ShowFinder — Agent Rules

## TVmaze API
- Use `https://api.tvmaze.com` as the API base URL.
- Search shows with `GET /search/shows?q=<query>`. Trim the query and URL-encode it.
- Search returns an array of `{ score, show }` objects. Use `result.show` for show data and preserve API result order.
- Fetch full show details with `GET /shows/:id?embed[]=episodes&embed[]=cast`.
- Embedded data is available in `_embedded.episodes` and `_embedded.cast`. Do not fetch episodes or cast members one by one.
- Check `response.ok` before reading a response as successful data. `fetch` does not reject on HTTP errors such as 404 or 500.
- A successful search returning `[]` means no matches, not a request failure.
- Handle 404, 429, and server errors appropriately. For 429, wait 2–5 seconds and retry once; do not retry indefinitely.
- TVmaze documents a rate limit of at least 20 calls per 10 seconds per IP. Avoid unnecessary requests.
- API responses are JSON. Optional show fields such as `image`, `summary`, `network`, `webChannel`, `runtime`, and dates may be `null`.
- TVmaze API endpoints support CORS. Use ordinary GET requests without unnecessary custom headers. Do not use `mode: 'no-cors'` to bypass CORS errors.
- Respect HTTP caching headers. The API may cache responses for 60 minutes; use an application cache when previously loaded show details must reopen without another request.
- Attribute TVmaze as the data source and respect its CC BY-SA 4.0 license.

## Project rules
- Keep API requests in `src/api.js` and application state and event handling in `src/app.js`.
- Use the existing rendering functions from `src/view.js`; do not rewrite the view unnecessarily.
- Pass `AbortSignal` to requests that may become obsolete. Ignore aborted requests and prevent stale responses from replacing newer results.
- Run independent requests in parallel when multiple requests are necessary.
- Cache complete show details by show ID, including episodes and cast.
- Keep search results usable while show details load. Set and clear `aria-busy` on the relevant region.
- Distinguish loading, empty results, and errors in the UI. Log technical details to the console, not as raw error messages for users.
- Do not add dependencies or change unrelated code without a clear reason.
- Never modify `check.html`, the `check/` directory, or `offline.html`.
- After changes, inspect the diff and run the relevant checks. Report what changed and what was verified.