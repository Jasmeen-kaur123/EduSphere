const express = require('express');
const aws = require('aws-sdk');
const router = express.Router();

const s3 = new aws.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Generate a presigned upload URL
router.get('/upload-url', async (req, res) => {
  try {
    const { key, contentType } = req.query;
    if (!key) return res.status(400).json({ error: 'Missing key parameter' });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read'
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    res.json({ uploadUrl });
  } catch (error) {
    console.error('S3 upload url error', error);
    res.status(500).json({ error: 'Unable to generate upload URL' });
  }
});

module.exports = router;
