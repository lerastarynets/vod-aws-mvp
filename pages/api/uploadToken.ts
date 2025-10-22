import type { NextApiRequest, NextApiResponse } from "next";

const getUploadToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json({ token: "test" });
  } catch (error) {
    res.status(400).end();
  }
};

export default getUploadToken;
