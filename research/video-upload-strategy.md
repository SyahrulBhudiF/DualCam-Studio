# Research: browser video upload strategies for React / TanStack Start

## Summary
For recorded video, **do not base64-encode** the payload unless you have a tiny, text-only transport constraint. Prefer **multipart/form-data with File/Blob** for normal uploads, and **chunked/resumable uploads** for larger MediaRecorder blobs; if you need true streaming, use **fetch ReadableStream + `duplex: 'half'`** or a TanStack **server route / raw handler**, not a normal server-function input path.

## Findings
1. **Base64 is worst for upload efficiency** — MDN says Base64 is typically ~1/3 larger than the source data, and `readAsDataURL()` converts the Blob/File into a data URL string. That makes it a poor fit for video because you pay extra bytes on the wire and force a full string encoding step before upload. [MDN Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64), [MDN FileReader.readAsDataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)

2. **`fetch()` already accepts binary bodies directly** — the request body can be a `Blob`, `File`, `FormData`, or `ReadableStream`. That means the browser can send a recorded `Blob` without base64, and multipart is the native choice when you need form fields + file together. [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

3. **TanStack Start server functions fit `FormData`, not large raw upload streams** — Start docs show POST server functions handling `FormData` directly and extracting a `File` on the server. They are same-origin RPC endpoints, so they are good for moderate uploads and app-internal workflows. [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

4. **For large uploads, TanStack’s raw request path is the right primitive** — Start server routes are documented for raw HTTP requests and `request.formData()/json()/text()`, and the raw-handler work explicitly says it enables streaming large file uploads directly without buffering in memory. That is the right shape when the blob is too big for normal server-function parsing. [TanStack Start server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes), [TanStack rawHandler PR](https://github.com/TanStack/router/pull/5708)

5. **Chunked upload is the best fit for MediaRecorder blobs** — the MediaRecorder API can emit periodic chunks via `timeslice`, and the Mux example uploads 8 MB chunks with `PUT` + `Content-Range`, retry logic, and sequential locking. This is the most robust pattern for long recordings because it caps memory, tolerates failure, and avoids one giant request. [MDN MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), [Mux example README](https://github.com/muxinc/examples/tree/main/mediarecorder-streaming-uploads)

6. **True fetch streaming exists but is not the universal default** — streaming request bodies require `ReadableStream` plus `duplex: 'half'`, and MDN marks `duplex` as not baseline / limited availability. So streaming is attractive for advanced pipelines, but chunked uploads are still the safer cross-browser choice today. [MDN Request.duplex](https://developer.mozilla.org/en-US/docs/Web/API/Request/duplex)

7. **Progress reporting favors chunked/XHR-style uploads over plain fetch** — MDN documents upload progress events on `XMLHttpRequest.upload`, while fetch progress is not generally available in the same way. If you need user-visible upload progress for video, chunked upload gives you cleaner progress semantics. [MDN XMLHttpRequest upload progress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_XMLHttpRequest)

## Sources
- Kept: MDN Base64 — defines the ~33% size overhead; key anti-pattern for this question.
- Kept: MDN FileReader.readAsDataURL — shows base64/data URL conversion path.
- Kept: MDN Fetch API / FormData — proves Blob/File/FormData/ReadableStream upload support.
- Kept: TanStack Start server functions — documents POST FormData upload support in Start.
- Kept: TanStack Start server routes — documents raw HTTP request handling.
- Kept: TanStack rawHandler PR #5708 — explicit streaming-upload rationale for server functions.
- Kept: MDN MediaRecorder — documents timeslice chunking and Blob emission.
- Kept: Mux mediarecorder-streaming-uploads example — concrete chunked upload implementation.
- Kept: MDN Request.duplex — streaming upload compatibility caveat.
- Kept: MDN XMLHttpRequest upload progress — progress reporting reference.
- Dropped: StackOverflow base64 thread — anecdotal; MDN already covered the point.
- Dropped: generic blog “design a file uploader” — useful but commentary-heavy; primary sources were enough.

## Gaps
- Exact browser support matrix for `ReadableStream` request uploads in your target browsers not fully answered.
- Exact TanStack Start release status of `rawHandler` vs PR only; docs for the stable API may differ.
- If you need direct-to-storage uploads (S3/Mux/GCS), the best final design depends on your backend and resumable protocol.

## Recommendation
- **Small/moderate video:** `FormData` + `File/Blob` posted to a TanStack Start **POST server function**.
- **Large recorded MediaRecorder blobs:** split by `timeslice` and upload **chunks** with `PUT/PATCH` to a server route or direct-storage endpoint; keep a resumable protocol.
- **Avoid base64** except as a last-resort compatibility hack.
- **Use fetch streaming** only if you control browser support and want a stream-first pipeline.
