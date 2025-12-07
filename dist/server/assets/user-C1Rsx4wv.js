import { a as createServerRpc, c as createServerFn } from "../server.js";
import { redirect } from "@tanstack/react-router";
import { l as loginSchema, s as signupSchema } from "./user-B3mpcRFy.js";
import { g as getSupabaseServerClient } from "./supabase-0PR4I26a.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "zod";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
const fetchUser_createServerFn_handler = createServerRpc("71c38f09d976428ac23b9ebab9ed0203ca97f165e6b36327f3cd59a1c781cfd9", (opts, signal) => {
  return fetchUser.__executeServer(opts, signal);
});
const fetchUser = createServerFn({
  method: "GET"
}).handler(fetchUser_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error: _error
  } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return null;
  }
  return {
    email: data.user.email
  };
});
const loginFn_createServerFn_handler = createServerRpc("5d915414e128485b9cfc4370e1a52ef1680ac1505550dbaf2563dc40703d8597", (opts, signal) => {
  return loginFn.__executeServer(opts, signal);
});
const loginFn = createServerFn({
  method: "POST"
}).inputValidator(loginSchema).handler(loginFn_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
});
const logoutFn_createServerFn_handler = createServerRpc("824d00d7bf86be64fa9028cbb78809702cc4117e22633944cca1deb8bea782d7", (opts, signal) => {
  return logoutFn.__executeServer(opts, signal);
});
const logoutFn = createServerFn().handler(logoutFn_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signOut();
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
  throw redirect({
    href: "/"
  });
});
const signupFn_createServerFn_handler = createServerRpc("28df697674671c9fb16b3db29f5a9d226391352e31981f6dd9be68520cf0f562", (opts, signal) => {
  return signupFn.__executeServer(opts, signal);
});
const signupFn = createServerFn({
  method: "POST"
}).inputValidator(signupSchema).handler(signupFn_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  });
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
  throw redirect({
    href: data.redirectUrl || "/"
  });
});
export {
  fetchUser_createServerFn_handler,
  loginFn_createServerFn_handler,
  logoutFn_createServerFn_handler,
  signupFn_createServerFn_handler
};
