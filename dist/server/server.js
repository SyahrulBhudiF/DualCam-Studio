import { createMemoryHistory } from "@tanstack/history";
import { mergeHeaders, json } from "@tanstack/router-core/ssr/client";
import { isRedirect, isNotFound, defaultSerovalPlugins, makeSerovalPlugin, rootRouteId, createSerializationAdapter, isResolvedRedirect, executeRewriteInput } from "@tanstack/router-core";
import { AsyncLocalStorage } from "node:async_hooks";
import { getOrigin, attachRouterServerSsrUtils } from "@tanstack/router-core/ssr/server";
import { H3Event, toResponse, setCookie as setCookie$1, parseCookies } from "h3-v2";
import invariant from "tiny-invariant";
import { toCrossJSONStream, toCrossJSONAsync, fromJSON } from "seroval";
import { jsx } from "react/jsx-runtime";
import { defineHandlerCallback, renderRouterToStream } from "@tanstack/react-router/ssr/server";
import { RouterProvider } from "@tanstack/react-router";
function StartServer(props) {
  return /* @__PURE__ */ jsx(RouterProvider, { router: props.router });
}
const defaultStreamHandler = defineHandlerCallback(
  ({ request, router, responseHeaders }) => renderRouterToStream({
    request,
    router,
    responseHeaders,
    children: /* @__PURE__ */ jsx(StartServer, { router })
  })
);
const TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
const TSS_SERVER_FUNCTION = Symbol.for("TSS_SERVER_FUNCTION");
const TSS_SERVER_FUNCTION_FACTORY = Symbol.for(
  "TSS_SERVER_FUNCTION_FACTORY"
);
const X_TSS_SERIALIZED = "x-tss-serialized";
const X_TSS_RAW_RESPONSE = "x-tss-raw";
const startStorage = new AsyncLocalStorage();
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) {
    throw new Error(
      `No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return context;
}
const getStartOptions = () => getStartContext().startOptions;
const getStartContextServerOnly = getStartContext;
const createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") {
    resolvedOptions.method = "GET";
  }
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) {
            newMiddleware.push(...m.options.middleware);
          }
        } else {
          newMiddleware.push(m);
        }
      });
      const newOptions = {
        ...resolvedOptions,
        middleware: newMiddleware
      };
      const res2 = createServerFn(void 0, newOptions);
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      const newOptions = { ...resolvedOptions, inputValidator };
      return createServerFn(void 0, newOptions);
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = { ...resolvedOptions, extractedFn, serverFn };
      const resolvedMiddleware = [
        ...newOptions.middleware || [],
        serverFnBaseToMiddleware(newOptions)
      ];
      return Object.assign(
        async (opts) => {
          return executeMiddleware$1(resolvedMiddleware, "client", {
            ...extractedFn,
            ...newOptions,
            data: opts?.data,
            headers: opts?.headers,
            signal: opts?.signal,
            context: {}
          }).then((d) => {
            if (d.error) throw d.error;
            return d.result;
          });
        },
        {
          // This copies over the URL, function ID
          ...extractedFn,
          // The extracted function on the server-side calls
          // this function
          __executeServer: async (opts, signal) => {
            const startContext = getStartContextServerOnly();
            const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
            const ctx = {
              ...extractedFn,
              ...opts,
              context: {
                ...serverContextAfterGlobalMiddlewares,
                ...opts.context
              },
              signal,
              request: startContext.request
            };
            return executeMiddleware$1(resolvedMiddleware, "server", ctx).then(
              (d) => ({
                // Only send the result and sendContext back to the client
                result: d.result,
                error: d.error,
                context: d.sendContext
              })
            );
          }
        }
      );
    }
  };
  const fun = (options2) => {
    return {
      ...res,
      options: {
        ...res.options,
        ...options2
      }
    };
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  const globalMiddlewares = getStartOptions()?.functionMiddleware || [];
  const flattenedMiddlewares = flattenMiddlewares([
    ...globalMiddlewares,
    ...middlewares
  ]);
  const next = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) {
      return ctx;
    }
    if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") {
      ctx.data = await execValidator(
        nextMiddleware.options.inputValidator,
        ctx.data
      );
    }
    let middlewareFn = void 0;
    if (env === "client") {
      if ("client" in nextMiddleware.options) {
        middlewareFn = nextMiddleware.options.client;
      }
    } else if ("server" in nextMiddleware.options) {
      middlewareFn = nextMiddleware.options.server;
    }
    if (middlewareFn) {
      return applyMiddleware(middlewareFn, ctx, async (newCtx) => {
        return next(newCtx).catch((error) => {
          if (isRedirect(error) || isNotFound(error)) {
            return {
              ...newCtx,
              error
            };
          }
          throw error;
        });
      });
    }
    return next(ctx);
  };
  return next({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || {}
  });
}
function flattenMiddlewares(middlewares) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware) => {
    middleware.forEach((m) => {
      if (m.options.middleware) {
        recurse(m.options.middleware);
      }
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares);
  return flattened;
}
const applyMiddleware = async (middlewareFn, ctx, nextFn) => {
  return middlewareFn({
    ...ctx,
    next: (async (userCtx = {}) => {
      return nextFn({
        ...ctx,
        ...userCtx,
        context: {
          ...ctx.context,
          ...userCtx.context
        },
        sendContext: {
          ...ctx.sendContext,
          ...userCtx.sendContext ?? {}
        },
        headers: mergeHeaders(ctx.headers, userCtx.headers),
        result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
        error: userCtx.error ?? ctx.error
      });
    })
  });
};
function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = validator["~standard"].validate(input);
    if (result instanceof Promise)
      throw new Error("Async validation not supported");
    if (result.issues)
      throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) {
    return validator.parse(input);
  }
  if (typeof validator === "function") {
    return validator(input);
  }
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    _types: void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, ...ctx }) => {
        const payload = {
          ...ctx,
          // switch the sendContext over to context
          context: sendContext
        };
        const res = await options.extractedFn?.(payload);
        return next(res);
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  const start = getStartOptions();
  const adapters = start?.serializationAdapters;
  return [
    ...adapters?.map(makeSerovalPlugin) ?? [],
    ...defaultSerovalPlugins
  ];
}
const eventStorage = new AsyncLocalStorage();
function requestHandler(handler) {
  return (request, requestOpts) => {
    const h3Event = new H3Event(request);
    const response = eventStorage.run(
      { h3Event },
      () => handler(request, requestOpts)
    );
    return toResponse(response, h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) {
    throw new Error(
      `No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return event.h3Event;
}
function getCookies() {
  const event = getH3Event();
  return parseCookies(event);
}
function setCookie(name, value, options) {
  const event = getH3Event();
  setCookie$1(event, name, value, options);
}
function getResponse() {
  const event = getH3Event();
  return event._res;
}
async function getStartManifest() {
  const { tsrStartManifest } = await import("./assets/_tanstack-start-manifest_v-DCQuRXpR.js");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let script = `import('${startManifest.clientEntry}')`;
  rootRoute.assets.push({
    tag: "script",
    attrs: {
      type: "module",
      suppressHydrationWarning: true,
      async: true
    },
    children: script
  });
  const manifest2 = {
    ...startManifest,
    routes: Object.fromEntries(
      Object.entries(startManifest.routes).map(([k, v]) => {
        const { preloads, assets } = v;
        const result = {};
        if (preloads) {
          result["preloads"] = preloads;
        }
        if (assets) {
          result["assets"] = assets;
        }
        return [k, result];
      })
    )
  };
  return manifest2;
}
const manifest = { "71c38f09d976428ac23b9ebab9ed0203ca97f165e6b36327f3cd59a1c781cfd9": {
  functionName: "fetchUser_createServerFn_handler",
  importer: () => import("./assets/user-C1Rsx4wv.js")
}, "5d915414e128485b9cfc4370e1a52ef1680ac1505550dbaf2563dc40703d8597": {
  functionName: "loginFn_createServerFn_handler",
  importer: () => import("./assets/user-C1Rsx4wv.js")
}, "824d00d7bf86be64fa9028cbb78809702cc4117e22633944cca1deb8bea782d7": {
  functionName: "logoutFn_createServerFn_handler",
  importer: () => import("./assets/user-C1Rsx4wv.js")
}, "28df697674671c9fb16b3db29f5a9d226391352e31981f6dd9be68520cf0f562": {
  functionName: "signupFn_createServerFn_handler",
  importer: () => import("./assets/user-C1Rsx4wv.js")
}, "7a1329b1a12481f02ee132e314df924b3a454551fb4068240f89334c897f4300": {
  functionName: "getResponses_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "d91d66b5f9e75cae63df6735b12886343545f7fdd148613d178e1dc46d022cdd": {
  functionName: "getResponseById_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "dfc57c314271a67778cbd574504c6a2f33c4d0584eb5d677f9bc89165d8f32a6": {
  functionName: "getResponsesByQuestionnaireId_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "29b255e74ff36b54081e4184e128576155b89190e873db423c676abdb4e3e8f4": {
  functionName: "deleteResponses_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "760b8b09a8b9e6912bed111d063a6c4d1dfd4aa67df90b586d7298e8dae794c9": {
  functionName: "getResponsesFiltered_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "2151d4a87186934f74d5f76057b31d03b779bce8de7ea04d182a26f8b01fc65a": {
  functionName: "getFilterOptions_createServerFn_handler",
  importer: () => import("./assets/responses-lDKfL2-W.js")
}, "f5f348858b0f538d7a03206b70b71bc050feded4b8e1b425434c8a5c5c0eafaa": {
  functionName: "getActiveQuestionnaire_createServerFn_handler",
  importer: () => import("./assets/questionnaire-BXuM74Sp.js")
}, "46df931824726e3e5ebc7a81cf1e7e9a24519f57175c41c69bf47fb6f8668677": {
  functionName: "submitQuestionnaire_createServerFn_handler",
  importer: () => import("./assets/questionnaire-BXuM74Sp.js")
}, "d4e9f6a71adb307cd6f0443a2087e8e28d583c455580fc59b05c5f4959c4bb45": {
  functionName: "getQuestionnaires_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "fef31e51cf696ef67d80ddc1c7ca7ee019dab8cc06954ad925dd049bd532ed65": {
  functionName: "getQuestionnaireById_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "2d3e5f9ba282f60017732b1d74a3fbe3bf1c3175bc3906572c5bc3842e50cb8a": {
  functionName: "createQuestionnaire_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "bedf3ec58a548bc7f6de1dc6e70cd8de32e28b340dfd37b6badf1b4d011a5138": {
  functionName: "updateQuestionnaire_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "ed79761e74bd29c43e4b1e5f3117a359dbccb80d6fc97fd7add5a2323f7f69f3": {
  functionName: "deleteQuestionnaires_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "caa23b2b9c63d73da9bba55f4b6b9aedd27e0439c81f14f38266df72965ee87e": {
  functionName: "getQuestionsByQuestionnaireId_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "367f2cb38437a2da0055feb228b98c8f848b3a7575cd6056e7943c6f6b7b27c9": {
  functionName: "getQuestionById_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "274890f00997a4a090cb1dcd3fbb6f528523f4dbd070f5489111b01ff6d975ea": {
  functionName: "createQuestion_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "91f5351acf24e4de38474d2a7fe7d8ae83b43cafeae60dd717b1eb75566baad4": {
  functionName: "updateQuestion_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "e27d155c42cca6cdd1251e96a01ec4f630be378ec9d166c628e1a9eb6eb635ec": {
  functionName: "deleteQuestions_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "ad7b8c3fe4a79426d62a7aa0f45d2348d78028f7e445534592810fa5de06d592": {
  functionName: "getAnswersByQuestionId_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "f6f849659e6310a46abe03205b1affe4a27f0637a699dd248137fe11cf6ce617": {
  functionName: "createAnswer_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "7b378dda31e177eef3f8fad7fb9533ef75d60fd096afb3a3e07860b94aa65f09": {
  functionName: "updateAnswer_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "902264e6135f311ffeaf16a67659711ec00e2a6577d026a915b7ec9461bac9c7": {
  functionName: "deleteAnswers_createServerFn_handler",
  importer: () => import("./assets/questionnaires-C8cR3QaL.js")
}, "31be1e1d2d362bd89cbc7da6f88d35c6f2d4e201de6e7f3f2ee89f8c95bf65f4": {
  functionName: "getDashboardSummary_createServerFn_handler",
  importer: () => import("./assets/dashboard-BECrwXHq.js")
}, "6cf315d311faa1ac025a91e738dff247aea5e4dce166e46385cdb15b9b191a3f": {
  functionName: "getDashboardBreakdown_createServerFn_handler",
  importer: () => import("./assets/dashboard-BECrwXHq.js")
}, "5f70027ea85b5069399ec9bfec69093a0defb10ca9515a4194590d955ef2909a": {
  functionName: "getAnalyticsDetails_createServerFn_handler",
  importer: () => import("./assets/dashboard-BECrwXHq.js")
}, "3e8463c2903c7b1d998228770fd196c4f38b030596578bf6a4a4fe5d9dc87c44": {
  functionName: "uploadVideoChunk_createServerFn_handler",
  importer: () => import("./assets/segmented-upload-D8Ht_hkM.js")
}, "6e10dc167003492fe41b5184f0702cab32b56085f4fe3d4ec79d1a719175f784": {
  functionName: "submitSegmentedResponse_createServerFn_handler",
  importer: () => import("./assets/segmented-upload-D8Ht_hkM.js")
} };
async function getServerFnById(id) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = await serverFnInfo.importer();
  if (!fnModule) {
    console.info("serverFnInfo", serverFnInfo);
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    console.info("serverFnInfo", serverFnInfo);
    console.info("fnModule", fnModule);
    throw new Error(
      `Server function module export not resolved for serverFn ID: ${id}`
    );
  }
  return action;
}
let regex = void 0;
const handleServerAction = async ({
  request,
  context
}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort);
  if (regex === void 0) {
    regex = new RegExp(`${"/_serverFn/"}([^/?#]+)`);
  }
  const method = request.method;
  const url = new URL(request.url, "http://localhost:3000");
  const match = url.pathname.match(regex);
  const serverFnId = match ? match[1] : null;
  const search = Object.fromEntries(url.searchParams.entries());
  const isCreateServerFn = "createServerFn" in search;
  if (typeof serverFnId !== "string") {
    throw new Error("Invalid server action param for serverFnId: " + serverFnId);
  }
  const action = await getServerFnById(serverFnId);
  const formDataContentTypes = [
    "multipart/form-data",
    "application/x-www-form-urlencoded"
  ];
  const contentType = request.headers.get("Content-Type");
  const serovalPlugins = getDefaultSerovalPlugins();
  function parsePayload(payload) {
    const parsedPayload = fromJSON(payload, { plugins: serovalPlugins });
    return parsedPayload;
  }
  const response = await (async () => {
    try {
      let result = await (async () => {
        if (formDataContentTypes.some(
          (type) => contentType && contentType.includes(type)
        )) {
          invariant(
            method.toLowerCase() !== "get",
            "GET requests with FormData payloads are not supported"
          );
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData
          };
          if (typeof serializedContext === "string") {
            try {
              const parsedContext = JSON.parse(serializedContext);
              if (typeof parsedContext === "object" && parsedContext) {
                params.context = { ...context, ...parsedContext };
              }
            } catch {
            }
          }
          return await action(params, signal);
        }
        if (method.toLowerCase() === "get") {
          invariant(
            isCreateServerFn,
            "expected GET request to originate from createServerFn"
          );
          let payload = search.payload;
          payload = payload ? parsePayload(JSON.parse(payload)) : {};
          payload.context = { ...context, ...payload.context };
          return await action(payload, signal);
        }
        if (method.toLowerCase() !== "post") {
          throw new Error("expected POST method");
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) {
          jsonPayload = await request.json();
        }
        if (isCreateServerFn) {
          const payload = jsonPayload ? parsePayload(jsonPayload) : {};
          payload.context = { ...payload.context, ...context };
          return await action(payload, signal);
        }
        return await action(...jsonPayload);
      })();
      if (result.result instanceof Response) {
        result.result.headers.set(X_TSS_RAW_RESPONSE, "true");
        return result.result;
      }
      if (!isCreateServerFn) {
        result = result.result;
        if (result instanceof Response) {
          return result;
        }
      }
      if (isNotFound(result)) {
        return isNotFoundResponse(result);
      }
      const response2 = getResponse();
      let nonStreamingBody = void 0;
      if (result !== void 0) {
        let done = false;
        const callbacks = {
          onParse: (value) => {
            nonStreamingBody = value;
          },
          onDone: () => {
            done = true;
          },
          onError: (error) => {
            throw error;
          }
        };
        toCrossJSONStream(result, {
          refs: /* @__PURE__ */ new Map(),
          plugins: serovalPlugins,
          onParse(value) {
            callbacks.onParse(value);
          },
          onDone() {
            callbacks.onDone();
          },
          onError: (error) => {
            callbacks.onError(error);
          }
        });
        if (done) {
          return new Response(
            nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0,
            {
              status: response2?.status,
              statusText: response2?.statusText,
              headers: {
                "Content-Type": "application/json",
                [X_TSS_SERIALIZED]: "true"
              }
            }
          );
        }
        const stream = new ReadableStream({
          start(controller2) {
            callbacks.onParse = (value) => controller2.enqueue(JSON.stringify(value) + "\n");
            callbacks.onDone = () => {
              try {
                controller2.close();
              } catch (error) {
                controller2.error(error);
              }
            };
            callbacks.onError = (error) => controller2.error(error);
            if (nonStreamingBody !== void 0) {
              callbacks.onParse(nonStreamingBody);
            }
          }
        });
        return new Response(stream, {
          status: response2?.status,
          statusText: response2?.statusText,
          headers: {
            "Content-Type": "application/x-ndjson",
            [X_TSS_SERIALIZED]: "true"
          }
        });
      }
      return new Response(void 0, {
        status: response2?.status,
        statusText: response2?.statusText
      });
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      if (isNotFound(error)) {
        return isNotFoundResponse(error);
      }
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(
        await Promise.resolve(
          toCrossJSONAsync(error, {
            refs: /* @__PURE__ */ new Map(),
            plugins: serovalPlugins
          })
        )
      );
      const response2 = getResponse();
      return new Response(serializedError, {
        status: response2?.status ?? 500,
        statusText: response2?.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
  request.signal.removeEventListener("abort", abort);
  return response;
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
const HEADERS = {
  TSS_SHELL: "X-TSS_SHELL"
};
const createServerRpc = (functionId, splitImportFn) => {
  return Object.assign(splitImportFn, {
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ functionId }) => ({ functionId }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      const serverFn = await getServerFnById(functionId);
      const result = await serverFn(opts ?? {}, signal);
      return result.result;
    };
    return createServerRpc(functionId, fn);
  }
});
function getStartResponseHeaders(opts) {
  const headers = mergeHeaders(
    {
      "Content-Type": "text/html; charset=utf-8"
    },
    ...opts.router.state.matches.map((match) => {
      return match.headers;
    })
  );
  return headers;
}
function createStartHandler(cb) {
  const ROUTER_BASEPATH = "/";
  let startRoutesManifest = null;
  let startEntry = null;
  let routerEntry = null;
  const getEntries = async () => {
    if (routerEntry === null) {
      routerEntry = await import("./assets/router-BmiHf_ZJ.js").then((n) => n.H);
    }
    if (startEntry === null) {
      startEntry = await import("./assets/start-HYkvq4Ni.js");
    }
    return {
      startEntry,
      routerEntry
    };
  };
  const originalFetch = globalThis.fetch;
  const startRequestResolver = async (request, requestOpts) => {
    const origin = getOrigin(request);
    globalThis.fetch = async function(input, init) {
      function resolve(url2, requestOptions) {
        const fetchRequest = new Request(url2, requestOptions);
        return startRequestResolver(fetchRequest, requestOpts);
      }
      if (typeof input === "string" && input.startsWith("/")) {
        const url2 = new URL(input, origin);
        return resolve(url2, init);
      } else if (typeof input === "object" && "url" in input && typeof input.url === "string" && input.url.startsWith("/")) {
        const url2 = new URL(input.url, origin);
        return resolve(url2, init);
      }
      return originalFetch(input, init);
    };
    const url = new URL(request.url);
    const href = url.href.replace(url.origin, "");
    let router = null;
    const getRouter = async () => {
      if (router) return router;
      router = await (await getEntries()).routerEntry.getRouter();
      const isPrerendering = process.env.TSS_PRERENDERING === "true";
      let isShell = process.env.TSS_SHELL === "true";
      if (isPrerendering && !isShell) {
        isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
      }
      const history = createMemoryHistory({
        initialEntries: [href]
      });
      router.update({
        history,
        isShell,
        isPrerendering,
        origin: router.options.origin ?? origin,
        ...{
          defaultSsr: startOptions.defaultSsr,
          serializationAdapters: [
            ...startOptions.serializationAdapters || [],
            ...router.options.serializationAdapters || []
          ]
        },
        basepath: ROUTER_BASEPATH
      });
      return router;
    };
    const startOptions = await (await getEntries()).startEntry.startInstance?.getOptions() || {};
    startOptions.serializationAdapters = startOptions.serializationAdapters || [];
    startOptions.serializationAdapters.push(ServerFunctionSerializationAdapter);
    const requestHandlerMiddleware = handlerToMiddleware(
      async ({ context }) => {
        const response2 = await runWithStartContext(
          {
            getRouter,
            startOptions,
            contextAfterGlobalMiddlewares: context,
            request
          },
          async () => {
            try {
              if (href.startsWith("/_serverFn/")) {
                return await handleServerAction({
                  request,
                  context: requestOpts?.context
                });
              }
              const executeRouter = async ({
                serverContext
              }) => {
                const requestAcceptHeader = request.headers.get("Accept") || "*/*";
                const splitRequestAcceptHeader = requestAcceptHeader.split(",");
                const supportedMimeTypes = ["*/*", "text/html"];
                const isRouterAcceptSupported = supportedMimeTypes.some(
                  (mimeType) => splitRequestAcceptHeader.some(
                    (acceptedMimeType) => acceptedMimeType.trim().startsWith(mimeType)
                  )
                );
                if (!isRouterAcceptSupported) {
                  return json(
                    {
                      error: "Only HTML requests are supported here"
                    },
                    {
                      status: 500
                    }
                  );
                }
                if (startRoutesManifest === null) {
                  startRoutesManifest = await getStartManifest();
                }
                const router2 = await getRouter();
                attachRouterServerSsrUtils({
                  router: router2,
                  manifest: startRoutesManifest
                });
                router2.update({ additionalContext: { serverContext } });
                await router2.load();
                if (router2.state.redirect) {
                  return router2.state.redirect;
                }
                await router2.serverSsr.dehydrate();
                const responseHeaders = getStartResponseHeaders({ router: router2 });
                const response4 = await cb({
                  request,
                  router: router2,
                  responseHeaders
                });
                return response4;
              };
              const response3 = await handleServerRoutes({
                getRouter,
                request,
                executeRouter,
                context
              });
              return response3;
            } catch (err) {
              if (err instanceof Response) {
                return err;
              }
              throw err;
            }
          }
        );
        return response2;
      }
    );
    const flattenedMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
    const middlewares = flattenedMiddlewares.map((d) => d.options.server);
    const ctx = await executeMiddleware(
      [...middlewares, requestHandlerMiddleware],
      {
        request,
        context: requestOpts?.context || {}
      }
    );
    const response = ctx.response;
    if (isRedirect(response)) {
      if (isResolvedRedirect(response)) {
        if (request.headers.get("x-tsr-redirect") === "manual") {
          return json(
            {
              ...response.options,
              isSerializedRedirect: true
            },
            {
              headers: response.headers
            }
          );
        }
        return response;
      }
      if (response.options.to && typeof response.options.to === "string" && !response.options.to.startsWith("/")) {
        throw new Error(
          `Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(response.options)}`
        );
      }
      if (["params", "search", "hash"].some(
        (d) => typeof response.options[d] === "function"
      )) {
        throw new Error(
          `Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(
            response.options
          ).filter((d) => typeof response.options[d] === "function").map((d) => `"${d}"`).join(", ")}`
        );
      }
      const router2 = await getRouter();
      const redirect = router2.resolveRedirect(response);
      if (request.headers.get("x-tsr-redirect") === "manual") {
        return json(
          {
            ...response.options,
            isSerializedRedirect: true
          },
          {
            headers: response.headers
          }
        );
      }
      return redirect;
    }
    return response;
  };
  return requestHandler(startRequestResolver);
}
async function handleServerRoutes({
  getRouter,
  request,
  executeRouter,
  context
}) {
  const router = await getRouter();
  let url = new URL(request.url);
  url = executeRewriteInput(router.rewrite, url);
  const pathname = url.pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(
    pathname,
    void 0
  );
  const middlewares = flattenMiddlewares(
    matchedRoutes.flatMap((r) => r.options.server?.middleware).filter(Boolean)
  ).map((d) => d.options.server);
  const server = foundRoute?.options.server;
  if (server) {
    if (server.handlers) {
      const handlers = typeof server.handlers === "function" ? server.handlers({
        createHandlers: (d) => d
      }) : server.handlers;
      const requestMethod = request.method.toUpperCase();
      const handler = handlers[requestMethod] ?? handlers["ANY"];
      if (handler) {
        const mayDefer = !!foundRoute.options.component;
        if (typeof handler === "function") {
          middlewares.push(handlerToMiddleware(handler, mayDefer));
        } else {
          const { middleware } = handler;
          if (middleware && middleware.length) {
            middlewares.push(
              ...flattenMiddlewares(middleware).map((d) => d.options.server)
            );
          }
          if (handler.handler) {
            middlewares.push(handlerToMiddleware(handler.handler, mayDefer));
          }
        }
      }
    }
  }
  middlewares.push(
    handlerToMiddleware((ctx2) => executeRouter({ serverContext: ctx2.context }))
  );
  const ctx = await executeMiddleware(middlewares, {
    request,
    context,
    params: routeParams,
    pathname
  });
  const response = ctx.response;
  return response;
}
function throwRouteHandlerError() {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      `It looks like you forgot to return a response from your server route handler. If you want to defer to the app router, make sure to have a component set in this route.`
    );
  }
  throw new Error("Internal Server Error");
}
function throwIfMayNotDefer() {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      `You cannot defer to the app router if there is no component defined on this route.`
    );
  }
  throw new Error("Internal Server Error");
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) {
    return handler;
  }
  return async ({ next: _next, ...rest }) => {
    const response = await handler({ ...rest, next: throwIfMayNotDefer });
    if (!response) {
      throwRouteHandlerError();
    }
    return response;
  };
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (ctx2) => {
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx2;
    let result;
    try {
      result = await middleware({
        ...ctx2,
        // Allow the middleware to call the next middleware in the chain
        next: async (nextCtx) => {
          const nextResult = await next({
            ...ctx2,
            ...nextCtx,
            context: {
              ...ctx2.context,
              ...nextCtx?.context || {}
            }
          });
          return Object.assign(ctx2, handleCtxResult(nextResult));
        }
        // Allow the middleware result to extend the return context
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        result = {
          response: err
        };
      } else {
        throw err;
      }
    }
    return Object.assign(ctx2, handleCtxResult(result));
  };
  return handleCtxResult(next(ctx));
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) {
    return {
      response: result
    };
  }
  return result;
}
function isSpecialResponse(err) {
  return isResponse(err) || isRedirect(err);
}
function isResponse(response) {
  return response instanceof Response;
}
const fetch = createStartHandler(defaultStreamHandler);
const serverEntry = {
  // Providing `RequestHandler` from `@tanstack/react-start/server` is required so that the output types don't import it from `@tanstack/start-server-core`
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  fetch
};
export {
  TSS_SERVER_FUNCTION as T,
  createServerRpc as a,
  getCookies as b,
  createServerFn as c,
  serverEntry as default,
  getServerFnById as g,
  setCookie as s
};
