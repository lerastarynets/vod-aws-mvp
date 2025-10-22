import type { NextApiRequest, NextApiResponse } from "next";

const getVideoStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(400).end();
  }
};

export default getVideoStatus;
