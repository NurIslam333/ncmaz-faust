import { QueryGetPostsByUserReactQuery } from "@/__generated__/graphql";
import { QUERY_GET_POSTS_BY_USER_REACTION } from "@/fragments/queries";
import { getApolloClient } from "@faustwp/core";
import type { NextApiRequest, NextApiResponse } from "next";

export type CMSPostsByReactionResponseData = {
  data?: QueryGetPostsByUserReactQuery | null;
  error?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CMSPostsByReactionResponseData>
) {
  const client = getApolloClient();
  const param = req.query.param || null;

  if (!param) {
    res
      .status(400)
      .send({ error: "Param is required and must be like: [userSlug, REACTION_TYPE]" });
    return;
  }

  // param is an array, join it to create inUserAndReaction string
  // e.g., ["userSlug", "LIKE"] -> "userSlug/LIKE"
  const inUserAndReaction = Array.isArray(param) 
    ? param.join('/') 
    : param;

  const after = typeof req.query.after === 'string' ? req.query.after : undefined;
  const first = req.query.first 
    ? parseInt(typeof req.query.first === 'string' ? req.query.first : req.query.first[0], 10)
    : 20;

  try {
    const { data, error, errors } = await client
      .query({
        query: QUERY_GET_POSTS_BY_USER_REACTION,
        variables: {
          inUserAndReaction,
          after,
          first,
        },
      })
      .then((result) => result);
    
    if (error || errors) {
      res.status(500).send({ error: "Failed to fetch data" });
      return;
    }
    
    res.status(200).send({ data });
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch data" });
  }
}
