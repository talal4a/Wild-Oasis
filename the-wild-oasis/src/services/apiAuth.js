import supabase from "./supaBase";
export default async function apiAuth() {
  let { data, error } = await supabase.auth.signInWithPassword({
    email: "someone@email.com",
    password: "srJCmJsKiqdvUIghZHpb",
  });
}
