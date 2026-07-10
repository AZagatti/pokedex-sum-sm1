import { getBerry } from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  try {
    const berry = await getBerry(params.name);
    return { berry };
  } catch {
    error(404, `Berry "${params.name}" could not be found.`);
  }
};
