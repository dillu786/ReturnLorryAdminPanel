
import { S3Client,GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

export async function getObjectSignedUrl(key:string) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }
  
    try{
        const command = new GetObjectCommand(params);
        const seconds = 600
        const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
      
        return url
    }
    // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  catch(error:any){
    console.log(error);
  }
  }