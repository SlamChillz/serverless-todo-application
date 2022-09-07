import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const imagesBucketName = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const AttachmentUtils = async (imageId: string) => {
  return s3.getSignedUrl('putObject', {
    Bucket: imagesBucketName,
    Key: imageId,
    Expires: signedUrlExpiration
  })
}
