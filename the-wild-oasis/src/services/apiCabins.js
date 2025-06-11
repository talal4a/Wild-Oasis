import supabase, { supabaseUrl } from "./supaBase";
export async function getCabins() {
  let { data, error } = await supabase.from("cabins").select("*");
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }
  return data;
}
export async function createEditCabin(newCabin, id) {
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);
  const isFile = newCabin.image instanceof File;
  const imageName = isFile
    ? `${Math.random()}-${newCabin.image.name}`.replaceAll("/", "")
    : null;
  const imagePath = hasImagePath
    ? newCabin.image
    : isFile
      ? `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`
      : newCabin.image;

  let query = supabase.from("cabins");
  if (!id) {
    // Insert the new cabin
    const { data, error } = await query.insert([{ ...newCabin, image: imagePath }]).select().single();
    if (error) {
      console.error(error);
      throw new Error("Cabin could not be created");
    }
    // Only upload if image is a File
    if (isFile) {
      const { error: storageError } = await supabase.storage
        .from("cabin-images")
        .upload(imageName, newCabin.image);
      if (storageError) {
        // Optionally delete the cabin if image upload fails
        await supabase.from("cabins").delete().eq("id", data.id);
        throw new Error("Cabin image could not be uploaded and cabin was deleted");
      }
    }
    return data;
  }
  if (id) {
    const { data, error } = await supabase
      .from("cabins")
      .update({ ...newCabin, image: imagePath })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error("Cabin could not be updated");
    }
    if (hasImagePath || !isFile) return data;

    const { error: storageError } = await supabase.storage
      .from("cabin-images")
      .upload(imageName, newCabin.image);
    if (storageError) {
      await supabase.from("cabins").delete().eq("id", data.id);
      throw new Error("Cabin image could not be uploaded and cabin was deleted");
    }
    return data;
  }
}
export async function deleteCabin(id) {
  const { data, error } = await supabase.from("cabins").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be deleted");
  }
  return data;
}
